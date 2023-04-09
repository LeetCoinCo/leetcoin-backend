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
VALUES ('511843b8-15b8-480a-948c-d6b36cf9ce6d', 'example-question-1', 'Example Question 1', 'This is an example question with an easy difficulty', 'easy', 5, 4, '{"starterCode": {"substrate_rust": "CODE_HERE"}, "codeSolution": {"substrate_rust": "CODE_HERE"}}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, metadata)
VALUES ('2be06a99-b221-48c8-87a5-ed050653f9cf' ,'example-question-2', 'Example Question 2', 'This is an example question with a medium difficulty', 'medium', 3, '{"category": "data structures", "tags": ["linked lists", "trees"]}');

INSERT INTO questions (id, name, title, description, difficulty, frequency, metadata)
VALUES ('89f69ece-392f-40bc-96a9-5b5934f2d0a4', 'example-question-3', 'Example Question 3', 'This is an example question with a hard difficulty', 'hard', 1, '{"category": "dynamic programming", "tags": ["memoization", "recursion"]}');
