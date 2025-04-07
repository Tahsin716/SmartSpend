import React from 'react';
import { ListItem, ListItemText, Typography, IconButton, Tooltip, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Budget } from '../../types';

interface BudgetItemProps {
    budget: Budget;
    onDelete: (id: string) => void; // Callback to handle deletion
    onEdit: (budget: Budget) => void; // Callback to handle editing
    deleting: boolean;
}

const BudgetItem: React.FC<BudgetItemProps> = ({ budget, onDelete, onEdit, deleting }) => {

    const handleDeleteClick = () => {
        if (window.confirm(`Are you sure you want to delete the budget for ${budget.category}?`)) {
            onDelete(budget._id);
        }
    };

    const handleEditClick = () => {
        onEdit(budget);
    };

    return (
        <ListItem
            secondaryAction={
                <Box>
                     <Tooltip title="Edit Budget">
                        <IconButton edge="end" aria-label="edit" onClick={handleEditClick} disabled={deleting} sx={{mr: 0.5}}>
                            <EditIcon fontSize='small'/>
                        </IconButton>
                     </Tooltip>
                     <Tooltip title="Delete Budget">
                        <span> {/* Span needed when button is disabled */}
                            <IconButton edge="end" aria-label="delete" onClick={handleDeleteClick} disabled={deleting}>
                                <DeleteIcon fontSize='small'/>
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            }
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
        >
            <ListItemText
                primary={
                    <Typography variant="body1" component="span" sx={{ fontWeight: 'medium' }}>
                        {budget.category}
                    </Typography>
                }
                secondary={
                     <Typography component="span" variant="body2" color="text.primary">
                         Budget: £{budget.amount.toFixed(2)}
                     </Typography>
                }
            />
        </ListItem>
    );
};

export default BudgetItem;