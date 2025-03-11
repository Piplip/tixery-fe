import {Card, CardContent, Chip, Tooltip, Typography} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import Grid from "@mui/material/Grid2";

const serviceData = [
    { name: 'Config Server', status: 'green', description: 'Config Server is fully operational.' },
    { name: 'Registry', status: 'yellow', description: 'Registry is experiencing intermittent issues.' },
    { name: 'Gateway', status: 'green', description: 'Gateway is performing optimally.' },
    { name: 'Service 1', status: 'red', description: 'Service 1 is currently down.' },
    { name: 'Service 2', status: 'green', description: 'Service 2 is running normally.' },
];

const getStatusColor = (status) => {
    switch (status) {
        case 'green': return 'success';
        case 'yellow': return 'warning';
        case 'red': return 'error';
        default: return 'default';
    }
};

const getStatusIconColor = (status) => {
    switch (status) {
        case 'green': return '#5fcc44';
        case 'yellow': return '#ff9800';
        case 'red': return '#f44336';
        default: return '#9e9e9e';
    }
};

function SystemHealthStatus(){
    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    System Health Status
                </Typography>

                <Grid container spacing={2}>
                    {serviceData.map((service, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Grid container spacing={1} alignItems="center">
                                <Grid item>
                                    <Tooltip title={service.description} arrow>
                                        <CircleIcon sx={{ color: getStatusIconColor(service.status) }} />
                                    </Tooltip>
                                </Grid>

                                <Grid item>
                                    <Typography variant="body1">{service.name}</Typography>
                                </Grid>

                                <Grid item xs />

                                <Grid item>
                                    <Chip
                                        label={service.status.toUpperCase()}
                                        color={getStatusColor(service.status)}
                                        size="small"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
}

export default SystemHealthStatus;