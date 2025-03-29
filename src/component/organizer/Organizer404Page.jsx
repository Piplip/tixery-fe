import { Container, Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Organizer404Page(){
    const { t } = useTranslation();

    return (
        <Container
            maxWidth="sm"
            sx={{
                textAlign: 'center',
                paddingY: { xs: 4, sm: 8 },
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
            }}
        >
            <Box
                component="img"
                src="https://firebasestorage.googleapis.com/v0/b/medicare-10c3b.appspot.com/o/assets%2Flogo.svg?alt=media&token=65847a28-8ce8-4a10-a88a-1a0f16c0b41f"
                alt="Event Logo"
                sx={{
                    width: { xs: '150px', sm: '200px' },
                    mb: 3,
                    mx: 'auto',
                }}
            />

            <Typography
                variant="h1"
                component="h1"
                sx={{
                    fontSize: { xs: '4rem', sm: '6rem' },
                    fontWeight: 'bold',
                    mb: 2,
                }}
            >
                {t('organizer404.title')}
            </Typography>

            <Typography
                variant="h5"
                component="h2"
                sx={{ mb: 2 }}
            >
                {t('organizer404.subtitle')}
            </Typography>

            <Typography
                variant="body1"
                sx={{ mb: 4 }}
            >
                {t('organizer404.message')}
            </Typography>

            <Button
                variant="contained"
                size="large"
                color="primary"
                component={RouterLink}
                to="/organizer/dashboard"
                sx={{ textTransform: 'none' }}
            >
                {t('organizer404.button')}
            </Button>
        </Container>
    );
}

export default Organizer404Page;
