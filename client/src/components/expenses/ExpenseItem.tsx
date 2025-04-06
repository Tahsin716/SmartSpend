import React from 'react';
import { ListItem, ListItemText, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Expense } from '../../types';

interface ExpenseItemProps {
    expense: Expense;
    onDelete: (id: string) => void; 
    deleting: boolean; 
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onDelete, deleting }) => {

    const handleDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete the expense for ${expense.category} on ${new Date(expense.date).toLocaleDateString()}?`)) {
            onDelete(expense._id);
        }
    };

    const formattedDate = new Date(expense.date).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
    });

    return (
        <ListItem
            secondaryAction={
                <Tooltip title="Delete Expense">
                    <span> 
                        <IconButton edge="end" aria-label="delete" onClick={handleDeleteClick} disabled={deleting}>
                            <DeleteIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            }
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
            <ListItemText
                primary={
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
                        {expense.category}
                    </Typography>
                }
                secondary={
                    <>
                        <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                            £{expense.amount.toFixed(2)} - {formattedDate}
                        </Typography>
                        {expense.description && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {expense.description}
                            </Typography>
                        )}
                    </>
                }
            />
        </ListItem>
    );
};

export default ExpenseItem;