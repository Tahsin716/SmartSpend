import React, { useState, useEffect } from 'react';
import { setBudget } from '../../services/api';
import { Box, TextField, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { Budget, BudgetData } from '../../types';

interface BudgetFormProps {
    onBudgetSet: (newOrUpdatedBudget: Budget) => void; // Callback after setting
    currentYear: number; // Passed from parent
    currentMonth: number; // Passed from parent
    existingBudget?: Budget | null; // Optional: Pass existing budget to pre-fill form for editing
}

const BudgetForm: React.FC<BudgetFormProps> = ({ onBudgetSet, currentYear, currentMonth, existingBudget }) => {
    const [category, setCategory] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string>('');

    useEffect(() => {
        if (existingBudget) {
            setCategory(existingBudget.category);
            setAmount(existingBudget.amount.toString());
        } else {
            setCategory('');
            setAmount('');
        }
        setError('');
        setSuccess('');
    }, [existingBudget]);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (!category || !amount) {
            setError('Please provide both category and amount.'); return;
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
            setError('Please enter a valid non-negative amount.'); return;
        }

        setLoading(true);
        try {
            const budgetData: BudgetData = {
                category: category.trim(),
                amount: parsedAmount,
                month: currentMonth,
                year: currentYear,
            };
            
            const { data: savedBudget } = await setBudget(budgetData);

            setSuccess(`Budget for ${savedBudget.category} ${existingBudget ? 'updated' : 'set'} successfully!`);
            if (!existingBudget) { // Clear form only if adding new
                 setCategory('');
                 setAmount('');
            }
            if (onBudgetSet) {
                onBudgetSet(savedBudget); // Notify parent
            }
            setTimeout(() => setSuccess(''), 3000);

        } catch (err: any) {
            console.error("Error setting budget:", err);
            setError(err.response?.data?.message || 'Failed to set budget.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" component="h3" gutterBottom>
                 {existingBudget ? 'Edit Budget' : 'Set New Budget'} for {new Date(currentYear, currentMonth - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
            </Typography>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <TextField name="category" label="Category" variant="outlined" value={category} onChange={(e) => setCategory(e.target.value)} required fullWidth disabled={loading || !!existingBudget} /* Disable category change when editing */ />
            <TextField name="amount" label="Budget Amount (£)" variant="outlined" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required fullWidth disabled={loading} inputProps={{ step: "0.01", min: "0" }} />

            <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
                {loading ? 'Saving...' : (existingBudget ? 'Update Budget' : 'Set Budget')}
            </Button>
        </Box>
    );
};

export default BudgetForm;