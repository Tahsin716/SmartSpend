import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserConsent } from '../services/api';
import { UserConsent, UserInfo } from '../types';
import { Box, Typography, CircularProgress, Alert, Paper, Checkbox, FormControlLabel, FormGroup, Button, Divider } from '@mui/material';

const ProfilePage: React.FC = () => {
    // Get user and setter directly from context
    const { user: authUser, setUser: setAuthUser } = useAuth();

    // Local state ONLY for managing consent form changes before saving
    const [localConsent, setLocalConsent] = useState<UserConsent>({
        dataProcessing: true, // Default mandatory
        externalApiUsage: false,
    });

    // State for API operations
    const [loadingUpdate, setLoadingUpdate] = useState<boolean>(false);
    const [errorUpdate, setErrorUpdate] = useState<string>('');
    const [successUpdate, setSuccessUpdate] = useState<string>('');
    const [isConsentDirty, setIsConsentDirty] = useState<boolean>(false); // Track if changes were made

    // Effect to sync local consent state when authUser context changes
    useEffect(() => {
        if (authUser?.consent) {
            setLocalConsent(authUser.consent);
            setIsConsentDirty(false); // Reset dirty flag when synced from context
        }
        // We don't fetch profile here unless authUser is missing critical display info
        // that wasn't available on login. For now, assume authUser is sufficient.
    }, [authUser]); // Depend ONLY on authUser from context

    // Handler for checkbox changes -> updates local state
    const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.target;
        setLocalConsent(prev => {
            const newState = { ...prev, [name]: checked };
            // Check if the new local state differs from the official authUser state
            setIsConsentDirty(JSON.stringify(newState) !== JSON.stringify(authUser?.consent));
            return newState;
        });
        setErrorUpdate(''); // Clear errors when changing consent
        setSuccessUpdate('');
    };

    // Handler to save changes -> updates API and then context
    const handleUpdateConsent = async () => {
        setErrorUpdate('');
        setSuccessUpdate('');
        setLoadingUpdate(true);

        if (!localConsent.dataProcessing) {
            setErrorUpdate('Consent for core data processing is mandatory.');
            setLoadingUpdate(false);
            return;
        }

        try {
            // Call API with the localConsent state
            const { data: updatedUser } = await updateUserConsent({
                dataProcessing: localConsent.dataProcessing, // Should be true
                externalApiUsage: localConsent.externalApiUsage,
            });

            // --- IMPORTANT: Update the Auth Context ---
            // This ensures the global state reflects the change
            setAuthUser(prevAuthUser => prevAuthUser ? { ...prevAuthUser, consent: updatedUser.consent } : null);
            // The useEffect above will automatically sync localConsent after this update
            // ------------------------------------------

            // Also update localStorage to persist across refreshes if token wasn't renewed
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
                try {
                    const parsedInfo: UserInfo = JSON.parse(storedUserInfo);
                    // Update only the consent part within the stored object
                    parsedInfo.consent = updatedUser.consent;
                    localStorage.setItem('userInfo', JSON.stringify(parsedInfo));
                } catch (e) { console.error("Failed to update localStorage user info:", e); }
            }

            setSuccessUpdate('Consent settings updated successfully!');
            setIsConsentDirty(false); // Reset dirty flag after successful save
            setTimeout(() => setSuccessUpdate(''), 3000);

        } catch (err: any) {
            setErrorUpdate(err.response?.data?.message || 'Failed to update consent settings.');
            // Don't revert local state automatically, let user see the error and retry/change
        } finally {
            setLoadingUpdate(false);
        }
    };

    // Display loading if authUser hasn't loaded yet from context
    if (!authUser) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Format registration date safely
    const registrationDate = authUser.createdAt
        ? new Date(authUser.createdAt).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Your Profile
            </Typography>

            <Paper sx={{ p: 3 }}>
                 <> {/* No need for loadingProfile state now */}
                    <Typography variant="h6" gutterBottom>Account Details</Typography>
                    <Typography><strong>Name:</strong> {authUser.name}</Typography>
                    <Typography><strong>Email:</strong> {authUser.email}</Typography>
                    <Typography><strong>Member Since:</strong> {registrationDate}</Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h6" gutterBottom>Consent Settings</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>Manage how your data is used.</Typography>

                    {errorUpdate && <Alert severity="error" sx={{ mb: 2 }}>{errorUpdate}</Alert>}
                    {successUpdate && <Alert severity="success" sx={{ mb: 2 }}>{successUpdate}</Alert>}

                    <FormGroup>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={localConsent.dataProcessing} // Use local state
                                    onChange={handleConsentChange}
                                    name="dataProcessing"
                                    disabled // Mandatory
                                />
                            }
                            label={ <Typography variant="body2">Allow processing of financial data for core features (Mandatory)</Typography> }
                        />
                         <FormControlLabel
                            control={
                                <Checkbox
                                    checked={localConsent.externalApiUsage} // Use local state
                                    onChange={handleConsentChange}
                                    name="externalApiUsage"
                                    color="primary"
                                    disabled={loadingUpdate}
                                 />
                            }
                            label={ <Typography variant="body2">Allow analysis for personalized insights (Optional)</Typography> }
                         />
                    </FormGroup>

                    <Button
                        variant="contained"
                        onClick={handleUpdateConsent}
                        // Only enable save button if changes have been made
                        disabled={loadingUpdate || !isConsentDirty}
                        sx={{ mt: 2 }}
                        startIcon={loadingUpdate ? <CircularProgress size={20} color="inherit"/> : null}
                    >
                        {loadingUpdate ? 'Saving...' : 'Save Changes'}
                    </Button>
                 </>
            </Paper>
        </Box>
    );
};

export default ProfilePage;