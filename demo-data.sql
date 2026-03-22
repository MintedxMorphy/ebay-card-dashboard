-- CardTrack Demo Data - Copy and paste this entire query into Supabase SQL Editor

INSERT INTO transactions (user_id, transaction_type, card_category, amount, card_name, card_description, transaction_date)
VALUES
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'buy', 'sports', 45.00, 'Tom Brady PSA 8', 'Classic 1995 rookie', NOW() - INTERVAL '25 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'buy', 'sports', 32.50, 'Michael Jordan 1986', 'Fleer #57', NOW() - INTERVAL '20 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'buy', 'sports', 78.00, 'LeBron James Auto', 'Signed rookie', NOW() - INTERVAL '15 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'sell', 'sports', 85.00, 'Tom Brady PSA 8', 'Sold at profit', NOW() - INTERVAL '10 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'sell', 'sports', 55.00, 'Patrick Mahomes RC', 'High demand', NOW() - INTERVAL '5 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'buy', 'pokemon', 25.00, 'Charizard Base Set', 'Holo rare', NOW() - INTERVAL '28 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'buy', 'pokemon', 15.50, 'Blastoise Base Set', 'Light play condition', NOW() - INTERVAL '22 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'buy', 'pokemon', 120.00, 'Pikachu Shadowless', 'First edition', NOW() - INTERVAL '18 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'buy', 'pokemon', 35.00, 'Mewtwo EX', 'Modern set', NOW() - INTERVAL '12 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'sell', 'pokemon', 40.00, 'Charizard Base Set', 'Sold', NOW() - INTERVAL '8 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'sell', 'pokemon', 180.00, 'Pikachu Shadowless', 'Premium sell', NOW() - INTERVAL '3 days'),
  ('550e8400-e29b-41d4-a716-446655440000'::uuid, 'sell', 'pokemon', 55.00, 'Mewtwo EX', 'Good profit', NOW() - INTERVAL '1 day');
