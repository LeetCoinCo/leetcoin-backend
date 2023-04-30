import { Request, Response } from "express";
import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring, decodeAddress } from '@polkadot/keyring';
import { signatureVerify } from '@polkadot/util-crypto';
import { Codec } from '@polkadot/types/types';
import { createHash } from 'crypto';
import {  v4 as uuidv4  } from 'uuid';
import { User } from "../models";
import { UserRepo } from "../storage/userRepo";

interface AccountWithMeta extends Codec {
  data: {
    publicKey: string;
  }
  meta: {
    documentation: string[];
  };
}


// Set up the keyring
const keyring = new Keyring({ type: 'sr25519' });

async function initializePolkadotProvider() {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  return await ApiPromise.create({ provider });
}

async function verifySignature(address: string, signature: string, message: string): Promise<boolean> {
  const api = await initializePolkadotProvider();
  const account = await api.query.system.account(address) as AccountWithMeta;
  const publicKey = account.data.publicKey.toString();
  const keyring = new Keyring({ type: 'sr25519' });
  const signer = keyring.addFromAddress(address);
  const messageBytes = Buffer.from(message, 'utf-8');
  const signatureBytes = Uint8Array.from(Buffer.from(signature, 'hex'));
  const isValid = await signatureVerify(messageBytes, signatureBytes, publicKey);
  return isValid && signer.verify(messageBytes, signatureBytes, publicKey);
}

export async function polkadotAuth(req: Request, res: Response) {
  const userRepo = UserRepo.getInstance();
  const api = await initializePolkadotProvider();
  const { address, signature, message } = req.body;
  if (!address || !signature || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }
  if (!decodeAddress(address)) {
    return res.status(400).json({ error: "Invalid address" });
  }

  try {
    const isValid = await verifySignature(address, signature, message);
    if (!isValid) {
      return res.status(401).json({error: "Unauthorized"});
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to verify signature", error });
  }

  let username = '';
  let hashedPassword = '';
  try {
    const { meta } = await api.query.system.account(address) as AccountWithMeta;
    username = meta.documentation.join(' ');
    hashedPassword = createHash('sha256').update(uuidv4()).digest('hex');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to process username or password", error });
  }

  let existingUser = {
    id: '',
    username: username,
    password: hashedPassword,
    address: address,
    email: '',
  } as User;
  try {
    existingUser = await userRepo.getUserByAddress(address)
  } catch (error) {
    if ((error as Error).message === 'User not found') {
      const userId = uuidv4();
      try {
        await userRepo.createUser(existingUser);
      } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "failed to create new user", error });
      }
      return res.json({ userId });
    } else {
      console.error(error);
      return res.status(500).json({ message: "failed to find existing user by address", error });
    }
  }
  existingUser.password = hashedPassword;
  existingUser.username = username;
  existingUser.address = address;
  try {
    existingUser = await userRepo.updateUser(existingUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "failed to update existing user", error });
  }
  return res.json({ userId: existingUser.id });
}
