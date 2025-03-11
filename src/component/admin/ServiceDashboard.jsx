import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Paper, Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import {useState} from "react";

function ServiceDashboard(){
    // ----- Section 1: Uptime & Health Check Data -----
    const uptimeData = [
        { time: '00:00', uptime: 99, health: 1 }, // health: 1 means up, 0 means down
        { time: '01:00', uptime: 99.5, health: 1 },
        { time: '02:00', uptime: 98, health: 0 },
        { time: '03:00', uptime: 99, health: 1 },
        { time: '04:00', uptime: 99.8, health: 1 },
        { time: '05:00', uptime: 99.9, health: 1 },
    ];

    // ----- Section 2: Request Metrics Data -----
    const httpMethodsData = [
        { method: 'GET', count: 80 },
        { method: 'POST', count: 25 },
        { method: 'PUT', count: 10 },
        { method: 'DELETE', count: 5 },
    ];

    const requestMetrics = {
        rps: 120,
        latency: { p50: 200, p90: 350, p99: 450 },
        errorRate: { '4xx': 0.5, '5xx': 1.2 },
    };

    // ----- Section 3: Resource Utilization Data -----
    const resourceMetrics = {
        cpu: '70%',
        memory: '65%',
        jvm: { heap: '300MB', nonHeap: '150MB' },
        gc: { count: 5, duration: '120ms' },
    };

    // ----- Section 4: Application-Specific Metrics -----
    const appMetrics = {
        ordersProcessed: 150,
        userLogins: 200,
        dbPool: '10/10 connections available',
        apiCallDuration: '300ms',
    };

    // ----- Section 5: Logs (Filterable) -----
    const [logFilter, setLogFilter] = useState('');
    const logs = [
        { id: 1, timestamp: '2023-03-15 10:00:00', level: 'INFO', message: 'Service started successfully.' },
        { id: 2, timestamp: '2023-03-15 10:05:00', level: 'WARN', message: 'Slow response detected.' },
        { id: 3, timestamp: '2023-03-15 10:10:00', level: 'ERROR', message: 'Database connection error.' },
        { id: 4, timestamp: '2023-03-15 10:15:00', level: 'INFO', message: 'Cache cleared successfully.' },
    ];

    const filteredLogs = logs.filter((log) =>
        log.message.toLowerCase().includes(logFilter.toLowerCase())
    );

    // ----- Section 6: Dependencies -----
    const dependencies = {
        database: 'Healthy',
        externalAPI: 'Degraded',
    };

    const halfWidthColumn = {
        width: { xs: '100%', md: '50%' },
        p: 1,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
    };

    const stretchCard = {
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                Service Health Dashboard
            </Typography>
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'stretch',
                }}
            >
                <Box sx={halfWidthColumn}>
                    <Card sx={stretchCard}>
                        <CardContent sx={{ flex: '1 1 auto' }}>
                            <Typography variant="h6" gutterBottom>
                                Uptime & Health Status
                            </Typography>
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={uptimeData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="time" />
                                    <YAxis
                                        label={{ value: 'Uptime (%)', angle: -90, position: 'insideLeft' }}
                                        domain={[95, 100]}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="uptime" stroke="#82ca9d" name="Uptime (%)" />
                                    <Line type="monotone" dataKey="health" stroke="#f44336" dot={{ r: 5 }} name="Health" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={halfWidthColumn}>
                    <Card sx={stretchCard}>
                        <CardContent sx={{ flex: '1 1 auto' }}>
                            <Typography variant="h6" gutterBottom>
                                Request Metrics
                            </Typography>
                            <Stack direction={'row'} justifyContent={'space-between'}>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <Typography variant="subtitle1">RPS</Typography>
                                    <Typography variant="h5">{requestMetrics.rps}</Typography>
                                </Box>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <Typography variant="subtitle1">Latency</Typography>
                                    <Typography variant="body2">p50: {requestMetrics.latency.p50} ms</Typography>
                                    <Typography variant="body2">p90: {requestMetrics.latency.p90} ms</Typography>
                                    <Typography variant="body2">p99: {requestMetrics.latency.p99} ms</Typography>
                                </Box>
                                <Box sx={{ width: '100%', mb: 2 }}>
                                    <Typography variant="subtitle1">Error Rate</Typography>
                                    <Typography variant="body2">4xx: {requestMetrics.errorRate['4xx']}%</Typography>
                                    <Typography variant="body2">5xx: {requestMetrics.errorRate['5xx']}%</Typography>
                                </Box>
                            </Stack>
                            <Box sx={{ width: '100%' }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    HTTP Method Usage
                                </Typography>
                                <ResponsiveContainer width="100%" height={180}>
                                    <BarChart data={httpMethodsData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="method" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="count" fill="#8884d8" name="Count" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Resource Utilization */}
                <Box sx={halfWidthColumn}>
                    <Card sx={stretchCard}>
                        <CardContent sx={{ flex: '1 1 auto' }}>
                            <Typography variant="h6" gutterBottom>
                                Resource Utilization
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                <Box sx={{ width: '50%', mb: 2 }}>
                                    <Typography variant="subtitle1">CPU Usage</Typography>
                                    <Typography variant="h5">{resourceMetrics.cpu}</Typography>
                                </Box>
                                <Box sx={{ width: '50%', mb: 2 }}>
                                    <Typography variant="subtitle1">Memory Usage</Typography>
                                    <Typography variant="h5">{resourceMetrics.memory}</Typography>
                                </Box>
                                <Box sx={{ width: '50%', mb: 2 }}>
                                    <Typography variant="subtitle1">JVM Heap</Typography>
                                    <Typography variant="body1">{resourceMetrics.jvm.heap}</Typography>
                                </Box>
                                <Box sx={{ width: '50%', mb: 2 }}>
                                    <Typography variant="subtitle1">JVM Non-Heap</Typography>
                                    <Typography variant="body1">{resourceMetrics.jvm.nonHeap}</Typography>
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="subtitle1">Garbage Collection</Typography>
                                    <Typography variant="body2">Count: {resourceMetrics.gc.count}</Typography>
                                    <Typography variant="body2">Duration: {resourceMetrics.gc.duration}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Application Metrics */}
                <Box sx={halfWidthColumn}>
                    <Card sx={stretchCard}>
                        <CardContent sx={{ flex: '1 1 auto' }}>
                            <Typography variant="h6" gutterBottom>
                                Application Metrics
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                                <Box sx={{ width: '50%', mb: 2 }}>
                                    <Typography variant="subtitle1">Orders Processed</Typography>
                                    <Typography variant="h5">{appMetrics.ordersProcessed}</Typography>
                                </Box>
                                <Box sx={{ width: '50%', mb: 2 }}>
                                    <Typography variant="subtitle1">User Logins</Typography>
                                    <Typography variant="h5">{appMetrics.userLogins}</Typography>
                                </Box>
                                <Box sx={{ width: '100%', mb: 1 }}>
                                    <Typography variant="subtitle1">DB Connection Pool</Typography>
                                    <Typography variant="body2">{appMetrics.dbPool}</Typography>
                                </Box>
                                <Box sx={{ width: '100%' }}>
                                    <Typography variant="subtitle1">External API Duration</Typography>
                                    <Typography variant="body2">{appMetrics.apiCallDuration}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Logs */}
                <Box sx={halfWidthColumn}>
                    <Card sx={stretchCard}>
                        <CardContent sx={{ flex: '1 1 auto' }}>
                            <Typography variant="h6" gutterBottom>
                                Logs
                            </Typography>
                            <Box sx={{ marginBottom: '1rem' }}>
                                <TextField
                                    label="Filter logs"
                                    variant="outlined"
                                    size="small"
                                    value={logFilter}
                                    onChange={(e) => setLogFilter(e.target.value)}
                                />
                            </Box>
                            <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Timestamp</TableCell>
                                            <TableCell>Level</TableCell>
                                            <TableCell>Message</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell>{log.timestamp}</TableCell>
                                                <TableCell>{log.level}</TableCell>
                                                <TableCell>{log.message}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ marginTop: '1rem' }}
                                href="https://kibana.example.com"
                                target="_blank"
                            >
                                VIEW MORE IN KIBANA/LOKI
                            </Button>
                        </CardContent>
                    </Card>
                </Box>

                {/* Dependencies */}
                <Box sx={halfWidthColumn}>
                    <Card sx={stretchCard}>
                        <CardContent sx={{ flex: '1 1 auto' }}>
                            <Typography variant="h6" gutterBottom>
                                Dependencies
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="subtitle1">Database</Typography>
                                    <Chip
                                        label={dependencies.database}
                                        color={dependencies.database === 'Healthy' ? 'success' : 'error'}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="subtitle1">External API</Typography>
                                    <Chip
                                        label={dependencies.externalAPI}
                                        color={
                                            dependencies.externalAPI === 'Healthy' ? 'success' : 'warning'
                                        }
                                    />
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}

export default ServiceDashboard;