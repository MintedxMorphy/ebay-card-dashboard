'use client';

import { useState } from 'react';
import EditTransactionModal from './EditTransactionModal';
import TransactionForm from './TransactionForm';

interface Transaction {
  id: string;
  card_category: string;
  transaction_type: string;
  amount: number;
  card_name: string;
  created_at: string;
  transaction_date: string;
}

interface TransactionsProps {
  transactions: Transaction[];
  onRefresh: () => void;
}

export default function Transactions({ transactions, onRefresh }: TransactionsProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
  );

  const handleTransactionClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setEditModalOpen(true);
  };

  const handleSave = () => {
    setEditModalOpen(false);
    setEditingTransaction(null);
    onRefresh();
  };

  return (
    <>
      <div className="rounded-xl bg-black border border-[#00ff41]/30 p-6" style={{
        boxShadow: '0 0 15px rgba(0, 255, 65, 0.1)'
      }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#00ff41] font-mono">All Transactions 🃏</h2>
          <TransactionForm onTransactionAdded={onRefresh} />
        </div>
        
        {sortedTransactions.length === 0 ? (
          <p className="text-gray-400">No transactions yet. Start logging your cards!</p>
        ) : (
          <div className="overflow-y-auto max-h-[500px] pr-2">
            <div className="space-y-3">
              {sortedTransactions.map((tx, index) => (
                <div
                  key={tx.id}
                  onClick={() => handleTransactionClick(tx)}
                  className="flex items-center justify-between p-3 rounded-lg bg-black border transition cursor-pointer hover:opacity-80"
                  style={{
                    borderColor: tx.transaction_type === 'buy' ? 'rgba(255, 0, 110, 0.2)' : 'rgba(0, 255, 65, 0.2)',
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-[#8b00ff] font-bold text-sm font-mono bg-[#8b00ff]/10 px-2 py-1 rounded min-w-[2.5rem] text-center">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-white font-mono">
                        {tx.card_name}
                        <span className={`ml-2 text-sm font-bold ${
                          tx.transaction_type === 'buy' ? 'text-[#ff006e]' : 'text-[#00ff41]'
                        }`}>
                          {tx.transaction_type === 'buy' ? '🛍️ Bought' : '🎯 Sold'}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400 font-mono">
                        {tx.card_category === 'sports' ? '🏈 Sports' : '⚡ Pokémon'} • {new Date(tx.transaction_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right font-bold font-mono ${
                    tx.transaction_type === 'buy' ? 'text-[#ff006e]' : 'text-[#00ff41]'
                  }`}>
                    {tx.transaction_type === 'buy' ? '-' : '+'}${tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
}
