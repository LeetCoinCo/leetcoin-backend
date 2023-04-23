#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod counter {
    #[ink(storage)]
    pub struct Counter {
        value: i32,
    }
    impl Counter {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { value: 0 }
        }

        #[ink(message)]
        pub fn get(&self) -> i32 {
            self.value
        }

        #[ink(message)]
        pub fn increment(&mut self) {
            self.value += 1;
        }

        #[ink(message)]
        pub fn decrement(&mut self) {
            self.value -= 1;
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn test_increment() {
            let mut counter = Counter::new();
            assert_eq!(counter.get(), 0);

            counter.increment();
            assert_eq!(counter.get(), 1);

            counter.increment();
            assert_eq!(counter.get(), 2);
        }

        #[ink::test]
        fn test_decrement() {
            let mut counter = Counter::new();
            assert_eq!(counter.get(), 0);

            counter.decrement();
            assert_eq!(counter.get(), -1);

            counter.decrement();
            assert_eq!(counter.get(), -2);
        }

        #[ink::test]
        fn test_increment_and_decrement() {
            let mut counter = Counter::new();
            assert_eq!(counter.get(), 0);

            counter.increment();
            assert_eq!(counter.get(), 1);

            counter.decrement();
            assert_eq!(counter.get(), 0);
        }
    }
}
