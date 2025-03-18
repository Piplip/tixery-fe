import {Card, CardContent, Chip, Skeleton, Tooltip, Typography} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import Grid from "@mui/material/Grid2";
import {useEffect, useState} from "react";
import accountAxios, {configAxios, eventAxios, gatewayAxios, registryAxios} from "../../config/axiosConfig.js";

const getStatusColor = (status) => {
    switch (status) {
        case 'green': return 'success';
        case 'yellow': return 'warning';
        case 'red': return 'error';
        default: return 'error';
    }
};

const getStatusIconColor = (status) => {
    switch (status) {
        case 'green': return '#5fcc44';
        case 'yellow': return '#ff9800';
        case 'red': return '#f44336';
        default: return '#f44336';
    }
};

const services = ['Config', 'Registry', 'Gateway', 'Account', 'Event']

function SystemHealthStatus(){
    const [healthStatus, setHealthStatus] = useState([
        {status: 'red', description: ''},
        {status: 'red', description: ''},
        {status: 'red', description: ''},
        {status: 'red', description: ''},
        {status: 'red', description: ''}
    ]);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    function getHealthStatus(){
        setLoading(true);
        Promise.all([
            configAxios.get('/actuator/health'),
            registryAxios.get('/actuator/health'),
            gatewayAxios.get('/actuator/health'),
            accountAxios.get('/actuator/health'),
            eventAxios.get('/actuator/health')
        ]).then((responses) => {
            const healthStatus = responses.map((response, index) => {
                return {
                    status: response.data.status === 'UP' ? 'green' : 'red',
                    description: response.data.status === 'UP' ? `${services[index]} is fully operational.` : `${services[index]} is currently down.`
                };
            });
            setHealthStatus(healthStatus);
            setLoading(false);
            setInitialLoad(false);
        })
            .catch((error) => {
                console.log(error)
                setLoading(false);
                setInitialLoad(false);
            })
    }

    // useEffect(() => {
    //     getHealthStatus();
    //     const interval = setInterval(() => {
    //         getHealthStatus();
    //     }, 30000);
    //     return () => clearInterval(interval);
    // }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    System Health Status
                </Typography>

                {loading && initialLoad ? (
                    <Grid container spacing={2}>
                        {services.map((service, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Skeleton variant="rectangular" width={150} height={20} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Grid container spacing={2}>
                        {healthStatus.map((service, index) => (
                            <Grid item xs={12} sm={6} md={4} key={index}>
                                <Grid container spacing={1} alignItems="center">
                                    <Grid item>
                                        <Tooltip title={service.description || `${services[index]} service is currently down`} arrow>
                                            <CircleIcon sx={{ color: getStatusIconColor(service.status) }} />
                                        </Tooltip>
                                    </Grid>
                                    <Grid item>
                                        <Typography variant="body1" sx={{minWidth: '4rem'}}>{services[index]}</Typography>
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
                )}
            </CardContent>
        </Card>
    );
}

export default SystemHealthStatus;