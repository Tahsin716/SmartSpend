import React, { useState, useEffect, useCallback } from 'react';
import { getBudgets, deleteBudget } from '../services/api';
import { Budget } from '../types';
import BudgetForm from '../components/budgets/BudgetForm';
import BudgetItem from '../components/budgets/BudgetItem';
import { Box, Typography, CircularProgress, Alert, List, Paper, Grid, Divider, Select, MenuItem, FormControl, InputLabel, SelectChangeEvent, Button } from '@mui/material';

const BudgetPage: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const [selectedYear, setSelectedYear] = useState<number>(currentYear);
    const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null); // State to hold budget being edited

    // Function to generate year options (e.g., last 5 years + current + next 2)
    const getYearOptions = () => {
        const years = [];
        for (let i = currentYear - 5; i <= currentYear + 2; i++) {
            years.push(i);
        }
        return years;
    };
    const yearOptions = getYearOptions();

    // Function to generate month options
    const monthOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: new Date(0, i).toLocaleString('en-GB', { month: 'long' })
    }));

    const fetchBudgetsForPeriod = useCallback(async (year: number, month: number) => {
        setLoading(true);
        setError('');
        setEditingBudget(null); // Clear editing state when period changes
        try {
            const { data } = await getBudgets(year, month);
            setBudgets(data);
        } catch (err: any) {
            setError(err.response?.data?.message || `Failed to fetch budgets for ${month}/${year}.`);
            setBudgets([]);
        } finally {
            setLoading(false);
        }
    }, []); // Stable function identity

    useEffect(() => {
        fetchBudgetsForPeriod(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth, fetchBudgetsForPeriod]);

    const handleYearChange = (event: SelectChangeEvent<number>) => {
        setSelectedYear(event.target.value as number);
    };

    const handleMonthChange = (event: SelectChangeEvent<number>) => {
        setSelectedMonth(event.target.value as number);
    };

    // Callback for the form to update the list
    const handleBudgetSet = (savedBudget: Budget) => {
        setBudgets(prev => {
            const index = prev.findIndex(b => b._id === savedBudget._id);
            let newState;
            if (index > -1) { // Update existing
                newState = [...prev];
                newState[index] = savedBudget;
            } else { // Add new
                newState = [...prev, savedBudget];
            }
            // Sort alphabetically by category
            return newState.sort((a, b) => a.category.localeCompare(b.category));
        });
        setEditingBudget(null); // Exit editing mode
    };

    const handleDeleteBudget = async (id: string) => {
        setDeletingId(id);
        setError('');
        try {
            await deleteBudget(id);
            setBudgets(prev => prev.filter(b => b._id !== id));
            if(editingBudget?._id === id) { // If deleting the item currently being edited
                setEditingBudget(null);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete budget.');
        } finally {
            setDeletingId(null);
        }
    };

     const handleEditBudget = (budget: Budget) => {
         setEditingBudget(budget); // Set the budget to be edited, form will pre-fill
         // Optionally scroll form into view if needed
         document.getElementById('budget-form-section')?.scrollIntoView({ behavior: 'smooth' });
     };


    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Manage Budgets
            </Typography>

            {/* Period Selection */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Select Period</Typography>
                <Grid container spacing={2}>
                    <Grid size={{xs:6}}>
                        <FormControl fullWidth>
                            <InputLabel id="year-select-label">Year</InputLabel>
                            <Select
                                labelId="year-select-label"
                                id="year-select"
                                value={selectedYear}
                                label="Year"
                                onChange={handleYearChange}
                            >
                                {yearOptions.map(year => (
                                    <MenuItem key={year} value={year}>{year}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{xs:6}}>
                         <FormControl fullWidth>
                            <InputLabel id="month-select-label">Month</InputLabel>
                            <Select
                                labelId="month-select-label"
                                id="month-select"
                                value={selectedMonth}
                                label="Month"
                                onChange={handleMonthChange}
                            >
                                {monthOptions.map(month => (
                                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                <Grid size={{xs:12, md:5, lg:4}} id="budget-form-section">
                     <Paper sx={{ p: 2 }}>
                        <BudgetForm
                            onBudgetSet={handleBudgetSet}
                            currentYear={selectedYear}
                            currentMonth={selectedMonth}
                            existingBudget={editingBudget}
                         />
                         {editingBudget && ( // Show button to cancel editing
                            <Button onClick={() => setEditingBudget(null)} sx={{mt: 2}} size="small">
                                Cancel Edit
                            </Button>
                         )}
                     </Paper>
                </Grid>

                <Grid size={{xs:12, md:7, lg:8}} >
                     <Paper sx={{ p: 2 }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Budgets for {monthOptions.find(m => m.value === selectedMonth)?.label} {selectedYear}
                        </Typography>
                        <Divider sx={{mb: 2}}/>
                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : budgets.length === 0 ? (
                             <Typography variant="body1" sx={{textAlign: 'center', my: 4}}>
                                No budgets set for this period. Add one using the form!
                            </Typography>
                        ): (
                            <List disablePadding>
                                {budgets.map((budget) => (
                                    <BudgetItem
                                        key={budget._id}
                                        budget={budget}
                                        onDelete={handleDeleteBudget}
                                        onEdit={handleEditBudget} // Pass edit handler
                                        deleting={deletingId === budget._id}
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

export default BudgetPage;