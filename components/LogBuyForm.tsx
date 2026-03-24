'use client';

import { useState } from 'react';

interface LogBuyFormProps {
  onBuyAdded: () => void;
}

export default function LogBuyForm({ onBuyAdded }: LogBuyFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState('');
  const [category, setCategory] = useState<'sports' | 'pokemon'>('sports');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cardName || !price) {
      setError('Card name and price are required');
      return;
    }

    let parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Price must be a valid positive number');
      return;
    }

    // Validate: if user entered a 4+ digit number without a decimal, they likely meant to include cents
    // e.g., "5264" was probably meant to be "52.64"
    if (!price.includes('.') && parsedPrice >= 100) {
      setError(`Did you mean $${(parsedPrice / 100).toFixed(2)}? If so, enter it as a decimal (e.g., 52.64)`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/transactions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'gabriel_ebay_account',
          card_name: cardName,
          card_category: category,
          amount: parsedPrice,
          created_at: new Date(date).toISOString(),
          transaction_type: 'buy',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add buy');
      }

      // Reset form
      setCardName('');
      setPrice('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('sports');
      setIsOpen(false);

      // Notify parent to refresh stats
      onBuyAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add buy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 rounded border-2 border-[#ff006e] text-[#ff006e] font-mono font-bold text-sm transition"
          style={{
            boxShadow: '0 0 10px rgba(255, 0, 110, 0.3)',
          }}
        >
          + Log a Buy
        </button>
      ) : (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border-2 border-[#ff006e] rounded-xl p-6 w-full max-w-md" style={{
            boxShadow: '0 0 20px rgba(255, 0, 110, 0.3)',
          }}>
            <h2 className="text-2xl font-bold text-[#ff006e] mb-4 font-mono">Log a Buy 🛍️</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Card Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g., 2025 Donruss Jalen Ramsey"
                  className="w-full bg-black border border-[#ff006e]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#ff006e]"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'sports' | 'pokemon')}
                  className="w-full bg-black border border-[#ff006e]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#ff006e]"
                >
                  <option value="sports">🏈 Sports</option>
                  <option value="pokemon">⚡ Pokémon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Purchase Price ($)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 52.64"
                  step="0.01"
                  min="0"
                  className="w-full bg-black border border-[#ff006e]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#ff006e]"
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Date Purchased</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black border border-[#ff006e]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#ff006e]"
                />
              </div>

              {error && (
                <div className="p-3 rounded bg-[#ff006e]/10 border border-[#ff006e] text-[#ff006e] text-sm font-mono">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded border-2 border-[#ff006e] text-[#ff006e] font-mono font-bold transition disabled:opacity-50"
                  style={{
                    boxShadow: '0 0 10px rgba(255, 0, 110, 0.3)',
                  }}
                >
                  {loading ? 'Adding...' : 'Add Buy'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded border-2 border-gray-500 text-gray-300 font-mono font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
