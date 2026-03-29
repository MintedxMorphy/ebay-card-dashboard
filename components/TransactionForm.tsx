'use client';

import { useState, useRef, useEffect } from 'react';

interface TransactionFormProps {
  onTransactionAdded: () => void;
}

type TransactionType = 'buy' | 'sell';

export default function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [transactionType, setTransactionType] = useState<TransactionType | null>(null);
  const [loading, setLoading] = useState(false);
  const [cardName, setCardName] = useState('');
  const [category, setCategory] = useState<'sports' | 'pokemon'>('sports');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const selectTransaction = (type: TransactionType) => {
    setTransactionType(type);
    setShowDropdown(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!cardName || !price) {
      setError('Card name and price are required');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice)) {
      setError('Price must be a valid number');
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
          transaction_type: transactionType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to add ${transactionType}`);
      }

      // Reset form
      setCardName('');
      setPrice('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('sports');
      setTransactionType(null);
      setIsOpen(false);

      // Notify parent to refresh stats
      onTransactionAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to add ${transactionType}`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setTransactionType(null);
    setCardName('');
    setPrice('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('sports');
    setError(null);
  };

  const borderColor = transactionType === 'buy' ? 'border-[#ff006e]' : 'border-[#00ff41]';
  const textColor = transactionType === 'buy' ? 'text-[#ff006e]' : 'text-[#00ff41]';
  const glowColor = transactionType === 'buy' 
    ? '0 0 20px rgba(255, 0, 110, 0.3)' 
    : '0 0 20px rgba(0, 255, 65, 0.3)';

  return (
    <>
      {/* Dropdown Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="px-4 py-2 rounded border-2 border-[#00ffff] text-[#00ffff] font-mono font-bold text-sm transition hover:bg-[#00ffff]/5"
          style={{
            boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
          }}
        >
          + New Transaction ⏷
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-black border-2 border-[#00ffff] rounded-lg overflow-hidden z-40" style={{
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          }}>
            <button
              onClick={() => selectTransaction('buy')}
              className="w-full text-left px-4 py-3 border-b border-[#00ffff]/20 text-[#ff006e] font-mono font-bold hover:bg-[#ff006e]/10 transition"
            >
              🛍️ Log a Buy
            </button>
            <button
              onClick={() => selectTransaction('sell')}
              className="w-full text-left px-4 py-3 text-[#00ff41] font-mono font-bold hover:bg-[#00ff41]/10 transition"
            >
              🎯 Log a Sell
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && transactionType && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className={`bg-black border-2 ${borderColor} rounded-xl p-6 w-full max-w-md`} style={{
            boxShadow: glowColor,
          }}>
            <h2 className={`text-2xl font-bold ${textColor} mb-4 font-mono`}>
              {transactionType === 'buy' ? 'Log a Buy 🛍️' : 'Log a Sell 🎯'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Card Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder={transactionType === 'buy' ? 'e.g., 2025 Donruss Jalen Ramsey' : 'e.g., PSA 10 Michael Jordan'}
                  className={`w-full bg-black border rounded px-3 py-2 text-white font-mono focus:outline-none ${
                    transactionType === 'buy'
                      ? 'border-[#ff006e]/50 focus:border-[#ff006e]'
                      : 'border-[#00ff41]/50 focus:border-[#00ff41]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'sports' | 'pokemon')}
                  className={`w-full bg-black border rounded px-3 py-2 text-white font-mono focus:outline-none ${
                    transactionType === 'buy'
                      ? 'border-[#ff006e]/50 focus:border-[#ff006e]'
                      : 'border-[#00ff41]/50 focus:border-[#00ff41]'
                  }`}
                >
                  <option value="sports">🏈 Sports</option>
                  <option value="pokemon">⚡ Pokémon</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  {transactionType === 'buy' ? 'Purchase Price ($)' : 'Sale Price ($)'}
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 52.64"
                  step="0.01"
                  min="0.01"
                  className={`w-full bg-black border rounded px-3 py-2 text-white font-mono focus:outline-none ${
                    transactionType === 'buy'
                      ? 'border-[#ff006e]/50 focus:border-[#ff006e]'
                      : 'border-[#00ff41]/50 focus:border-[#00ff41]'
                  }`}
                />
                <p className="text-xs text-gray-400 mt-1">Enter full price with decimal — e.g. 52.64</p>
              </div>

              <div>
                <label className="block text-sm font-mono text-gray-300 mb-2">
                  Date {transactionType === 'buy' ? 'Purchased' : 'Sold'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full bg-black border rounded px-3 py-2 text-white font-mono focus:outline-none ${
                    transactionType === 'buy'
                      ? 'border-[#ff006e]/50 focus:border-[#ff006e]'
                      : 'border-[#00ff41]/50 focus:border-[#00ff41]'
                  }`}
                />
              </div>

              {error && (
                <div className={`p-3 rounded border text-sm font-mono ${
                  transactionType === 'buy'
                    ? 'bg-[#ff006e]/10 border-[#ff006e] text-[#ff006e]'
                    : 'bg-[#00ff41]/10 border-[#00ff41] text-[#00ff41]'
                }`}>
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded border-2 font-mono font-bold transition disabled:opacity-50 ${
                    transactionType === 'buy'
                      ? 'border-[#ff006e] text-[#ff006e]'
                      : 'border-[#00ff41] text-[#00ff41]'
                  }`}
                  style={{
                    boxShadow: glowColor,
                  }}
                >
                  {loading ? 'Adding...' : transactionType === 'buy' ? 'Add Buy' : 'Add Sell'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
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
