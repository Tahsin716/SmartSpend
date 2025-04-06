import React, { useState, useEffect, useCallback } from 'react';
import { getExpenses  } from '../services/api';
import { Expense } from '../types';
import ExpenseForm from '../components/expenses/ExpenseForm'; 
import ExpenseItem from '../components/expenses/ExpenseItem';
import { Box, Typography, CircularProgress, Alert, List, Paper, Grid, Divider } from '@mui/material';

const ExpensesPage: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [deletingId, setDeletingId] = useState<string | null>(null); 

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getExpenses();
            data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setExpenses(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch expenses.');
            setExpenses([]); 
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleExpenseAdded = (newExpense: Expense) => {
        setExpenses(prevExpenses =>
            [newExpense, ...prevExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        );
    };

     const handleDeleteExpense = async (id: string) => {
          setDeletingId(id); // Indicate deletion in progress for this item
          setError(''); // Clear previous errors
          try {
            // --- IMPORTANT ---
            // You need to implement `deleteExpense` in `src/services/api.ts`
            // and the corresponding DELETE route/controller on the backend.
            // Example call (assuming implementation exists):
            // await deleteExpense(id);

            console.log(`Attempting to delete expense with ID: ${id}`); // Placeholder
            await new Promise(resolve => setTimeout(resolve, 500));

            setExpenses(prevExpenses => prevExpenses.filter(exp => exp._id !== id));

          } catch (err: any) {
              console.error("Error deleting expense:", err);
              setError(err.response?.data?.message || 'Failed to delete expense.');
          } finally {
             setDeletingId(null); 
          }
     };


    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Manage Expenses
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5,  lg: 4}}>
                     <Paper sx={{ p: 2 }}>
                        <ExpenseForm onExpenseAdded={handleExpenseAdded} />
                     </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 7, lg:8 }}>
                     <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Expense History
                        </Typography>
                        <Divider sx={{mb: 2}}/>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : expenses.length === 0 ? (
                             <Typography variant="body1" sx={{textAlign: 'center', my: 4}}>
                                No expenses recorded yet. Add one using the form!
                            </Typography>
                        ): (
                            <List disablePadding>
                                {expenses.map((expense) => (
                                    <ExpenseItem
                                        key={expense._id}
                                        expense={expense}
                                        onDelete={handleDeleteExpense}
                                        deleting={deletingId === expense._id} 
                                     />
                                ))}
                            </List>
                         )}
                     </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ExpensesPage;