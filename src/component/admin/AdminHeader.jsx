import { AppBar, Toolbar, Typography, Box } from '@mui/material';

function AdminHeader(){
    return (
        <AppBar position="fixed">
            <Toolbar sx={{backgroundColor: '#d3eaee'}}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/medicare-10c3b.appspot.com/o/assets%2Flogo.svg?alt=media&token=65847a28-8ce8-4a10-a88a-1a0f16c0b41f"
                        alt="Logo"
                        style={{ height: '30px' }}
                    />
                </Box>
                <Typography variant="h5" noWrap component="div" sx={{ flexGrow: 1, textAlign: 'center', color: 'black'}}>
                    TIXERY ADMIN MANAGEMENT
                </Typography>
                <Box sx={{ width: '40px' }} />
            </Toolbar>
        </AppBar>
    );
}

export default AdminHeader;