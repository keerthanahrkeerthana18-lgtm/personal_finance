import React, { useState } from 'react';
import { useFinanceData } from './hooks/useFinanceData';

function App() {
  const { transactions, insights, loading, error, addTx } = useFinanceData();
  
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const PREDEFINED_CATEGORIES = [
    'Food', 'Rent', 'Entertainment', 'Transportation', 'Utilities', 'Salary', 'Investment', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount)) return alert('Please enter a valid amount');
    
    await addTx({
      amount: parseFloat(amount),
      type,
      category,
      date,
      description
    });
    
    setAmount('');
    setDescription('');
  };

  if (loading) {
    return <div className="app-container"><p>Loading your financial ecosystem...</p></div>;
  }

  if (error) {
    return <div className="app-container"><p style={{ color: 'var(--accent-red)' }}>Error: {error}</p></div>;
  }

  return (
    <div className="app-container">
      <h1><span className="text-gradient">Personal Finance Dashboard</span></h1>
      
      {/* Dashboard Metrics */}
      <div className="dashboard-grid">
        <div className="glass-panel">
          <h2>Current Balance</h2>
          <div className="metric-value">${insights?.balance.toFixed(2)}</div>
        </div>
        <div className="glass-panel">
          <h2>Total Income</h2>
          <div className="metric-value metric-income">${insights?.totalIncome.toFixed(2)}</div>
        </div>
        <div className="glass-panel">
          <h2>Total Expenses</h2>
          <div className="metric-value metric-expense">${insights?.totalExpense.toFixed(2)}</div>
        </div>
      </div>

      <div className="main-grid">
        {/* Left Column */}
        <div className="left-column">
          <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
            <h2>Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p>No transactions found. Log your first below!</p>
            ) : (
              <div>
                {transactions.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="transaction-item">
                    <div className="tx-info">
                      <h3>{tx.category}</h3>
                      <p>{tx.description || 'No description'}</p>
                      <span className="tx-date">{tx.date}</span>
                    </div>
                    <div className={`tx-amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel">
            <h2>Budgeting Suggestions</h2>
            {insights?.suggestions && insights.suggestions.map((suggestion, index) => (
              <div key={index} className={`suggestion-card ${suggestion.type}`}>
                <p>{suggestion.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="right-column">
          <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
            <h2>Log Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Amount ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  className="form-input" 
                  placeholder="0.00"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                  {PREDEFINED_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Lunch at Cafe"
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={date} 
                  onChange={e => setDate(e.target.value)} 
                />
              </div>

              <button type="submit" className="btn">Add Transaction</button>
            </form>
          </div>

          <div className="glass-panel">
            <h2>Spending Breakdown</h2>
            {insights?.categoryBreakdown && Object.keys(insights.categoryBreakdown).length > 0 ? (
              Object.entries(insights.categoryBreakdown).map(([cat, amount]) => {
                const percentage = insights.totalExpense > 0 ? (amount / insights.totalExpense) * 100 : 0;
                return (
                  <div key={cat} className="category-row">
                    <div className="category-header">
                      <span>{cat}</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-bar" style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No expenses tracked yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
