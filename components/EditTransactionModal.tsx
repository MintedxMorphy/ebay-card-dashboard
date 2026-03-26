'use client';

import { useState } from 'react';

interface Transaction {
  id: string;
  card_name: string;
  card_category: string;
  amount: number;
  transaction_date: string;
  transaction_type: string;
}

interface EditTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function EditTransactionModal({
  transaction,
  isOpen,
  onClose,
  onSave,
}: EditTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [cardName, setCardName] = useState(transaction.card_name);
  const [category, setCategory] = useState<'sports' | 'pokemon'>(
    transaction.card_category as 'sports' | 'pokemon'
  );
  const [price, setPrice] = useState(transaction.amount.toString());
  const [date, setDate] = useState(
    new Date(transaction.transaction_date).toISOString().split('T')[0]
  );
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch('/api/transactions/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
          card_name: cardName,
          card_category: category,
          amount: parsedPrice,
          transaction_date: new Date(date).toISOString(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update transaction');
      }

      onClose();
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setDeleting(true);

    try {
      const response = await fetch('/api/transactions/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId: transaction.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete transaction');
      }

      onClose();
      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div
        className="bg-black border-2 border-[#a78bfa] rounded-xl p-6 w-full max-w-md"
        style={{
          boxShadow: '0 0 20px rgba(167, 139, 250, 0.3)',
        }}
      >
        <h2 className="text-2xl font-bold text-[#a78bfa] mb-4 font-mono">Edit Transaction ✏️</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-mono text-gray-300 mb-2">Card Name</label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Card name"
              className="w-full bg-black border border-[#a78bfa]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#a78bfa]"
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-300 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as 'sports' | 'pokemon')}
              className="w-full bg-black border border-[#a78bfa]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#a78bfa]"
            >
              <option value="sports">🏈 Sports</option>
              <option value="pokemon">⚡ Pokémon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-300 mb-2">Price ($)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 52.64"
              step="0.01"
              min="0.01"
              className="w-full bg-black border border-[#a78bfa]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#a78bfa]"
            />
            <p className="text-xs text-gray-400 mt-1">Enter full price with decimal — e.g. 52.64</p>
          </div>

          <div>
            <label className="block text-sm font-mono text-gray-300 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-black border border-[#a78bfa]/50 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-[#a78bfa]"
            />
          </div>

          {error && (
            <div className="p-3 rounded bg-[#a78bfa]/10 border border-[#a78bfa] text-[#a78bfa] text-sm font-mono">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 rounded border-2 border-[#a78bfa] text-[#a78bfa] font-mono font-bold transition disabled:opacity-50"
              style={{
                boxShadow: '0 0 10px rgba(167, 139, 250, 0.3)',
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1 px-4 py-2 rounded border-2 border-[#ff006e] text-[#ff006e] font-mono font-bold transition"
              style={{
                boxShadow: '0 0 10px rgba(255, 0, 110, 0.3)',
              }}
            >
              Delete
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded border-2 border-gray-500 text-gray-300 font-mono font-bold transition"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4">
            <div
              className="bg-black border-2 border-[#ff006e] rounded-xl p-6 w-full max-w-sm"
              style={{
                boxShadow: '0 0 20px rgba(255, 0, 110, 0.5)',
              }}
            >
              <h3 className="text-xl font-bold text-[#ff006e] mb-3 font-mono">Delete Transaction? ⚠️</h3>
              <p className="text-gray-300 mb-4 font-mono text-sm">
                Are you sure you want to delete <span className="font-bold">{transaction.card_name}</span>? This cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 rounded border-2 border-[#ff006e] text-[#ff006e] font-mono font-bold transition disabled:opacity-50"
                  style={{
                    boxShadow: '0 0 10px rgba(255, 0, 110, 0.3)',
                  }}
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded border-2 border-gray-500 text-gray-300 font-mono font-bold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
