const nodemailer = require('nodemailer');

// Mock transporter for demonstration
// In production, replace with real SMTP credentials in .env
const transporter = nodemailer.createTransport({
  jsonTransport: true // Logs emails as JSON to the console instead of sending
});

/**
 * Generates a weekly summary HTML email.
 */
const generateWeeklyEmailTemplate = (userEmail, stats) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
      <h2 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Weekly Financial Intelligence Summary</h2>
      <p>Hello, <strong>${userEmail}</strong>!</p>
      <p>Here is your financial overview for the past 7 days:</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <table style="width: 100%;">
          <tr>
            <td style="color: #64748b;">Total Income</td>
            <td style="text-align: right; font-weight: bold; color: #10b981;">Rs. ${stats.totalIncome.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #64748b;">Total Expenses</td>
            <td style="text-align: right; font-weight: bold; color: #ef4444;">Rs. ${stats.totalExpense.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding-top: 10px; font-size: 1.1em;">Net Balance</td>
            <td style="text-align: right; font-weight: bold; padding-top: 10px; font-size: 1.1em;">Rs. ${stats.balance.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <h3 style="color: #1e293b;">Smart Insights</h3>
      <ul style="padding-left: 20px;">
        ${stats.smartInsights.map(insight => `<li style="margin-bottom: 8px;">${insight}</li>`).join('')}
      </ul>

      ${stats.budgetAlerts.length > 0 ? `
        <h3 style="color: #ef4444;">Budget Alerts</h3>
        <div style="background-color: #fef2f2; padding: 10px; border-radius: 6px; border: 1px solid #fee2e2;">
          <ul style="padding-left: 20px; margin: 0;">
            ${stats.budgetAlerts.map(alert => `<li style="color: #b91c1c;">${alert}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 0.85em; color: #94a3b8; text-align: center;">
        <p>You received this email because you have weekly notifications enabled.</p>
        <p>You can manage your notification settings in the Finance Intelligence dashboard.</p>
      </div>
    </div>
  `;
};

const sendWeeklySummary = async (userEmail, stats) => {
  const html = generateWeeklyEmailTemplate(userEmail, stats);
  
  try {
    const info = await transporter.sendMail({
      from: '"Finance Intelligence" <noreply@finance.ai>',
      to: userEmail,
      subject: `Your Weekly Financial Summary - ${new Date().toLocaleDateString()}`,
      html: html
    });
    
    console.log(`[Email Mock] Sent weekly summary to ${userEmail}`);
    console.log('--- Email Content Start ---');
    console.log(info.message);
    console.log('--- Email Content End ---');
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${userEmail}:`, error);
    return false;
  }
};

module.exports = { sendWeeklySummary };
