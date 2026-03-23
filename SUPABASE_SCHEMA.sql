-- Users table to store eBay auth tokens
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR PRIMARY KEY,
  ebay_access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table (already exists, but schema for reference)
CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL REFERENCES users(user_id),
  ebay_transaction_id VARCHAR UNIQUE NOT NULL,
  type VARCHAR(10) NOT NULL, -- 'buy' or 'sell'
  card_type VARCHAR(20) NOT NULL, -- 'sports' or 'pokemon'
  title TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  quantity INTEGER DEFAULT 1,
  card_category VARCHAR(20), -- for backwards compatibility
  transaction_type VARCHAR(10), -- for backwards compatibility
  transaction_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_card_type ON transactions(card_type);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
