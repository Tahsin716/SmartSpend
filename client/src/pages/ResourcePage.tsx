import React, { useState, useEffect } from 'react';
import { getStaticArticles, getPersonalizedAdvice } from '../services/api';
import { StaticArticle, AdviceMessage } from '../types';
import { Box, Typography, CircularProgress, Alert, Paper, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const ResourcesPage: React.FC = () => {
    const [articles, setArticles] = useState<StaticArticle[]>([]);
    const [advice, setAdvice] = useState<AdviceMessage[]>([]);
    const [loadingArticles, setLoadingArticles] = useState<boolean>(true);
    const [loadingAdvice, setLoadingAdvice] = useState<boolean>(true);
    const [errorArticles, setErrorArticles] = useState<string>('');
    const [errorAdvice, setErrorAdvice] = useState<string>('');

    useEffect(() => {
        const fetchResources = async () => {
            // Fetch Static Articles
            setLoadingArticles(true);
            setErrorArticles('');
            try {
                const { data } = await getStaticArticles();
                setArticles(data || []);
            } catch (err: any) {
                setErrorArticles(err.response?.data?.message || 'Failed to load articles.');
            } finally {
                setLoadingArticles(false);
            }

            // Fetch Personalized Advice
            setLoadingAdvice(true);
            setErrorAdvice('');
             try {
                 const { data } = await getPersonalizedAdvice();
                 setAdvice(data || []);
             } catch (err: any) {
                 setErrorAdvice(err.response?.data?.message || 'Failed to load personalized advice.');
                 setAdvice(err.response?.data?.fallbackData || []); // Use fallback if provided on error
             } finally {
                 setLoadingAdvice(false);
             }
        };

        fetchResources();
    }, []); // Fetch on mount

    return (
        <Box>
            <Typography variant="h4" component="h1" gutterBottom>
                Financial Resources & Insights
            </Typography>

            <Grid container spacing={3}>
                {/* Personalized Advice Section */}
                 <Grid size={{xs:12, md:5}}>
                     <Paper sx={{ p: 2, minHeight: '200px' }}> {/* Adjust minHeight as needed */}
                         <Typography variant="h6" gutterBottom>Your Insights</Typography>
                         {loadingAdvice && <Box sx={{ textAlign: 'center', mt: 2 }}><CircularProgress size={30}/></Box>}
                         {errorAdvice && <Alert severity="warning" sx={{mt: 1}}>{errorAdvice}</Alert>}
                         {!loadingAdvice && advice.length === 0 && !errorAdvice && (
                             <Typography variant="body2" sx={{mt: 1}}>No specific insights available right now. Keep tracking!</Typography>
                         )}
                         {!loadingAdvice && advice.length > 0 && (
                            <Box>
                                {advice.map((item) => (
                                    <Alert
                                        key={item.id}
                                        severity={ /* Map type to severity */
                                             item.type === 'warning' ? 'warning' : item.type === 'suggestion' ? 'info' :
                                             item.type === 'tip' ? 'success' : item.type === 'observation' ? 'info' : 'info'
                                        }
                                        sx={{ mb: 1.5, alignItems: 'flex-start' }}
                                        icon={false} // Maybe simpler without icons here
                                    >
                                       {item.text}
                                       {/* Render links if advice object contains a URL */}
                                       {/* {item.url && <Link href={item.url} target="_blank" rel="noopener noreferrer" sx={{display: 'block', mt: 0.5}}>Learn more</Link>} */}
                                    </Alert>
                                ))}
                            </Box>
                         )}
                     </Paper>
                </Grid>

                <Grid  size={{xs:12, md:7}} >
                    <Paper sx={{ p: 2 }}>
                         <Typography variant="h6" gutterBottom>Learning Center</Typography>
                         {loadingArticles && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}
                         {errorArticles && <Alert severity="error" sx={{ mb: 2 }}>{errorArticles}</Alert>}
                         {!loadingArticles && articles.length === 0 && !errorArticles && (
                              <Typography variant="body1" sx={{textAlign: 'center', my: 4}}>
                                 No articles available at the moment.
                             </Typography>
                         )}
                         {!loadingArticles && articles.length > 0 && (
                            <Box>
                                {articles.map((article, index) => {
                                    if (!article || !article.id) return null; // Guard against undefined/malformed article
                                    return (
                                        <Accordion id={article.id} key={article.id} defaultExpanded={index === 0}>
                                            <AccordionSummary
                                                expandIcon={<ExpandMoreIcon />}
                                                aria-controls={`article-${article.id}-content`}
                                                id={`article-${article.id}-header`}
                                            >
                                                <Typography sx={{ fontWeight: 'medium' }}>{article.title}</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <Typography variant="body2">
                                                    {article.content}
                                                </Typography>
                                            </AccordionDetails>
                                        </Accordion>
                                    );
                                })}
                            </Box>
                         )}
                     </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ResourcesPage;