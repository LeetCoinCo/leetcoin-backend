#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod voting {
    use ink_prelude::vec::Vec;

    #[ink(storage)]
    pub struct Voting {
        options: ink_prelude::collections::Vec<(String, u32)>,
        voters: ink_prelude::collections::HashMap<AccountId, bool>,
    }

    #[ink(event)]
    pub struct ProposeOption {
        #[ink(topic)]
        name: String,
    }

    #[ink(event)]
    pub struct Vote {
        #[ink(topic)]
        voter: AccountId,
        #[ink(topic)]
        option_index: u32,
    }

    #[ink(event)]
    pub struct GetResults {
        results: Vec<(String, u32)>,
    }

    impl Voting {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                options: ink_prelude::collections::Vec::new(),
                voters: ink_prelude::collections::HashMap::new(),
            }
        }

        #[ink(message)]
        pub fn propose_option(&mut self, name: String) {
            self.options.push((name.clone(), 0));
            self.env().emit_event(ProposeOption { name });
        }

        #[ink(message)]
        pub fn vote(&mut self, option_index: u32) -> bool {
            let sender = self.env().caller();
            if self.voters.contains_key(&sender) {
                return false;
            }
            if let Some((name, count)) = self.options.get_mut(option_index as usize) {
                *count += 1;
                self.voters.insert(sender, true);
                self.env().emit_event(Vote {
                    voter: sender,
                    option_index,
                });
                return true;
            }
            false
        }

        #[ink(message)]
        pub fn has_voted(&self, voter: AccountId) -> bool {
            self.voters.contains_key(&voter)
        }

        #[ink(message)]
        pub fn get_option_count(&self, option_index: u32) -> u32 {
            if let Some((_, count)) = self.options.get(option_index as usize) {
                *count
            } else {
                0
            }
        }

        #[ink(message)]
        pub fn get_options(&self) -> Vec<(String, u32)> {
            self.options.clone()
        }

        #[ink(message)]
        pub fn get_results(&self) -> Vec<(String, u32)> {
            self.options.clone()
        }

    }

    #[cfg(test)]
    mod tests {
        use super::*;

        use ink_lang as ink;

        #[ink::test]
        fn test_propose_option() {
            let mut voting = Voting::new();
            let option_name = "Option 1".to_string();
            voting.propose_option(option_name.clone());

            let options = voting.get_options();
            assert_eq!(options.len(), 1);
            let (name, count) = options[0];
            assert_eq!(name, option_name);
            assert_eq!(count, 0);

            let propose_option_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "ProposeOption"))
                .expect("no ProposeOption event was emitted");
            assert_eq!(propose_option_event.event, "ProposeOption");
            assert_eq!(propose_option_event.args[0].clone().into_string().unwrap(), option_name);
        }

        #[ink::test]
        fn test_vote() {
            let mut voting = Voting::new();
            let option_name = "Option 1".to_string();
            voting.propose_option(option_name.clone());

            let voter = AccountId::from([0x1; 32]);
            let vote_success = voting.vote(0, {ink_env::test::Call::new(voter, 0)});
            assert!(vote_success);
            assert!(voting.has_voted(voter));
            assert_eq!(voting.get_option_count(0), 1);

            let vote_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "Vote"))
                .expect("no Vote event was emitted");
            assert_eq!(vote_event.event, "Vote");
            assert_eq!(vote_event.args[0].clone().into_account_id(), Some(voter));
            assert_eq!(vote_event.args[1].clone().into_u32(), 0);
        }

        #[ink::test]
        fn test_vote_twice() {
            let mut voting = Voting::new();
            let option_name = "Option 1".to_string();
            voting.propose_option(option_name.clone());

            let voter = AccountId::from([0x1; 32]);
            let vote_success = voting.vote(0, {ink_env::test::Call::new(voter, 0)});
            assert!(vote_success);
            assert!(voting.has_voted(voter));
            assert_eq!(voting.get_option_count(0), 1);

            let vote_success = voting.vote(0, {ink_env::test::Call::new(voter, 0)});
            assert!(!vote_success);
            assert!(voting.has_voted(voter));
            assert_eq!(voting.get_option_count(0), 1);

            let emitted_events = ink_env::test::emitted_events();
            assert_eq!(emitted_events.len(), 1);
        }

        #[ink::test]
        fn test_get_results() {
            let mut voting = Voting::new();
            let option_name_1 = "Option 1".to_string();
            let option_name_2 = "Option 2".to_string();
            voting.propose_option(option_name_1.clone());
            voting.propose_option(option_name_2.clone());

            let voter_1 = AccountId::from([0x1; 32]);
            let voter_2 = AccountId::from([0x2; 32]);
            let voter_3 = AccountId::from([0x3; 32]);
            voting.vote(1, {ink_env::test::Call::new(voter_1, 0)});
            voting.vote(1, {ink_env::test::Call::new(voter_2, 0)});
            voting.vote(1, {ink_env::test::Call::new(voter_3, 0)});
            voting.vote(1, {ink_env::test::Call::new(voter_3, 0)});
            voting.vote(1, {ink_env::test::Call::new(voter_3, 0)});

            let results = voting.get_results();
            assert_eq!(results.len(), 2);
            let (name_1, count_1) = results[0];
            let (name_2, count_2) = results[1];
            assert_eq!(name_1, option_name_1);
            assert_eq!(name_2, option_name_2);
            assert_eq!(count_1, 1);
            assert_eq!(count_2, 4);

            let get_results_event = ink_env::test::emitted_events()
                .find(|event| matches!(event.event, "GetResults"))
                .expect("no GetResults event was emitted");
            assert_eq!(get_results_event.event, "GetResults");
            assert_eq!(get_results_event.args[0].clone().into_vec().unwrap().len(), 2);
        }
    }
}
