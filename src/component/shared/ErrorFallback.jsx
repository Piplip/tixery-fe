import { Container, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

function ErrorFallback() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [errorDetails, setErrorDetails] = useState({ type: 'unknown', message: '' });

    useEffect(() => {
        const storedError = sessionStorage.getItem('serverError');
        if (storedError) {
            try {
                const parsedError = JSON.parse(storedError);
                setErrorDetails({
                    type: parsedError.type || 'unknown',
                    message: parsedError.message || t('somethingwentwrong.message')
                });
            } catch (e) {
                setErrorDetails({ type: 'unknown', message: t('somethingwentwrong.message') });
            }
            sessionStorage.removeItem('serverError');
        } else {
            setErrorDetails({ type: 'unknown', message: t('somethingwentwrong.message') });
        }
    }, [t]);

    const handleGoBack = () => {
        const lastPath = sessionStorage.getItem('lastSuccessfulPath');
        if (lastPath) {
            navigate(lastPath);
        } else {
            window.history.back();
        }
    };

    const renderAdditionalActions = () => {
        switch (errorDetails.type) {
            case 'network-error':
                return (
                    <Button variant="outlined" size="large" color="secondary" onClick={() => window.location.reload()} sx={{ textTransform: 'none' }}>
                        {t('somethingwentwrong.retry')}
                    </Button>
                );
            default:
                return null;
        }
    };

    return (
        <Container
            maxWidth="sm"
            sx={{
                textAlign: 'center',
                paddingY: 8,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
            <Box
                component="img"
                src="https://firebasestorage.googleapis.com/v0/b/medicare-10c3b.appspot.com/o/assets%2Flogo.svg?alt=media&token=65847a28-8ce8-4a10-a88a-1a0f16c0b41f"
                alt="Event Logo"
                sx={{ width: '200px', mb: 3, mx: 'auto' }}
            />

            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                {t('somethingwentwrong.title')}
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
                {errorDetails.message}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="contained" size="large" color="primary" onClick={handleGoBack} sx={{ textTransform: 'none' }}>
                    {t('somethingwentwrong.goback')}
                </Button>

                <Button variant="outlined" size="large" color="primary" component={RouterLink} to="/" sx={{ textTransform: 'none' }}>
                    {t('somethingwentwrong.home')}
                </Button>

                {renderAdditionalActions()}
            </Box>
        </Container>
    );
}

export default ErrorFallback;
