-- momo_schema.sql

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  amount NUMERIC,
  date DATE,
  body TEXT
);

