import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper, Stack,
} from '@mui/material';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line
} from 'recharts';
import Grid from "@mui/material/Grid2";
import {useState} from "react";

// Define the list of services for filtering
const availableServices = ['Service 1', 'Service 2', 'Gateway'];

function LogManagement(){
    // Filter state
    const [selectedServices, setSelectedServices] = useState([]);
    const [logLevelFilter, setLogLevelFilter] = useState('');
    const [keyword, setKeyword] = useState('');

    // Mock log entries (with multiple service logs)
    const logs = [
        { id: 1, timestamp: '2023-03-15 10:00:00', service: 'Service 1', level: 'INFO', message: 'User login successful.' },
        { id: 2, timestamp: '2023-03-15 10:05:00', service: 'Service 2', level: 'ERROR', message: 'Database connection failed.' },
        { id: 3, timestamp: '2023-03-15 10:10:00', service: 'Service 1', level: 'WARN', message: 'High memory usage detected.' },
        { id: 4, timestamp: '2023-03-15 10:15:00', service: 'Gateway', level: 'INFO', message: 'Request processed successfully.' },
        { id: 5, timestamp: '2023-03-15 10:20:00', service: 'Service 2', level: 'ERROR', message: 'Timeout while calling external API.' },
        { id: 6, timestamp: '2023-03-15 10:25:00', service: 'Gateway', level: 'WARN', message: 'Slow network response.' },
    ];

    // Mock data for log levels over time (bar chart)
    const logLevelsOverTime = [
        { time: '10:00', INFO: 5, WARN: 2, ERROR: 1 },
        { time: '10:15', INFO: 8, WARN: 3, ERROR: 3 },
        { time: '10:30', INFO: 6, WARN: 1, ERROR: 2 },
        { time: '10:45', INFO: 9, WARN: 2, ERROR: 4 },
        { time: '11:00', INFO: 7, WARN: 3, ERROR: 3 },
    ];

    // Mock error rate trend data (line chart)
    const errorRateTrends = [
        { time: '10:00', errorRate: 2.5 },
        { time: '10:15', errorRate: 3.0 },
        { time: '10:30', errorRate: 2.0 },
        { time: '10:45', errorRate: 4.0 },
        { time: '11:00', errorRate: 3.5 },
    ];

    // Filter logs based on filters
    const filteredLogs = logs.filter((log) => {
        const matchesService =
            selectedServices.length > 0 ? selectedServices.includes(log.service) : true;
        const matchesLevel = logLevelFilter ? log.level === logLevelFilter : true;
        const matchesKeyword = keyword
            ? log.message.toLowerCase().includes(keyword.toLowerCase())
            : true;
        return matchesService && matchesLevel && matchesKeyword;
    });

    // Stub handler for creating a custom dashboard
    const handleCreateDashboard = () => {
        alert('Dashboard creation functionality coming soon!');
    };

    return (
        <Box sx={{ padding: '1rem' }}>
            <Typography variant="h5" gutterBottom>
                Logging Dashboard
            </Typography>

            {/* Search and Filter Controls */}
            <Card sx={{ marginBottom: '1rem' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Search Logs
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {/* Multi-select for services */}
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel id="service-select-label">Service</InputLabel>
                            <Select
                                labelId="service-select-label"
                                multiple
                                value={selectedServices}
                                onChange={(e) => setSelectedServices(e.target.value)}
                                input={<OutlinedInput label="Service" />}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {availableServices.map((service) => (
                                    <MenuItem key={service} value={service}>
                                        <Checkbox checked={selectedServices.indexOf(service) > -1} />
                                        <ListItemText primary={service} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 150 }}>
                            <InputLabel id="loglevel-select-label">Log Level</InputLabel>
                            <Select
                                labelId="loglevel-select-label"
                                value={logLevelFilter}
                                label="Log Level"
                                onChange={(e) => setLogLevelFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="INFO">INFO</MenuItem>
                                <MenuItem value="WARN">WARN</MenuItem>
                                <MenuItem value="ERROR">ERROR</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Keyword"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                        <Button variant="contained" color="primary">
                            Search
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* Log Viewer */}
            <Card sx={{ marginBottom: '1rem' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Log Viewer
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>Service</TableCell>
                                    <TableCell>Level</TableCell>
                                    <TableCell>Message</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.timestamp}</TableCell>
                                        <TableCell>{log.service}</TableCell>
                                        <TableCell>{log.level}</TableCell>
                                        <TableCell>{log.message}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
            <Stack direction={'row'} sx={{mb: 2}}>
                <Card sx={{width: '50%'}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Log Levels Over Time
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={logLevelsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="INFO" fill="#2196f3" />
                                <Bar dataKey="WARN" fill="#ff9800" />
                                <Bar dataKey="ERROR" fill="#f44336" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card sx={{width: '50%'}}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Error Rate Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={errorRateTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="time" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="errorRate" stroke="#f44336" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </Stack>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Create Custom Dashboard
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                        Combine log metrics and error trends to create your own custom dashboards.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={handleCreateDashboard}>
                        Create Dashboard
                    </Button>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LogManagement;