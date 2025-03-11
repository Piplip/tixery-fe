import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Card, CardContent
} from '@mui/material';
import {useEffect, useState} from "react";


const parseUptime = (uptimeStr) => {

    const hours = parseInt(uptimeStr.replace('h', ''), 10);
    return hours * 3600;
};

const initialServiceInstances = [
    { name: 'Service 1', instanceId: 'svc1-1', health: 'green', uptime: parseUptime('12h') },
    { name: 'Service 1', instanceId: 'svc1-2', health: 'green', uptime: parseUptime('10h') },
    { name: 'Service 2', instanceId: 'svc2-1', health: 'red', uptime: parseUptime('5h') },
    { name: 'Gateway', instanceId: 'gw-1', health: 'yellow', uptime: parseUptime('20h') },
];


const getChipColor = (health) => {
    switch (health) {
        case 'green':
            return 'success';
        case 'yellow':
            return 'warning';
        case 'red':
            return 'error';
        default:
            return 'default';
    }
};


const formatUptime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
};


function ServiceStatus(){
    const [instances, setInstances] = useState(initialServiceInstances);


    useEffect(() => {
        const interval = setInterval(() => {
            setInstances((prevInstances) =>
                prevInstances.map((instance) => {
                    if (instance.health !== 'red') {
                        return { ...instance, uptime: instance.uptime + 1 };
                    }
                    return instance;
                })
            );
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    Service Status
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Service Name</TableCell>
                                <TableCell>Instance ID</TableCell>
                                <TableCell>Health</TableCell>
                                <TableCell>Uptime</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {instances.map((instance, index) => (
                                <TableRow key={index}>
                                    <TableCell>{instance.name}</TableCell>
                                    <TableCell>{instance.instanceId}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={instance.health.toUpperCase()}
                                            color={getChipColor(instance.health)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{formatUptime(instance.uptime)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}

export default ServiceStatus;