import { 
  getTransactions, addTransaction, getInsights, getBudgets, addBudget,
  getCategoryRules, addCategoryRule, deleteCategoryRule,
  getGoals, addGoal, deleteGoal,
  getUserSettings, updateUserSettings, triggerWeeklySummary
} from '../api';
import { useAuth } from '../context/AuthContext';

export function useFinanceData() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [rules, setRules] = useState([]);
  const [goals, setGoals] = useState([]);
  const [settings, setSettings] = useState({ notifications_enabled: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const [txData, insightsData, budgetData, ruleData, goalData, settingsData] = await Promise.all([
        getTransactions(),
        getInsights(),
        getBudgets(),
        getCategoryRules(),
        getGoals(),
        getUserSettings()
      ]);
      setTransactions(txData);
      setInsights(insightsData);
      setBudgets(budgetData);
      setRules(ruleData);
      setGoals(goalData);
      setSettings(settingsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateSettings = async (newData) => {
    try {
      await updateUserSettings(newData);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const triggerSummary = async () => {
    try {
      await triggerWeeklySummary();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // ... rest of the existing methods ...
  const addTx = async (txData) => {
    try {
      await addTransaction(txData);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateBudget = async (budgetData) => {
    try {
      await addBudget(budgetData);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createRule = async (ruleData) => {
    try {
      await addCategoryRule(ruleData);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeRule = async (id) => {
    try {
      await deleteCategoryRule(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createGoal = async (goalData) => {
    try {
      await addGoal(goalData);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeGoal = async (id) => {
    try {
      await deleteGoal(id);
      await fetchData();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return { 
    transactions, insights, budgets, rules, goals, settings, loading, error, 
    addTx, updateBudget, createRule, removeRule, createGoal, removeGoal,
    updateSettings, triggerSummary, refresh: fetchData 
  };
}



