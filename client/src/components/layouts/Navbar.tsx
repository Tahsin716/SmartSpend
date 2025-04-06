import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Use the typed hook

import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SavingsIcon from '@mui/icons-material/Savings';
import ArticleIcon from '@mui/icons-material/Article';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth(); // Get user and logout function
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect after logout
    };

    

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        SmartSpend
                    </RouterLink>
                </Typography>

                {user && ( 
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Button color="inherit" component={RouterLink} to="/dashboard" startIcon={<DashboardIcon />}>Dashboard</Button>
                        <Button color="inherit" component={RouterLink} to="/expenses" startIcon={<ReceiptLongIcon />}>Expenses</Button>
                        <Button color="inherit" component={RouterLink} to="/budgets" startIcon={<SavingsIcon />}>Budgets</Button>
                        <Button color="inherit" component={RouterLink} to="/resources" startIcon={<ArticleIcon />}>Resources</Button>
                        <Button color="inherit" component={RouterLink} to="/profile" startIcon={<AccountCircleIcon />}>Profile</Button>
                        <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>Logout</Button>
                    </Box>
                )}

                 {user && (
                    <Box sx={{ display: { xs: 'flex', sm: 'none' }, alignItems: 'center' }}>
                        <Tooltip title="Dashboard">
                             <IconButton color="inherit" component={RouterLink} to="/dashboard"><DashboardIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Profile">
                             <IconButton color="inherit" component={RouterLink} to="/profile"><AccountCircleIcon /></IconButton>
                        </Tooltip>
                        <Tooltip title="Logout">
                            <IconButton color="inherit" onClick={handleLogout}><LogoutIcon /></IconButton>
                        </Tooltip>
                    </Box>
                 )}

            </Toolbar>
        </AppBar>
    );
};

export default Navbar;