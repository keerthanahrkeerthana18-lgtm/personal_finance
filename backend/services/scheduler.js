const cron = require('node-cron');
const db = require('../database');
const { sendWeeklySummary } = require('./emailService');

/**
 * Weekly Summary Scheduler
 * Runs every Sunday at 11:59 PM
 */
const initScheduler = () => {
  // schedule: min hour dom month dow
  cron.schedule('59 23 * * 0', async () => {
    console.log('--- Starting Weekly Summary CRON Job ---');
    
    db.all('SELECT id, email FROM users WHERE notifications_enabled = 1', async (err, users) => {
      if (err) return console.error('Error fetching users for summary:', err);
      
      for (const user of users) {
        await processUserSummary(user);
      }
      
      console.log('--- Weekly Summary CRON Job Finished ---');
    });
  });
};

/**
 * Aggregates data for a specific user and triggers email
 */
const processUserSummary = async (user) => {
  return new Promise((resolve) => {
    const userId = user.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevWeekDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Queries: transactions and budgets
    db.all('SELECT * FROM transactions WHERE user_id = ? AND date >= ?', [userId, prevWeekDate.toISOString().split('T')[0]], (err, transactions) => {
      if (err) return resolve();

      db.all('SELECT * FROM budgets WHERE user_id = ?', [userId], (err, budgets) => {
        if (err || !budgets) budgets = [];

        let totalIncome = 0;
        let totalExpense = 0;
        let currentWeekExpense = 0;
        let previousWeekExpense = 0;
        const categoryTotals = {};

        transactions.forEach(tx => {
          const amount = Number(tx.amount);
          const txDate = new Date(tx.date);

          if (txDate >= sevenDaysAgo) {
            if (tx.type === 'income') totalIncome += amount;
            else {
              totalExpense += amount;
              currentWeekExpense += amount;
              categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amount;
            }
          } else if (tx.type === 'expense') {
            previousWeekExpense += amount;
          }
        });

        // Insights
        const balance = totalIncome - totalExpense;
        const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;
        const smartInsights = [];
        
        if (previousWeekExpense > 0) {
          const diff = ((currentWeekExpense - previousWeekExpense) / previousWeekExpense) * 100;
          if (diff > 0) smartInsights.push(`You spent ${diff.toFixed(0)}% more this week.`);
          else smartInsights.push(`Excellent! You spent ${Math.abs(diff).toFixed(0)}% less this week.`);
        }
        smartInsights.push(`Your weekly savings rate is ${savingsRate.toFixed(1)}%.`);

        // Budget Alerts
        const budgetAlerts = [];
        budgets.forEach(b => {
          const spent = categoryTotals[b.category] || 0;
          if (spent >= b.monthly_limit) {
            budgetAlerts.push(`Overspent monthly ${b.category} budget this week alone! (₹${spent.toLocaleString()} spent)`);
          } else if (spent >= b.monthly_limit * 0.8) {
            budgetAlerts.push(`Approaching monthly ${b.category} budget limit.`);
          }
        });

        sendWeeklySummary(user.email, {
          totalIncome,
          totalExpense,
          balance,
          savingsRate,
          smartInsights,
          budgetAlerts
        }).then(resolve);
      });
    });
  });
};

module.exports = { initScheduler };
