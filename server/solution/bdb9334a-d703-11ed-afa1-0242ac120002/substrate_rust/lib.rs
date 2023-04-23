#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod simple_storage {
    #[ink(storage)]
    pub struct SimpleStorage {
        value: ink_storage::collections::HashMap<AccountId, u32>,
    }

    impl SimpleStorage {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                value: Default::default(),
            }
        }

        #[ink(message)]
        pub fn get(&self) -> Option<u32> {
            self.value.get(&self.env().caller()).copied()
        }

        #[ink(message)]
        pub fn set(&mut self, value: u32) {
            self.value.insert(self.env().caller(), value);
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn test_get_and_set() {
            let mut simple_storage = SimpleStorage::new();
            assert_eq!(simple_storage.get(), None);

            let new_value = 42;
            simple_storage.set(new_value);
            assert_eq!(simple_storage.get(), Some(new_value));
        }
    }
}
