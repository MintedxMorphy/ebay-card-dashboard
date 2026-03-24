-- Add card_name column to transactions table
ALTER TABLE transactions ADD COLUMN card_name VARCHAR(255);

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'transactions' 
ORDER BY ordinal_position;
