#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod simple_token {
    use ink_prelude::vec::Vec;

    #[ink(storage)]
    pub struct SimpleToken {
        balances: ink_prelude::collections::HashMap<AccountId, Balance>,
    }

    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        value: Balance,
    }

    impl SimpleToken {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                balances: Default::default(),
            }
        }

        #[ink(message)]
        pub fn mint(&mut self, to: AccountId, amount: Balance) {
            let sender = self.env().caller();
            self.balances
                .entry(to)
                .and_modify(|balance| *balance += amount)
                .or_insert(amount);
            self.env().emit_event(Transfer {
                from: None,
                to: Some(to),
                value: amount,
            });
        }

        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, amount: Balance) -> bool {
            let sender = self.env().caller();
            let sender_balance = self.balance_of(sender);
            if sender_balance < amount {
                return false;
            }
            self.balances.insert(sender, sender_balance - amount);
            self.balances
                .entry(to)
                .and_modify(|balance| *balance += amount)
                .or_insert(amount);
            self.env().emit_event(Transfer {
                from: Some(sender),
                to: Some(to),
                value: amount,
            });
            true
        }

        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> Balance {
            self.balances.get(&owner).cloned().unwrap_or(0)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn test_mint() {
            let mut token = SimpleToken::new();
            let initial_balance = token.balance_of(AccountId::from([0x1; 32]));
            assert_eq!(initial_balance, 0);

            let amount = 100;
            let to = AccountId::from([0x2; 32]);
            token.mint(to, amount);
            assert_eq!(token.balance_of(to), amount);

            let transfer_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "Transfer"))
                .expect("no transfer event was emitted");
            assert_eq!(transfer_event.event, "Transfer");
            assert_eq!(transfer_event.args[0].clone().into_account_id(), None);
            assert_eq!(transfer_event.args[1].clone().into_account_id(), Some(to));
            assert_eq!(transfer_event.args[2].clone().into_balance(), amount);
        }

        #[ink::test]
        fn test_transfer() {
            let mut token = SimpleToken::new();
            let sender = AccountId::from([0x1; 32]);
            let recipient = AccountId::from([0x2; 32]);
            let amount = 100;
            token.mint(sender, amount);

            let transfer_success = token.transfer(recipient, amount);
            assert!(transfer_success);
            assert_eq!(token.balance_of(sender), 0);
            assert_eq!(token.balance_of(recipient), amount);

            let transfer_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "Transfer"))
                .expect("no transfer event was emitted");
            assert_eq!(transfer_event.event, "Transfer");
            assert_eq!(transfer_event.args[0].clone().into_account_id(), Some(sender));
            assert_eq!(transfer_event.args[1].clone().into_account_id(), Some(recipient));
            assert_eq!(transfer_event.args[2].clone().into_balance(), amount);
        }

        #[ink::test]
        fn test_insufficient_balance_transfer() {
            let mut token = SimpleToken::new();
            let sender = AccountId::from([0x1; 32]);
            let recipient = AccountId::from([0x2; 32]);
            let amount = 100;
            token.mint(sender, amount);

            let transfer_success = token.transfer(recipient, amount + 1);
            assert!(!transfer_success);
            assert_eq!(token.balance_of(sender), amount);
            assert_eq!(token.balance_of(recipient), 0);

            let emitted_events = ink_env::test::emitted_events();
            assert_eq!(emitted_events.len(), 0);
        }

        #[ink::test]
        fn test_balance_of() {
            let mut token = SimpleToken::new();
            let account = AccountId::from([0x1; 32]);
            let amount = 100;
            token.mint(account, amount);

            assert_eq!(token.balance_of(account), amount);
        }
    }
}
