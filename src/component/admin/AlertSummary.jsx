import {
    Card,
    CardContent,
    Typography,
    Box,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import Grid from "@mui/material/Grid2";

function AlertSummary(){
    // Mock alert counts
    const alerts = {
        critical: 2,
        warning: 5,
        info: 10
    };

    // Data for the PieChart
    const pieData = [
        { name: 'Critical', value: alerts.critical },
        { name: 'Warning', value: alerts.warning },
        { name: 'Info', value: alerts.info }
    ];

    // Colors for each severity
    const COLORS = ['#f44336', '#ff9800', '#2196f3'];

    // Mock detailed alert data
    const alertDetails = [
        { id: 'ALERT-001', severity: 'critical', message: 'Database connection lost', timestamp: '2023-03-15 10:20:00' },
        { id: 'ALERT-002', severity: 'critical', message: 'API response timeout', timestamp: '2023-03-15 10:22:00' },
        { id: 'ALERT-003', severity: 'warning', message: 'High memory usage', timestamp: '2023-03-15 11:00:00' },
        { id: 'ALERT-004', severity: 'warning', message: 'Service response lag', timestamp: '2023-03-15 11:05:00' },
        { id: 'ALERT-005', severity: 'warning', message: 'Disk usage near threshold', timestamp: '2023-03-15 11:10:00' },
        { id: 'ALERT-006', severity: 'warning', message: 'Slow network response', timestamp: '2023-03-15 11:15:00' },
        { id: 'ALERT-007', severity: 'warning', message: 'Intermittent service error', timestamp: '2023-03-15 11:20:00' },
        { id: 'ALERT-008', severity: 'info', message: 'Routine maintenance scheduled', timestamp: '2023-03-15 12:00:00' },
        { id: 'ALERT-009', severity: 'info', message: 'New instance deployed', timestamp: '2023-03-15 12:05:00' },
        { id: 'ALERT-010', severity: 'info', message: 'Configuration updated', timestamp: '2023-03-15 12:10:00' },
        { id: 'ALERT-011', severity: 'info', message: 'Backup completed', timestamp: '2023-03-15 12:15:00' },
        { id: 'ALERT-012', severity: 'info', message: 'Cache cleared', timestamp: '2023-03-15 12:20:00' },
    ];

    // Helper: Filter alerts by severity
    const getAlertsBySeverity = (severity) =>
        alertDetails.filter((alert) => alert.severity === severity);

    // Helper: Render a table of alert details
    const renderAlertTable = (severity) => {
        const alertsForSeverity = getAlertsBySeverity(severity);
        return (
            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell>Timestamp</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alertsForSeverity.map((alert) => (
                            <TableRow key={alert.id}>
                                <TableCell>{alert.id}</TableCell>
                                <TableCell>{alert.message}</TableCell>
                                <TableCell>{alert.timestamp}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <Card>
            <CardContent>
                {/* Alert Summary Header */}
                <Typography variant="h6" gutterBottom>
                    Alert Summary
                </Typography>
                <Grid container spacing={2} justifyContent={'center'}>
                    {/* Pie Chart Column */}
                    <Grid item xs={12} md={6}>
                        <ResponsiveContainer width={500} height={250}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={75}
                                    label
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Grid>
                </Grid>

                {/* Expandable Alert Details */}
                <Box mt={3}>
                    <Typography variant="subtitle1" gutterBottom>
                        Alert Details
                    </Typography>

                    {/* Critical Alerts Accordion */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                Critical Alerts ({alerts.critical})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {renderAlertTable('critical')}
                        </AccordionDetails>
                    </Accordion>

                    {/* Warning Alerts Accordion */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
                                Warning Alerts ({alerts.warning})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {renderAlertTable('warning')}
                        </AccordionDetails>
                    </Accordion>

                    {/* Info Alerts Accordion */}
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="body1" sx={{ color: '#2196f3', fontWeight: 'bold' }}>
                                Info Alerts ({alerts.info})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {renderAlertTable('info')}
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </CardContent>
        </Card>
    );
}

export default AlertSummary;