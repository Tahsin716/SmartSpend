import React, { useState, useEffect } from 'react';
import { getSpendingTrends } from '../services/api'; 
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title, ChartOptions } from 'chart.js'; 
import { Box, Typography, Paper, Grid, CircularProgress, Alert } from '@mui/material';
import { ChartDataStructure, AdviceMessage } from '../types'; 
import { getPersonalizedAdvice } from '../services/api'; 


ChartJS.register(ArcElement, Tooltip, Legend, Title);

const DashboardPage: React.FC = () => {
    const [chartData, setChartData] = useState<ChartDataStructure | null>(null);
    const [advice, setAdvice] = useState<AdviceMessage[]>([]);
    const [loadingTrends, setLoadingTrends] = useState<boolean>(true);
    const [loadingAdvice, setLoadingAdvice] = useState<boolean>(true);
    const [errorTrends, setErrorTrends] = useState<string>('');
    const [errorAdvice, setErrorAdvice] = useState<string>('');


    const fetchDashboardData = async () => {
        setLoadingTrends(true);
        setErrorTrends('');
        try {
            const { data: trendsData } = await getSpendingTrends();
            if (trendsData && trendsData.length > 0) {
                 const labels = trendsData.map(trend => trend.category);
                 const dataValues = trendsData.map(trend => trend.totalAmount);

                 setChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Spending this Month (£)',
                            data: dataValues,
                             backgroundColor: [ 
                                'rgba(75, 192, 192, 0.6)', 'rgba(255, 159, 64, 0.6)', 'rgba(255, 99, 132, 0.6)',
                                'rgba(54, 162, 235, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 206, 86, 0.6)',
                                'rgba(201, 203, 207, 0.6)' 
                            ],
                            borderColor: [ 
                                'rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 206, 86, 1)',
                                'rgba(201, 203, 207, 1)'
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
            } else {
                setChartData(null); 
            }
        } catch (err: any) { 
            console.error("Error fetching trends:", err);
            setErrorTrends(err.response?.data?.message || 'Failed to load spending trends.');
             setChartData(null);
        } finally {
            setLoadingTrends(false);
        }

        setLoadingAdvice(true);
        setErrorAdvice('');
         try {
            const { data: adviceData } = await getPersonalizedAdvice();
            setAdvice(adviceData || []); 
         } catch(err: any) {
             console.error("Error fetching advice:", err);
             setErrorAdvice(err.response?.data?.message || 'Failed to load financial advice.');
             setAdvice(err.response?.data?.fallbackData || []);
         } finally {
             setLoadingAdvice(false);
         }
    };

     useEffect(() => {
        fetchDashboardData();
    }, []); 


    const chartOptions: ChartOptions<'pie'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const, 
            },
            title: {
                display: true,
                text: 'Spending Overview (Last Month / 30 Days)',
                font: { size: 16 }
            },
            tooltip: {
                callbacks: {
                    label: function (context) { 
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        const value = context.parsed; 
                        if (value !== null) {
                            label += new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);
                        }
                        return label;
                    }
                }
            }
        },
    };

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Dashboard
            </Typography>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 2, height: '450px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        {loadingTrends && <Box sx={{ textAlign: 'center' }}><CircularProgress /></Box>}
                        {errorTrends && <Alert severity="error">{errorTrends}</Alert>}
                        {!loadingTrends && !errorTrends && chartData && (
                            <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
                                <Pie data={chartData} options={chartOptions} />
                            </Box>
                        )}
                         {!loadingTrends && !errorTrends && !chartData && (
                            <Typography variant="body1" sx={{ textAlign: 'center' }}>
                                No spending data available to display chart.
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 2, height: '450px', overflowY: 'auto' }}>
                         <Typography variant="h6" gutterBottom>Personalized Insights</Typography>
                         {loadingAdvice && <Box sx={{ textAlign: 'center', mt: 2 }}><CircularProgress size={30}/></Box>}
                         {errorAdvice && <Alert severity="warning" sx={{mt: 1}}>{errorAdvice}</Alert>}
                         {!loadingAdvice && advice.length === 0 && !errorAdvice && (
                             <Typography variant="body2" sx={{mt: 1}}>No specific insights available right now. Keep tracking your expenses!</Typography>
                         )}
                         {!loadingAdvice && advice.length > 0 && (
                            <Box>
                                {advice.map((item) => (
                                    <Alert
                                        key={item.id}
                                        severity={ 
                                            item.type === 'warning' ? 'warning' :
                                            item.type === 'suggestion' ? 'info' :
                                            item.type === 'tip' ? 'success' : 
                                            item.type === 'observation' ? 'info' :
                                            'info' 
                                        }
                                        sx={{ mb: 1.5, alignItems: 'flex-start' }} 
                                    >
                                       {item.text}
                                    </Alert>
                                ))}
                            </Box>
                         )}
                    </Paper>
                </Grid>


            </Grid>
        </Box>
    );
};

export default DashboardPage;