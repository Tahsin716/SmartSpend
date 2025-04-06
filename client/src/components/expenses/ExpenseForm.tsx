import React, { useState } from 'react';
import { addExpense } from '../../services/api';
import { Box, TextField, Button, Typography, Alert, CircularProgress, Stack } from '@mui/material';
import { Expense, ExpenseData } from '../../types';

interface ExpenseFormProps {
    onExpenseAdded?: (newExpense: Expense) => void; 
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onExpenseAdded }) => {
    const [category, setCategory] = useState<string>('');
    const [amount, setAmount] = useState<string>(''); 
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        switch (name) {
            case 'category': setCategory(value); break;
            case 'amount': setAmount(value); break;
            case 'date': setDate(value); break;
            case 'description': setDescription(value); break;
            default: break;
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!category || !amount || !date) {
            setError('Please fill in Category, Amount, and Date.');
            return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setError('Please enter a valid positive amount.');
            return;
        }

        setLoading(true);
        try {
            const expenseData: ExpenseData = {
                category: category.trim(),
                amount: parsedAmount,
                date,
                description: description.trim() || undefined, 
            };
            const { data: newExpense } = await addExpense(expenseData);

            setCategory('');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setSuccess('Expense added successfully!');

            if (onExpenseAdded) {
                onExpenseAdded(newExpense);
            }
            setTimeout(() => setSuccess(''), 3000); 

        } catch (err: any) { 
            console.error("Error adding expense:", err);
            setError(err.response?.data?.message || 'Failed to add expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ 
                display: 'flex', flexDirection: 'column', gap: 2, p: 2,
                border: '1px solid', borderColor: 'grey.300', borderRadius: 1,
                maxWidth: '500px', margin: 'auto'
            }}
        >
            <Typography variant="h6" component="h3" gutterBottom>
                Log New Expense
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField name="category" label="Category" variant="outlined" value={category} onChange={handleInputChange} required fullWidth disabled={loading} />
            <TextField name="amount" label="Amount (£)" variant="outlined" type="number" value={amount} onChange={handleInputChange} required fullWidth disabled={loading} inputProps={{ step: "0.01", min: "0.01" }} />
            <TextField name="date" label="Date" type="date" variant="outlined" value={date} onChange={handleInputChange} InputLabelProps={{ shrink: true }} required fullWidth disabled={loading} />
            <TextField name="description" label="Description (Optional)" variant="outlined" multiline rows={2} value={description} onChange={handleInputChange} fullWidth disabled={loading} />

            <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null} sx={{ mt: 1 }}>
                {loading ? 'Adding...' : 'Add Expense'}
            </Button>
        </Box>
    );
};

export default ExpenseForm;