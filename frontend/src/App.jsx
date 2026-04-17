import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useFinanceData } from './hooks/useFinanceData';
import { AuthPage } from './pages/AuthPage';
import { CategoryPieChart, TrendLineChart, IncomeVsExpenseChart } from './components/Charts';
import { generatePDFReport } from './utils/PDFReport';
import { 
  LogOut, Plus, Search, Filter, TrendingUp, TrendingDown, 
  Download, Wallet, Target, AlertTriangle, CheckCircle2, 
  FileText, Settings, Trash2, Rocket, Calendar
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food': '🍔',
  'Rent': '🏠',
  'Entertainment': '🎮',
  'Transportation': '🚗',
  'Utilities': '💡',
  'Salary': '💰',
  'Investment': '📈',
  'Other': '📦'
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-container">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const { 
    transactions, insights, budgets, rules, goals, settings, loading, error, 
    addTx, updateBudget, createRule, removeRule, createGoal, removeGoal, updateSettings, triggerSummary 
  } = useFinanceData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterDate, setFilterDate] = useState('All');
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, rules, goals

  const [txForm, setTxForm] = useState({
    amount: '', type: 'expense', category: 'Food', date: new Date().toISOString().split('T')[0], description: ''
  });
  
  const [budgetForm, setBudgetForm] = useState({ category: 'Food', limit: '' });
  const [ruleForm, setRuleForm] = useState({ keyword: '', category: 'Food' });
  const [goalForm, setGoalForm] = useState({ name: '', target: '', deadline: '' });

  // Filtering Logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            tx.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || tx.category === filterCategory;
      
      let matchesDate = true;
      if (filterDate === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = new Date(tx.date) >= sevenDaysAgo;
      } else if (filterDate === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDate = new Date(tx.date) >= thirtyDaysAgo;
      }
      
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [transactions, searchTerm, filterCategory, filterDate]);

  const handleSubmitTx = async (e) => {
    e.preventDefault();
    if (!txForm.amount || isNaN(txForm.amount) || txForm.amount <= 0) return alert('Please enter a valid positive amount');
    await addTx({ ...txForm, amount: parseFloat(txForm.amount) });
    setTxForm({ ...txForm, amount: '', description: '' });
  };

  const handleSubmitBudget = async (e) => {
    e.preventDefault();
    if (!budgetForm.limit || isNaN(budgetForm.limit)) return alert('Please enter a valid limit');
    await updateBudget({ category: budgetForm.category, monthly_limit: parseFloat(budgetForm.limit) });
    setBudgetForm({ ...budgetForm, limit: '' });
  };

  const handleSubmitRule = async (e) => {
    e.preventDefault();
    if (!ruleForm.keyword) return alert('Keyword required');
    await createRule(ruleForm);
    setRuleForm({ keyword: '', category: 'Food' });
  };

  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    if (!goalForm.name || !goalForm.target) return alert('Name and Target required');
    await createGoal({ name: goalForm.name, target_amount: parseFloat(goalForm.target), deadline: goalForm.deadline });
    setGoalForm({ name: '', target: '', deadline: '' });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Type', 'Amount'];
    const rows = filteredTransactions.map(tx => [tx.date, tx.category, tx.description || '', tx.type, tx.amount]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const exportPDF = () => {
    generatePDFReport(transactions, insights, user?.email);
  };

  const tabVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  if (loading) return <div className="app-container">Analytics loading...</div>;

  return (
    <div className="app-container">
      <header className="dashboard-header">
        <div>
          <h1><span className="text-gradient">Finance Intelligence</span></h1>
          <nav className="header-nav">
            <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
            <button className={activeTab === 'goals' ? 'active' : ''} onClick={() => setActiveTab('goals')}>Savings Goals</button>
            <button className={activeTab === 'rules' ? 'active' : ''} onClick={() => setActiveTab('rules')}>Auto-Rules</button>
          </nav>
        </div>
        <button onClick={logoutUser} className="btn-secondary">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={tabVariants}
        >
          {activeTab === 'dashboard' && (
            <>
              {/* Highlights */}
              <div className="dashboard-grid">
                <div className="glass-panel stat-card">
                  <div className="card-icon blue"><Wallet size={24} /></div>
                  <div>
                    <h3>Balance</h3>
                    <div className="metric-value">₹{insights?.balance.toLocaleString()}</div>
                  </div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="card-icon green"><TrendingUp size={24} /></div>
                  <div>
                    <h3>Total Income</h3>
                    <div className="metric-value metric-income">₹{insights?.totalIncome.toLocaleString()}</div>
                  </div>
                </div>
                <div className="glass-panel stat-card">
                  <div className="card-icon red"><TrendingDown size={24} /></div>
                  <div>
                    <h3>Total Expenses</h3>
                    <div className="metric-value metric-expense">₹{insights?.totalExpense.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="main-grid">
                <div className="left-column">
                  {/* Smart Insights */}
                  <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="panel-title"><Target size={20} /> Smart Insights</h2>
                    <div className="insights-grid">
                      {insights?.smartInsights.map((text, i) => (
                        <div key={i} className="insight-item">
                          {text.includes('👍') || text.includes('less') ? <CheckCircle2 size={16} className="text-green" /> : <AlertTriangle size={16} className="text-purple" />}
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subscriptions Section */}
                  {insights?.detectedSubscriptions?.length > 0 && (
                    <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                      <h2 className="panel-title"><Calendar size={20} /> Detected Subscriptions</h2>
                      <div className="subscriptions-grid">
                        {insights.detectedSubscriptions.map((sub, i) => (
                          <div key={i} className="subscription-card">
                            <div className="sub-info">
                              <span className="sub-name">{sub.description}</span>
                              <span className="sub-meta">{sub.category} • Monthly</span>
                            </div>
                            <div className="sub-amount">₹{sub.amount.toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visualizations */}
                  <div className="charts-grid">
                    <div className="glass-panel">
                      <h2 className="panel-title">Spending Breakdown</h2>
                      <CategoryPieChart 
                        data={insights?.categoryBreakdown} 
                        onCategorySelect={(cat) => {
                          setFilterCategory(cat);
                          document.getElementById('transaction-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                    </div>
                    <div className="glass-panel">
                      <h2 className="panel-title">Expense Trends</h2>
                      <TrendLineChart transactions={transactions} />
                    </div>
                  </div>

                  <div id="transaction-section" className="glass-panel" style={{ marginTop: '1.5rem' }}>
                    <div className="panel-header">
                      <h2 className="panel-title">Recent Transactions</h2>
                      <div className="action-row">
                        <div className="search-bar">
                          <Search size={16} />
                          <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <button onClick={exportPDF} className="btn-small"><FileText size={14} /> PDF</button>
                        <button onClick={exportCSV} className="btn-small"><Download size={14} /> CSV</button>
                      </div>
                    </div>

                    <div className="filters-row">
                      <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                        <option value="All">All Categories</option>
                        {Object.keys(CATEGORY_ICONS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <select value={filterDate} onChange={e => setFilterDate(e.target.value)}>
                        <option value="All">All Time</option>
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                      </select>
                    </div>

                    <div className="transaction-list">
                      {filteredTransactions.length === 0 ? (
                        <div className="empty-state">No transactions found.</div>
                      ) : (
                        filteredTransactions.map(tx => (
                          <div key={tx.id} className="transaction-item">
                            <div className="tx-icon-circle">{CATEGORY_ICONS[tx.category] || '💰'}</div>
                            <div className="tx-info">
                              <h3>{tx.description || tx.category}</h3>
                              <span className="tx-date">{tx.date} • {tx.category}</span>
                            </div>
                            <div className={`tx-amount ${tx.type}`}>
                              {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="right-column">
                  <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                    <h2 className="panel-title"><Plus size={20} /> Add Entry</h2>
                    <form onSubmit={handleSubmitTx}>
                      <div className="form-group-row">
                        <button type="button" className={`toggle-btn ${txForm.type === 'expense' ? 'active' : ''}`} onClick={() => setTxForm({...txForm, type: 'expense'})}>Expense</button>
                        <button type="button" className={`toggle-btn ${txForm.type === 'income' ? 'active' : ''}`} onClick={() => setTxForm({...txForm, type: 'income'})}>Income</button>
                      </div>
                      <div className="form-group">
                        <label>Amount (₹)</label>
                        <input type="number" step="0.01" className="form-input" placeholder="0.00" value={txForm.amount} onChange={e => setTxForm({...txForm, amount: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Category</label>
                        <select className="form-select" value={txForm.category} onChange={e => setTxForm({...txForm, category: e.target.value})}>
                          {Object.keys(CATEGORY_ICONS).map(cat => <option key={cat} value={cat}>{CATEGORY_ICONS[cat]} {cat}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <input type="text" className="form-input" placeholder="e.g. Starbucks Cofffee" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Date</label>
                        <input type="date" className="form-input" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
                      </div>
                      <button type="submit" className="btn">Add Transaction</button>
                    </form>
                  </div>

                  <div className="glass-panel">
                    <h2 className="panel-title">Monthly Budgets</h2>
                    <form onSubmit={handleSubmitBudget} className="budget-form">
                      <select className="form-select" value={budgetForm.category} onChange={e => setBudgetForm({...budgetForm, category: e.target.value})}>
                        {Object.keys(CATEGORY_ICONS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <input type="number" className="form-input" placeholder="Set Limit" value={budgetForm.limit} onChange={e => setBudgetForm({...budgetForm, limit: e.target.value})} />
                      <button type="submit" className="btn-icon"><Plus size={18} /></button>
                    </form>

                    <div className="budget-list">
                      {insights?.budgetStatus.length === 0 ? (
                        <p style={{ fontSize: '0.8rem', opacity: 0.6, textAlign: 'center' }}>No budgets set yet.</p>
                      ) : (
                        insights?.budgetStatus.map((b, i) => (
                          <div key={i} className="budget-item">
                            <div className="item-header">
                              <span>{b.category}</span>
                              <span>₹{b.spent.toLocaleString()} / ₹{b.limit.toLocaleString()}</span>
                            </div>
                            <div className="progress-bg">
                              <div className={`progress-fill ${b.percent >= 100 ? 'over' : b.percent >= 80 ? 'warning' : ''}`} style={{ width: `${Math.min(b.percent, 100)}%` }}></div>
                            </div>
                            {b.alert && <span className="budget-alert">{b.alert}</span>}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'goals' && (
            <div className="main-grid">
              <div className="left-column">
                <div className="glass-panel">
                  <h2 className="panel-title"><Rocket size={20} /> Financial Goals</h2>
                  <div className="goals-grid">
                    {insights?.goalStatus.map((goal) => (
                      <div key={goal.id} className="goal-card">
                        <div className="goal-header">
                          <h3>{goal.name}</h3>
                          <button className="delete-btn" onClick={() => removeGoal(goal.id)}><Trash2 size={16} /></button>
                        </div>
                        <div className="goal-metrics">
                          <span>₹{goal.current.toLocaleString()} saved</span>
                          <span>Target: ₹{goal.target.toLocaleString()}</span>
                        </div>
                        <div className="progress-bg large">
                          <div className="progress-fill" style={{ width: `${goal.percent}%` }}></div>
                        </div>
                        <div className="goal-footer">
                          <span>{goal.percent.toFixed(0)}% Achieved</span>
                          {goal.deadline && <span>Deadline: {goal.deadline}</span>}
                        </div>
                      </div>
                    ))}
                    {insights?.goalStatus.length === 0 && <div className="empty-state">No active goals. Set your first goal to the right!</div>}
                  </div>
                </div>
              </div>
              <div className="right-column">
                <div className="glass-panel">
                  <h2 className="panel-title">Add New Goal</h2>
                  <form onSubmit={handleSubmitGoal}>
                    <div className="form-group">
                      <label>Goal Name</label>
                      <input type="text" className="form-input" placeholder="e.g. New Macbook" value={goalForm.name} onChange={e => setGoalForm({...goalForm, name: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Target Amount (₹)</label>
                      <input type="number" className="form-input" placeholder="0.00" value={goalForm.target} onChange={e => setGoalForm({...goalForm, target: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Deadline (Optional)</label>
                      <input type="date" className="form-input" value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})} />
                    </div>
                    <button type="submit" className="btn">Start Saving</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="main-grid">
              <div className="left-column">
                <div className="glass-panel" style={{ marginBottom: '1.5rem' }}>
                  <h2 className="panel-title"><Settings size={20} /> Auto-Categorization Rules</h2>
                  <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>Define custom keywords. If a transaction description matches a keyword, it will be automatically categorized.</p>
                  <div className="rules-list">
                    {rules.map((rule) => (
                      <div key={rule.id} className="rule-item">
                        <div className="rule-info">
                          <span className="keyword">"{rule.keyword}"</span>
                          <span className="blue-arrow">⮕</span>
                          <span className="category">{CATEGORY_ICONS[rule.category]} {rule.category}</span>
                        </div>
                        <button className="delete-btn" onClick={() => removeRule(rule.id)}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    {rules.length === 0 && <div className="empty-state">No custom rules yet.</div>}
                  </div>
                </div>

                <div className="glass-panel">
                  <h2 className="panel-title"><AlertTriangle size={20} /> Notification Settings</h2>
                  <div className="settings-item">
                    <div className="settings-info">
                      <h3>Weekly Summary Email</h3>
                      <p>Receive a financial digest every Sunday night.</p>
                    </div>
                    <button 
                      className={`toggle-switch ${settings.notifications_enabled ? 'on' : 'off'}`}
                      onClick={() => updateSettings({ notifications_enabled: !settings.notifications_enabled })}
                    >
                      <div className="switch-handle"></div>
                    </button>
                  </div>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--panel-border)' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                      Want to see what the email looks like? This will trigger a sample summary to the console logs.
                    </p>
                    <button className="btn-secondary btn-full" onClick={() => triggerSummary()}>
                      Test Weekly Summary (Log to Console)
                    </button>
                  </div>
                </div>
              </div>
              <div className="right-column">
                <div className="glass-panel">
                  <h2 className="panel-title">Add Rule</h2>
                  <form onSubmit={handleSubmitRule}>
                    <div className="form-group">
                      <label>Keyword</label>
                      <input type="text" className="form-input" placeholder="e.g. Amazon" value={ruleForm.keyword} onChange={e => setRuleForm({...ruleForm, keyword: e.target.value})} />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select className="form-select" value={ruleForm.category} onChange={e => setRuleForm({...ruleForm, category: e.target.value})}>
                        {Object.keys(CATEGORY_ICONS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <button type="submit" className="btn">Add Rule</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
