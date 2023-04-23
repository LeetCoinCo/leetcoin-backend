#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod escrow {
    use ink_prelude::collections::HashMap;

    #[ink(storage)]
    pub struct Escrow {
        seller: AccountId,
        buyer: AccountId,
        amount: Balance,
        status: EscrowStatus,
        authorized_callers: HashMap<AccountId, bool>,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum EscrowStatus {
        Locked,
        Released,
        Refunded,
    }

    #[ink(event)]
    pub struct LockFunds {
        #[ink(topic)]
        seller: AccountId,
        #[ink(topic)]
        buyer: AccountId,
        #[ink(topic)]
        amount: Balance,
    }

    #[ink(event)]
    pub struct ReleaseFunds {
        #[ink(topic)]
        seller: AccountId,
        #[ink(topic)]
        buyer: AccountId,
        #[ink(topic)]
        amount: Balance,
    }

    #[ink(event)]
    pub struct RefundFunds {
        #[ink(topic)]
        seller: AccountId,
        #[ink(topic)]
        buyer: AccountId,
        #[ink(topic)]
        amount: Balance,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        Unauthorized,
    }

    impl Escrow {
        #[ink(constructor)]
        pub fn new(seller: AccountId, buyer: AccountId, amount: Balance) -> Self {
            Self {
                seller,
                buyer,
                amount,
                status: EscrowStatus::Locked,
                authorized_callers: HashMap::new(),
            }
        }

        #[ink(message)]
        pub fn lock_funds(&mut self) {
            self.env().emit_event(LockFunds {
                seller: self.seller,
                buyer: self.buyer,
                amount: self.amount,
            });
        }

        #[ink(message)]
        pub fn release_funds(&mut self) -> Result<(), Error> {
            let caller = self.env().caller();
            if !self.authorized_callers.contains_key(&caller) || caller != self.buyer {
                return Err(Error::Unauthorized);
            }
            self.env().transfer(self.seller, self.amount)?;
            self.status = EscrowStatus::Released;
            self.env().emit_event(ReleaseFunds {
                seller: self.seller,
                buyer: self.buyer,
                amount: self.amount,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn refund_funds(&mut self) -> Result<(), Error> {
            let caller = self.env().caller();
            if !self.authorized_callers.contains_key(&caller) || caller != self.seller {
                return Err(Error::Unauthorized);
            }
            self.env().transfer(self.buyer, self.amount)?;
            self.status = EscrowStatus::Refunded;
            self.env().emit_event(RefundFunds {
                seller: self.seller,
                buyer: self.buyer,
                amount: self.amount,
            });
            Ok(())
        }

        #[ink(message)]
        pub fn get_status(&self) -> EscrowStatus {
            self.status
        }

        #[ink(message)]
        pub fn authorize_caller(&mut self, caller: AccountId) {
            let _ = self.authorized_callers.insert(caller, true);
        }

        #[ink(message)]
        pub fn revoke_authorization(&mut self, caller: AccountId) {
            let _ = self.authorized_callers.take(&caller);
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn test_lock_funds() {
            let mut escrow = Escrow::new(AccountId::from([0x1; 32]), AccountId::from([0x2; 32]), 100);
            assert_eq!(escrow.get_status(), EscrowStatus::Locked);

            let lock_funds_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "LockFunds"))
                .expect("no LockFunds event was emitted");
            assert_eq!(lock_funds_event.event, "LockFunds");
            assert_eq!(lock_funds_event.args[0].clone().into_account_id(), AccountId::from([0x1; 32]));
            assert_eq!(lock_funds_event.args[1].clone().into_account_id(), AccountId::from([0x2; 32]));
            assert_eq!(lock_funds_event.args[2].clone().into_balance(), 100);
        }

        #[ink::test]
        fn test_release_funds() {
            let mut escrow = Escrow::new(AccountId::from([0x1; 32]), AccountId::from([0x2; 32]), 100);
            escrow.release_funds();
            assert_eq!(escrow.get_status(), EscrowStatus::Released);

            let release_funds_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "ReleaseFunds"))
                .expect("no ReleaseFunds event was emitted");
            assert_eq!(release_funds_event.event, "ReleaseFunds");
            assert_eq!(release_funds_event.args[0].clone().into_account_id(), AccountId::from([0x1; 32]));
            assert_eq!(release_funds_event.args[1].clone().into_account_id(), AccountId::from([0x2; 32]));
            assert_eq!(release_funds_event.args[2].clone().into_balance(), 100);
        }

        #[ink::test]
        fn test_refund_funds() {
            let mut escrow = Escrow::new(AccountId::from([0x1; 32]), AccountId::from([0x2; 32]), 100);
            escrow.refund_funds();
            assert_eq!(escrow.get_status(), EscrowStatus::Refunded);

            let refund_funds_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "RefundFunds"))
                .expect("no RefundFunds event was emitted");
            assert_eq!(refund_funds_event.event, "RefundFunds");
            assert_eq!(refund_funds_event.args[0].clone().into_account_id(), AccountId::from([0x1; 32]));
            assert_eq!(refund_funds_event.args[1].clone().into_account_id(), AccountId::from([0x2; 32]));
            assert_eq!(refund_funds_event.args[2].clone().into_balance(), 100);
        }

        #[ink::test]
        fn test_refund_funds_unauthorized() {
            let mut escrow = Escrow::new(AccountId::from([0x1; 32]), AccountId::from([0x2; 32]), 100);
            assert_eq!(escrow.get_status(), EscrowStatus::Locked);

            // try to refund funds from a non-seller account
            let unauthorized_caller = AccountId::from([0x3; 32]);
            assert_eq!(
                escrow.refund_funds_with_call(
                    ink_env::test::Call::new(unauthorized_caller, 0)
                ),
                Err(Error::Unauthorized)
            );

            // check that the status has not changed
            assert_eq!(escrow.get_status(), EscrowStatus::Locked);

            // check that no events have been emitted
            let emitted_events = ink_env::test::emitted_events();
            assert!(emitted_events.iter().all(|event| event.event != "ReleaseFunds"));
            assert!(emitted_events.iter().all(|event| event.event != "RefundFunds"));
        }
    }
}
