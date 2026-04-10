import { useState, useEffect, useCallback } from 'react';
import { getTransactions, addTransaction, getInsights } from '../api';

export function useFinanceData() {
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [txData, insightsData] = await Promise.all([
        getTransactions(),
        getInsights()
      ]);
      setTransactions(txData);
      setInsights(insightsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTx = async (txData) => {
    try {
      await addTransaction(txData);
      await fetchData(); // Refresh data perfectly
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { transactions, insights, loading, error, addTx, refresh: fetchData };
}
