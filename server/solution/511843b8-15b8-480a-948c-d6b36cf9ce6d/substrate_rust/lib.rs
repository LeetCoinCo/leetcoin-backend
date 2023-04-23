#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod simple_storage {
    #[ink(storage)]
    pub struct SimpleStorage {
        value: u32,
    }

    impl SimpleStorage {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { value: 0 }
        }

        #[ink(message)]
        pub fn get(&self) -> u32 {
            self.value
        }

        #[ink(message)]
        pub fn set(&mut self, value: u32) {
            self.value = value;
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn default_value_should_be_zero() {
            let simple_storage = SimpleStorage::new();
            assert_eq!(simple_storage.get(), 0);
        }

        #[test]
        fn set_value_and_get_value_should_match() {
            let mut simple_storage = SimpleStorage::new();
            let value = 42;
            simple_storage.set(value);
            assert_eq!(simple_storage.get(), value);
        }
    }
}
