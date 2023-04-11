CREATE DATABASE prod;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_difficulty') THEN
        CREATE TYPE question_difficulty AS
        ENUM(
            'easy',
            'medium',
            'hard'
        );
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'code_language') THEN
        CREATE TYPE code_language AS
            ENUM('substrate_rust');
    END IF;
END$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_submission_status') THEN
        CREATE TYPE question_submission_status AS
            ENUM('initial', 'failed_to_compile', 'failed_tests', 'pending', 'success', 'system_error');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS questions
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    name text,
    title text,
    description text,
    difficulty question_difficulty,
    frequency integer,
    rating integer,
    metadata jsonb,
    CONSTRAINT questions_unique_name UNIQUE(name)
);

CREATE TABLE IF NOT EXISTS users
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    username text,
    email text,
    password text,
    metadata jsonb,
    CONSTRAINT users_unique_username UNIQUE(username),
    CONSTRAINT users_unique_email UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS question_submissions
(
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    question_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone,
    submission text,
    language code_language,
    status question_submission_status,
    results jsonb,
    CONSTRAINT FK_question_question_submissions FOREIGN KEY(question_id) REFERENCES questions(id),
    CONSTRAINT FK_user_question_submissions FOREIGN KEY(user_id) REFERENCES users(id)
);

INSERT INTO users (id, username, email, password, metadata)
VALUES ('ab4e5b77-45be-4d19-915b-517c39437e3d', 'example-user-1', 'email@email.com', '123', '{}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata) 
VALUES ('bdb9334a-d703-11ed-afa1-0242ac120002', 'simple-storage', 'Simple Storage', 'Create a simple storage smart contract that stores a single unsigned 32-bit integer. The contract should have a `get` function to retrieve the stored value and a `set` function to update the stored value.', 'easy', 60, 4.5, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod simple_storage {\n    #[ink(storage)]\n    pub struct SimpleStorage {\n        // TODO, add your code here\n    }\n    impl SimpleStorage {\n        #[ink(constructor)]\n        pub fn new() -> Self {\n            // TODO, add your code here\n        }\n        // TODO, add your functions here\n    }\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "storage"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata) 
VALUES ('e9d2b4c0-d703-11ed-afa1-0242ac120002', 'counter', 'Counter', 'Create a Counter smart contract that allows users to increment and decrement a counter value. The contract should have `increment` and `decrement` functions, and a `get` function to retrieve the current value of the counter.', 'easy', 50, 4, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod counter {\n    #[ink(storage)]\n    pub struct Counter {\n        // TODO, add your code here\n    }\n    impl Counter {\n        #[ink(constructor)]\n        pub fn new() -> Self {\n            // TODO, add your code here\n        }\n        // TODO, add your functions here\n    }\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "counter"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata) 
VALUES ('24f5a5d2-d703-11ed-afa1-0242ac120002', 'simple-token', 'Simple Token', 'Create a simple token smart contract that allows users to mint, transfer, and check their token balance. Implement `mint`, `transfer`, and `get_balance` functions.', 'med', 70, 4.5, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod simple_token {\n    #[ink(storage)]\n    pub struct SimpleToken {\n        balances: ink_prelude::collections::HashMap<AccountId, Balance>,\n    }\n    // Add your implementation here\n}"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "token"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata) 
VALUES ('5da2b7da-d703-11ed-afa1-0242ac120002', 'voting', 'Voting', 'Create a voting smart contract that allows users to propose options and vote on them. Implement propose_option, vote, and get_results functions. The contract should prevent users from voting more than once.', 'med', 40, 4.2, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod voting {\n #[ink(storage)]\n pub struct Voting {\n options: ink_prelude::collections::HashMap<u32, (String, u32)>,\n voters: ink_prelude::collections::HashMap<AccountId, bool>,\n }\n // Add your implementation here\n}"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "voting"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata)
VALUES ('97bca69a-d703-11ed-afa1-0242ac120002', 'escrow', 'Escrow', 'Create an escrow smart contract that allows two parties to lock funds and release them upon agreement. Implement lock_funds, release_funds, and refund_funds functions.', 'hard', 30, 4.8, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod escrow {\n #[ink(storage)]\n pub struct Escrow {\n seller: AccountId,\n buyer: AccountId,\n amount: Balance,\n status: EscrowStatus,\n }\n // Add your implementation here\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "escrow"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata)
VALUES ('d300b862-d703-11ed-afa1-0242ac120002', 'multi-signature-wallet', 'Multi-Signature Wallet', 'Create a multi-signature wallet smart contract that requires multiple confirmations for transactions. Implement propose_transaction, confirm_transaction, and execute_transaction functions.', 'hard', 20, 4.7, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod multisig_wallet {\n #[ink(storage)]\n pub struct MultisigWallet {\n owners: ink_prelude::collections::HashMap<AccountId, bool>,\n required_confirmations: u32,\n transactions: ink_prelude::collections::HashMap<u32, (Hash, Balance, AccountId, u32, bool)>,\n confirmations: ink_prelude::collections::HashMap<u32, ink_prelude::collections::HashMap<AccountId, bool>>,\n }\n // Add your implementation here\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "multisig"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata)
VALUES ('111c5b2a-d704-11ed-afa1-0242ac120002', 'simple-auction', 'Simple Auction', 'Create a simple auction smart contract that allows users to bid on an item. Implement place_bid, withdraw, and finalize_auction functions. The contract should prevent bids after the auction has ended.', 'med', 45, 4.3, '{"starterCode": {"substrate_rust": "#[ink::contract]\n mod simple_auction {\n #[ink(storage)]\n pub struct SimpleAuction {\n auction_end: Timestamp,\n highest_bidder: AccountId,\n highest_bid: Balance,\n }\n // Add your implementation here\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "auction"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata)
VALUES ('524a87a2-d704-11ed-afa1-0242ac120002', 'timed-lock', 'Timed Lock', 'Create a timed lock smart contract that allows users to lock their funds for a specified duration. Implement lock, unlock, and get_remaining_time functions. The contract should prevent withdrawals before the lock duration has elapsed.', 'med', 35, 4.1, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod timed_lock {\n #[ink(storage)]\n pub struct TimedLock {\n lock_duration: Timestamp,\n lock_end: Timestamp,\n locked_balance: Balance,\n owner: AccountId,\n }\n // Add your implementation here\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "timed lock"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata)
VALUES ('9a3e20e6-d704-11ed-afa1-0242ac120002', 'erc20-token', 'ERC-20 Token', 'Create an ERC-20 compliant token smart contract that allows users to mint, transfer, and check their token balance. Implement the required functions according to the ERC-20 standard.', 'hard', 25, 4.9, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod erc20_token {\n #[ink(storage)]\n pub struct Erc20Token {\n balances: ink_prelude::collections::HashMap<AccountId, Balance>,\n allowances: ink_prelude::collections::HashMap<(AccountId, AccountId), Balance>,\n total_supply: Balance,\n }\n // Add your implementation here\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "erc20"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, rating, metadata)
VALUES ('e2ceeb1a-d704-11ed-afa1-0242ac120002', 'decentralized-oracle', 'Decentralized Oracle', 'Create a decentralized oracle smart contract that allows users to request external data and receive it within the contract. Implement request_data, provide_data, and get_data functions.', 'hard', 15, 5, '{"starterCode": {"substrate_rust": "#[ink::contract]\nmod decentralized_oracle {\n #[ink(storage)]\n pub struct DecentralizedOracle {\n data_requests: ink_prelude::collections::HashMap<String, Balance>,\n data_providers: ink_prelude::collections::HashMap<AccountId, bool>,\n }\n // Add your implementation here\n}\n"}, "codeSolution": {"substrate_rust": "CODE_HERE"}, "category": "Ink!", "tags": ["smart contract", "decentralized oracle"]}');
