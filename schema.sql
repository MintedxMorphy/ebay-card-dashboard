-- CardTrack Dashboard Schema
-- Sports + Pokemon Card P&L Tracking

-- Create transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  card_category VARCHAR(20) NOT NULL CHECK (card_category IN ('sports', 'pokemon')),
  amount DECIMAL(10, 2) NOT NULL,
  card_name VARCHAR(255),
  card_description TEXT,
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_category ON transactions(card_category);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- Create view for P&L summary
CREATE VIEW transaction_summary AS
SELECT 
  user_id,
  card_category,
  SUM(CASE WHEN transaction_type = 'buy' THEN amount ELSE 0 END) as total_spent,
  SUM(CASE WHEN transaction_type = 'sell' THEN amount ELSE 0 END) as total_revenue,
  SUM(CASE WHEN transaction_type = 'sell' THEN amount ELSE -amount END) as net_profit
FROM transactions
GROUP BY user_id, card_category;

-- Create monthly P&L view
CREATE VIEW monthly_pnl AS
SELECT 
  user_id,
  DATE_TRUNC('month', transaction_date) as month,
  SUM(CASE WHEN transaction_type = 'sell' THEN amount ELSE -amount END) as monthly_profit
FROM transactions
GROUP BY user_id, DATE_TRUNC('month', transaction_date)
ORDER BY month DESC;

-- Enable RLS if needed (optional)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
