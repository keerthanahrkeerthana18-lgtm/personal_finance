import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generatePDFReport = (transactions, insights, userEmail) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(59, 130, 246); // Accent blue
  doc.text('Financial Intelligence Report', 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${dateStr}`, 14, 30);
  doc.text(`Account: ${userEmail}`, 14, 35);
  
  // Summary Section
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text('Executive Summary', 14, 50);
  
  doc.setFontSize(12);
  doc.text(`Total Income:  Rs. ${insights.totalIncome.toLocaleString()}`, 14, 60);
  doc.text(`Total Expense: Rs. ${insights.totalExpense.toLocaleString()}`, 14, 67);
  doc.text(`Net Balance:   Rs. ${insights.balance.toLocaleString()}`, 14, 74);
  doc.text(`Savings Rate:  ${insights.savingsRate.toFixed(1)}%`, 14, 81);

  // Insights
  doc.setFontSize(16);
  doc.text('Smart Insights', 14, 95);
  doc.setFontSize(11);
  let insightY = 103;
  insights.smartInsights.forEach(text => {
    doc.text(`• ${text.replace('👍', '').replace('⚠️', '')}`, 14, insightY);
    insightY += 7;
  });

  // Category Breakdown Table
  const categoryData = Object.entries(insights.categoryBreakdown).map(([cat, amt]) => [cat, `Rs. ${amt.toLocaleString()}`]);
  doc.autoTable({
    startY: insightY + 10,
    head: [['Category', 'Amount Spent']],
    body: categoryData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });

  // Full Transaction History
  doc.addPage();
  doc.setFontSize(16);
  doc.text('Transaction History', 14, 20);
  
  const txData = transactions.map(tx => [
    tx.date,
    tx.category,
    tx.description || '-',
    tx.type.toUpperCase(),
    `Rs. ${Number(tx.amount).toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 25,
    head: [['Date', 'Category', 'Description', 'Type', 'Amount']],
    body: txData,
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246] }
  });

  doc.save(`finance_report_${new Date().toISOString().split('T')[0]}.pdf`);
};
