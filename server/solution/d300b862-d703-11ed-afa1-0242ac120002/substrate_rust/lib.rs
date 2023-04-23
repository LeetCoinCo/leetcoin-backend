#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod multisig_wallet {
    use ink_prelude::collections::HashMap;
    use ink_prelude::vec::Vec;

    #[ink(storage)]
    pub struct MultisigWallet {
        owners: HashMap<AccountId, bool>,
        required_confirmations: u32,
        transactions: HashMap<u32, (Hash, Balance, AccountId, u32, bool)>,
        confirmations: HashMap<u32, HashMap<AccountId, bool>>,
    }

    impl MultisigWallet {
        #[ink(constructor)]
        pub fn new(required_confirmations: u32) -> Self {
            Self {
                owners: HashMap::new(),
                required_confirmations,
                transactions: HashMap::new(),
                confirmations: HashMap::new(),
            }
        }

        pub fn propose_transaction(
            &mut self,
            to: AccountId,
            value: Balance,
            data: Vec<u8>,
        ) -> Result<u32, Error> {
            let id = self.transactions.len() as u32;
            let tx_hash = Self::hash(&to, value, &data);
            self.transactions.insert(
                id,
                (tx_hash, value, to, 0, false)
            );
            self.confirmations.insert(id, HashMap::new());
            self.emit_propose_transaction(id, tx_hash, to, value, data);
            Ok(id)
        }

        pub fn confirm_transaction(
            &mut self,
            id: u32,
            owner: AccountId,
        ) -> Result<(), Error> {
            let tx = self.transactions.get(&id).ok_or(Error::InvalidTransactionId)?;
            let mut confirmations = self.confirmations.get(&id).ok_or(Error::InvalidTransactionId)?;

            if !self.owners.contains_key(&owner) {
                return Err(Error::Unauthorized);
            }
            if confirmations.contains_key(&owner) {
                return Err(Error::AlreadyConfirmed);
            }

            confirmations.insert(owner, true);
            self.emit_confirm_transaction(id, owner);

            if self.is_confirmed(id) {
                self.execute_transaction(id)?;
            }

            Ok(())
        }

        pub fn execute_transaction(&mut self, id: u32) -> Result<(), Error> {
            let mut tx = self.transactions.get_mut(&id).ok_or(Error::InvalidTransactionId)?;
            let mut confirmations = self.confirmations.remove(&id).ok_or(Error::InvalidTransactionId)?;

            if tx.4 {
                return Err(Error::AlreadyExecuted);
            }
            if !self.is_confirmed(id) {
                return Err(Error::NotEnoughConfirmations);
            }

            for (owner, _) in confirmations.iter() {
                let balance = Self::env().balance(*owner);
                Self::env().transfer(*owner, tx.1).map_err(|_| Error::TransferFailed)?;
            }

            tx.3 = confirmations.len() as u32;
            tx.4 = true;
            self.emit_execute_transaction(id, tx.2, tx.1);

            Ok(())
        }

        pub fn add_owner(&mut self, owner: AccountId) -> Result<(), Error> {
            if self.owners.contains_key(&owner) {
                return Err(Error::AlreadyOwner);
            }
            self.owners.insert(owner, true);
            Ok(())
        }

        pub fn remove_owner(&mut self, owner: AccountId) -> Result<(), Error> {
            if self.owners.len() == 1 {
                return Err(Error::CannotRemoveLastOwner);
            }
            if !self.owners.contains_key(&owner) {
                return Err(Error::NotOwner);
            }
            self.owners.remove(&owner);
            Ok(())
        }

        pub fn is_confirmed(&self, id: u32) -> bool {
            let confirmations = self.confirmations.get(&id).unwrap();
            confirmations.len() >= self.required_confirmations as usize
        }

        pub fn get_transaction_count(&self) -> u32 {
            self.transactions.len() as u32
        }

        pub fn get_transaction(&self, id: u32) -> Option<(Hash, Balance, AccountId, u32, bool)> {
            self.transactions.get(&id).cloned()
        }

        pub fn get_confirmations(&self, id: u32) -> HashMap<AccountId, bool> {
            self.confirmations.get(&id).cloned().unwrap_or_default()
        }

        fn hash(to: &AccountId, value: Balance, data: &[u8]) -> Hash {
            Self::env().hash_of(&(to, value, data))
        }
    }

    #[ink(event)]
    pub struct ProposeTransaction {
        #[ink(topic)]
        id: u32,
        tx_hash: Hash,
        to: AccountId,
        value: Balance,
        data: Vec<u8>,
    }

    #[ink(event)]
    pub struct ConfirmTransaction {
        #[ink(topic)]
        id: u32,
        owner: AccountId,
    }

    #[ink(event)]
    pub struct ExecuteTransaction {
        #[ink(topic)]
        id: u32,
        to: AccountId,
        value: Balance,
    }

    #[ink(event)]
    pub struct AddOwner {
        #[ink(topic)]
        owner: AccountId,
    }

    #[ink(event)]
    pub struct RemoveOwner {
        #[ink(topic)]
        owner: AccountId,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        InvalidTransactionId,
        Unauthorized,
        AlreadyConfirmed,
        AlreadyExecuted,
        NotEnoughConfirmations,
        TransferFailed,
        AlreadyOwner,
        NotOwner,
        CannotRemoveLastOwner,
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink_lang as ink;

        #[ink::test]
        fn test_propose_transaction() {
            let mut wallet = MultisigWallet::new(2);

            let tx_hash = Hash::from([0x1; 32]);
            let to = AccountId::from([0x2; 32]);
            let value = 100;
            let data = vec![0x3; 10];

            assert_eq!(
                wallet.propose_transaction(to, value, data.clone()),
                Ok(0)
            );

            let tx = wallet.get_transaction(0);
            assert_eq!(tx, Some((tx_hash, value, to, 0, false)));
            assert_eq!(wallet.get_confirmations(0), HashMap::new());
            assert_eq!(wallet.get_transaction_count(), 1);

            let emitted_events = ink_env::test::emitted_events();
            assert_eq!(emitted_events.count(), 1);
            assert_eq!(
                emitted_events
                    .into_iter()
                    .next()
                    .expect("no events emitted")
                    .event,
                "ProposeTransaction"
            );
        }

        #[ink::test]
        fn test_confirm_transaction() {
            let mut wallet = MultisigWallet::new(2);

            let tx_hash = Hash::from([0x1; 32]);
            let to = AccountId::from([0x2; 32]);
            let value = 100;
            let data = vec![0x3; 10];
            wallet.propose_transaction(to, value, data.clone()).unwrap();

            let signer1 = AccountId::from([0x4; 32]);
            let signer2 = AccountId::from([0x5; 32]);

            assert_eq!(
                wallet.confirm_transaction(0, signer1),
                Ok(())
            );
            assert_eq!(wallet.get_confirmations(0), hash_map! { signer1 => true });
            assert_eq!(wallet.is_confirmed(0), false);

            assert_eq!(
                wallet.confirm_transaction(0, signer2),
                Ok(())
            );
            assert_eq!(
                wallet.get_confirmations(0),
                hash_map! { signer1 => true, signer2 => true }
            );
            assert_eq!(wallet.is_confirmed(0), true);

            let emitted_events = ink_env::test::emitted_events();
            assert_eq!(emitted_events.count(), 2);
            let events: Vec<_> = emitted_events
                .into_iter()
                .map(|e| e.event)
                .collect();
            assert!(events.contains(&"ConfirmTransaction".to_string()));
            assert!(events.contains(&"ExecuteTransaction".to_string()));
        }

        #[ink::test]
        fn test_execute_transaction() {
            let mut wallet = MultisigWallet::new(2);

            let tx_hash = Hash::from([0x1; 32]);
            let to = AccountId::from([0x2; 32]);
            let value = 100;
            let data = vec![0x3; 10];
            wallet.propose_transaction(to, value, data.clone()).unwrap();

            let signer1 = AccountId::from([0x4; 32]);
            let signer2 = AccountId::from([0x5; 32]);
            wallet.confirm_transaction(0, signer1).unwrap();
            wallet.confirm_transaction(0, signer2).unwrap();

            assert_eq!(
                wallet.execute_transaction(0),
                Ok(())
            );
            assert_eq!(wallet.get_transaction(0), Some((tx_hash, value, to, 2, true)));
            assert_eq!(wallet.get_confirmations(0), HashMap::new());
            assert_eq!(wallet.get_transaction_count(), 1);

            let emitted_events = ink_env::test::emitted_events();
            assert_eq!(emitted_events.count(), 2);
            let events: Vec<_> = emitted_events
                .into_iter()
                .map(|e| e.event)
                .collect();
            assert!(events.contains(&"ExecuteTransaction".to_string()));
        }
    }

    #[ink::test]
    fn test_execute_transaction_not_enough_confirmations() {
        let mut wallet = MultisigWallet::new(2);

        let tx_hash = Hash::from([0x1; 32]);
        let to = AccountId::from([0x2; 32]);
        let value = 100;
        let data = vec![0x3; 10];
        wallet.propose_transaction(to, value, data.clone()).unwrap();

        let signer1 = AccountId::from([0x4; 32]);
        wallet.confirm_transaction(0, signer1).unwrap();

        assert_eq!(
            wallet.execute_transaction(0),
            Err(Error::NotEnoughConfirmations)
        );
        assert_eq!(wallet.get_transaction(0), Some((tx_hash, value, to, 1, false)));
        assert_eq!(
            wallet.get_confirmations(0),
            hash_map! { signer1 => true }
        );
        assert_eq!(wallet.get_transaction_count(), 1);

        let emitted_events = ink_env::test::emitted_events();
        assert_eq!(emitted_events.count(), 0);
    }

    #[ink::test]
    fn test_execute_transaction_already_executed() {
        let mut wallet = MultisigWallet::new(2);

        let tx_hash = Hash::from([0x1; 32]);
        let to = AccountId::from([0x2; 32]);
        let value = 100;
        let data = vec![0x3; 10];
        wallet.propose_transaction(to, value, data.clone()).unwrap();

        let signer1 = AccountId::from([0x4; 32]);
        let signer2 = AccountId::from([0x5; 32]);
        wallet.confirm_transaction(0, signer1).unwrap();
        wallet.confirm_transaction(0, signer2).unwrap();
        wallet.execute_transaction(0).unwrap();

        assert_eq!(
            wallet.execute_transaction(0),
            Err(Error::AlreadyExecuted)
        );
        assert_eq!(wallet.get_transaction(0), Some((tx_hash, value, to, 2, true)));
        assert_eq!(wallet.get_confirmations(0), HashMap::new());
        assert_eq!(wallet.get_transaction_count(), 1);

        let emitted_events = ink_env::test::emitted_events();
        assert_eq!(emitted_events.count(), 1);
        assert_eq!(
            emitted_events
                .into_iter()
                .next()
                .expect("no events emitted")
                .event,
            "ExecuteTransaction"
        );
    }
}

