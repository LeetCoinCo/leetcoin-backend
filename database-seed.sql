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
    id text PRIMARY KEY NOT NULL,
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
    results jsonb,
    CONSTRAINT FK_question_question_submissions FOREIGN KEY(question_id) REFERENCES questions(id),
    CONSTRAINT FK_user_question_submissions FOREIGN KEY(user_id) REFERENCES users(id)
);

