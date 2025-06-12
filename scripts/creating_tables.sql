--  We start by creating the momo_analysis database
CREATE DATABASE momo_analysis;


\c momo_analysis;

-- Create the sms_messages table
CREATE TABLE sms_messages (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255),
    date BIGINT,
    type INTEGER,
    body TEXT
);
