import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import { Container, Box, CircularProgress } from '@mui/material';

import DashboardPage from './pages/DashboardPage.tsx';
import ExpensesPage from './pages/ExpensesPage';
import BudgetPage from './pages/BudgetPage';
import ResourcesPage from './pages/ResourcesPage';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';

import Navbar from './components/layouts/Navbar.tsx';

interface ProtectedRouteProps {
    children: React.ReactElement; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px)', mt: '64px' }}> {/* Adjust height considering AppBar */}
                <CircularProgress />
            </Box>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppContent: React.FC = () => {
    const { isAuthenticated, loading } = useAuth();

     
     if (loading) {
         return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
         );
     }

    return (
        <>
            {isAuthenticated && <Navbar />}
            <Container component="main" maxWidth="lg" sx={{ mt: isAuthenticated ? 4 : 0, mb: 4 }}> 
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                    <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                    <Route path="/budgets" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
                    <Route path="/resources" element={<ProtectedRoute><ResourcesPage /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                    <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
                </Routes>
            </Container>
        </>
    );
};

const App: React.FC = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;