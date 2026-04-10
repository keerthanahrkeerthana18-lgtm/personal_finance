const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET all transactions
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST a new transaction
app.post('/api/transactions', (req, res) => {
  const { amount, type, category, date, description } = req.body;
  if (!amount || !type || !category || !date) {
    res.status(400).json({ error: "Please provide amount, type, category, and date" });
    return;
  }
  
  db.run(`INSERT INTO transactions (amount, type, category, date, description) VALUES (?, ?, ?, ?, ?)`,
    [amount, type, category, date, description],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, amount, type, category, date, description });
    }
  );
});

// GET insights
app.get('/api/insights', (req, res) => {
  db.all('SELECT * FROM transactions', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    rows.forEach(tx => {
      exportAmount = Number(tx.amount);
      if (tx.type === 'income') {
        totalIncome += exportAmount;
      } else {
        totalExpense += exportAmount;
        if (!categoryBreakdown[tx.category]) {
          categoryBreakdown[tx.category] = 0;
        }
        categoryBreakdown[tx.category] += exportAmount;
      }
    });

    const suggestions = [];
    if (totalExpense > totalIncome && totalIncome > 0) {
      suggestions.push({ type: 'warning', text: "Your total expenses currently exceed your income." });
    }
    
    for (const [category, amount] of Object.entries(categoryBreakdown)) {
      if (totalIncome > 0 && amount > totalIncome * 0.3) {
        suggestions.push({ type: 'alert', text: `Consider cutting back on ${category}. It represents over 30% of your income.` });
      }
    }

    if (suggestions.length === 0) {
      suggestions.push({ type: 'success', text: "Your budget looks healthy! Keep up the good work." });
    }

    res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      categoryBreakdown,
      suggestions
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
