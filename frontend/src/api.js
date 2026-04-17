const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }
  return response.json();
}

export async function register(email, password) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  return response.json();
}

export async function getTransactions() {
  const response = await fetch('/api/transactions', { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch transactions');
  return response.json();
}

export async function addTransaction(data) {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add transaction');
  return response.json();
}

export async function getInsights() {
  const response = await fetch('/api/insights', { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch insights');
  return response.json();
}

export async function getBudgets() {
  const response = await fetch('/api/budgets', { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch budgets');
  return response.json();
}

export async function addBudget(data) {
  const response = await fetch('/api/budgets', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add budget');
  return response.json();
}

// --- Category Rules ---
export async function getCategoryRules() {
  const response = await fetch('/api/category-rules', { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch rules');
  return response.json();
}

export async function addCategoryRule(data) {
  const response = await fetch('/api/category-rules', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add rule');
  return response.json();
}

export async function deleteCategoryRule(id) {
  const response = await fetch(`/api/category-rules/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete rule');
  return response.json();
}

// --- Goals ---
export async function getGoals() {
  const response = await fetch('/api/goals', { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch goals');
  return response.json();
}

export async function addGoal(data) {
  const response = await fetch('/api/goals', {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to add goal');
  return response.json();
}

export async function deleteGoal(id) {
  const response = await fetch(`/api/goals/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete goal');
  return response.json();
}

// --- User Settings ---
export async function getUserSettings() {
  const response = await fetch('/api/user/settings', { headers: getHeaders() });
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
}

export async function updateUserSettings(data) {
  const response = await fetch('/api/user/settings', {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
}

export async function triggerWeeklySummary() {
  const response = await fetch('/api/test/trigger-weekly-summary', {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error('Failed to trigger summary');
  return response.json();
}



