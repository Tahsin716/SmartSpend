import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
    Container, Box, TextField, Button, Typography, Link, Alert, CircularProgress,
    Checkbox, FormControlLabel, FormGroup, Paper
} from '@mui/material';
import { UserConsent, RegisterData } from '../types'; 

const RegisterPage: React.FC = () => {
    const [name, setName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [consent, setConsent] = useState<UserConsent>({
        dataProcessing: false,
        externalApiUsage: false, // Default consent state
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { register } = useAuth(); // Use the typed hook
    const navigate = useNavigate();

    // Type event handlers
    const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setConsent(prev => ({ ...prev, [event.target.name]: event.target.checked }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError('');

        // --- Validation ---
        if (password !== confirmPassword) {
            setError('Passwords do not match'); return;
        }
        if (!name || !email || !password) {
            setError('Please fill in all required fields'); return;
        }
        if (!consent.dataProcessing) {
            setError('You must agree to the processing of your data to register.'); return;
        }
        // -----------------

        setLoading(true);
        try {
            const registerData: RegisterData = { name, email, password, consent };
            await register(registerData);
            navigate('/dashboard'); // Redirect after successful registration
        } catch (err: any) { // Type error
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper elevation={3} sx={{ mt: 8, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Register for SmartSpend
                </Typography>
                {error && <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>}
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    {/* TextFields for name, email, password, confirmPassword - Type value and onChange */}
                    <TextField margin="normal" required fullWidth id="name" label="Full Name" name="name" autoComplete="name" autoFocus value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                    <TextField margin="normal" required fullWidth id="email" label="Email Address" name="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                    <TextField margin="normal" required fullWidth name="password" label="Password" type="password" id="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} />
                    <TextField margin="normal" required fullWidth name="confirmPassword" label="Confirm Password" type="password" id="confirmPassword" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />

                    {/* --- Consent Section (Typed Checkbox/Labels) --- */}
                    <FormGroup sx={{ mt: 2, mb: 2, border: '1px solid', borderColor: 'grey.400', p: 2, borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Data Usage & Consent</Typography>
                        <FormControlLabel
                            control={ <Checkbox checked={consent.dataProcessing} onChange={handleConsentChange} name="dataProcessing" color="primary" required disabled={loading} /> }
                            label={ <Typography variant="body2">* I agree to the processing of my financial data for app features. (<Link component={RouterLink} to="/privacy-policy" target="_blank">Privacy Policy</Link>)</Typography> }
                        />
                        <FormControlLabel
                            control={ <Checkbox checked={consent.externalApiUsage} onChange={handleConsentChange} name="externalApiUsage" color="primary" disabled={loading}/> }
                            label={ <Typography variant="body2">Allow analysis for personalized tips (optional, changeable later).</Typography>}
                        />
                    </FormGroup>
                    {/* --------------------- */}

                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={loading || !consent.dataProcessing}>
                        {loading ? <CircularProgress size={24} /> : 'Register'}
                    </Button>
                    <Box textAlign="center">
                        <Link component={RouterLink} to="/login" variant="body2">
                            Already have an account? Login
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;