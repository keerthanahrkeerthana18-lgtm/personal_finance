export async function getTransactions() {
  const response = await fetch('/api/transactions');
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function addTransaction(data) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add transaction');
  return response.json();
}

export async function getInsights() {
  const response = await fetch('/api/insights');
  if (!response.ok) throw new Error('Failed to fetch insights');
  return response.json();
}
