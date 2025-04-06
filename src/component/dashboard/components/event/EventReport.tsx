import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomizedDataGrid from '../CustomizedDataGrid';
import { alpha, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlagIcon from '@mui/icons-material/Flag';

interface EventReport {
    id: number;
    eventId: number;
    eventName: string;
    reportedBy: string;
    reportDate: string;
    reason: string;
    description: string;
    status: 'pending' | 'under_review' | 'resolved' | 'action_taken';
    severity: 'low' | 'medium' | 'high';
}

const mockReports: EventReport[] = [
    {
        id: 1,
        eventId: 103,
        eventName: 'Summer Music Festival',
        reportedBy: 'john.doe@example.com',
        reportDate: '2024-07-10',
        reason: 'Misleading information',
        description: 'The event description promised live performances from top artists that were not actually present.',
        status: 'pending',
        severity: 'medium'
    },
    {
        id: 2,
        eventId: 245,
        eventName: 'Tech Workshop',
        reportedBy: 'sarah.tech@example.com',
        reportDate: '2024-07-09',
        reason: 'Safety concerns',
        description: 'The venue was overcrowded, exceeding capacity limits. Fire exits were blocked.',
        status: 'under_review',
        severity: 'high'
    },
    {
        id: 3,
        eventId: 187,
        eventName: 'Food and Wine Tasting',
        reportedBy: 'foodie123@example.com',
        reportDate: '2024-07-08',
        reason: 'Inappropriate content',
        description: 'The event featured inappropriate language and content not mentioned in the description.',
        status: 'resolved',
        severity: 'medium'
    },
    {
        id: 4,
        eventId: 321,
        eventName: 'Business Networking',
        reportedBy: 'business.pro@example.com',
        reportDate: '2024-07-07',
        reason: 'Fraudulent activity',
        description: 'The organizer was collecting additional fees at the door that were not disclosed during ticket purchase.',
        status: 'action_taken',
        severity: 'high'
    },
    {
        id: 5,
        eventId: 456,
        eventName: 'Charity Run',
        reportedBy: 'runner42@example.com',
        reportDate: '2024-07-05',
        reason: 'Misrepresentation',
        description: 'Event claimed to be donating 100% of proceeds to charity but only a small portion was actually donated.',
        status: 'pending',
        severity: 'high'
    }
];

export default function EventReport() {
    const theme = useTheme();
    const [reports, setReports] = useState<EventReport[]>(mockReports);
    const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [actionType, setActionType] = useState('');
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);

        // Filter reports based on status
        if (newValue === 0) {
            setReports(mockReports); // All reports
        } else if (newValue === 1) {
            setReports(mockReports.filter(report => report.status === 'pending')); // Pending reports
        } else if (newValue === 2) {
            setReports(mockReports.filter(report => report.status === 'under_review')); // Under review
        } else if (newValue === 3) {
            setReports(mockReports.filter(report => report.status === 'resolved' || report.status === 'action_taken')); // Resolved
        }
    };

    const handleViewDetails = (id: number) => {
        const report = reports.find((r) => r.id === id);
        if (report) {
            setSelectedReport(report);
            setAdminNotes('');
            setActionType('');
            setOpenDialog(true);
        }
    };

    const handleResolveReport = (id: number, actionTaken: boolean = false) => {
        setReports(reports.map(report =>
            report.id === id ?
                { ...report, status: actionTaken ? 'action_taken' : 'resolved' } :
                report
        ));
        setOpenDialog(false);
    };

    const handleStartReview = (id: number) => {
        setReports(reports.map(report =>
            report.id === id ? { ...report, status: 'under_review' } : report
        ));
        setOpenDialog(false);
    };

    // Calculate summary metrics
    const pendingReports = reports.filter(r => r.status === 'pending').length;
    const highSeverityReports = reports.filter(r => r.severity === 'high').length;
    const resolvedReports = reports.filter(r => r.status === 'resolved' || r.status === 'action_taken').length;
    const totalReports = mockReports.length;

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return theme.palette.error;
            case 'medium': return theme.palette.warning;
            case 'low': return theme.palette.info;
            default: return theme.palette.primary;
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'pending':
                return <Chip size="small" icon={<WarningAmberIcon />} label="Pending" color="warning" />;
            case 'under_review':
                return <Chip size="small" icon={<VisibilityIcon />} label="Under Review" color="info" />;
            case 'resolved':
                return <Chip size="small" icon={<CheckCircleIcon />} label="Resolved" color="success" />;
            case 'action_taken':
                return <Chip size="small" icon={<BlockIcon />} label="Action Taken" color="error" />;
            default:
                return <Chip size="small" label={status} />;
        }
    };

    const reportColumns: GridColDef[] = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'eventName', headerName: 'Event Name', flex: 1, minWidth: 180 },
        { field: 'reportedBy', headerName: 'Reported By', flex: 1, minWidth: 150 },
        {
            field: 'reportDate',
            headerName: 'Date Reported',
            flex: 1,
            minWidth: 120,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return new Date(params.value.toString()).toLocaleDateString();
            }
        },
        { field: 'reason', headerName: 'Reason', flex: 1, minWidth: 150 },
        {
            field: 'severity',
            headerName: 'Severity',
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams<EventReport>) => {
                if (!params.value) return null;
                const severity = params.value as string;
                const color = getSeverityColor(severity);

                return (
                    <Chip
                        label={severity.charAt(0).toUpperCase() + severity.slice(1)}
                        size="small"
                        sx={{
                            bgcolor: alpha(color.main, 0.2),
                            color: color.main,
                            fontWeight: 'bold',
                            minWidth: 80,
                        }}
                    />
                );
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            minWidth: 140,
            renderCell: (params: GridRenderCellParams<EventReport>) => {
                if (!params.value) return null;
                return getStatusChip(params.value as string);
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams<EventReport>) => {
                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewDetails(Number(params.id))}
                            sx={{ borderRadius: '8px' }}
                        >
                            Review
                        </Button>
                    </Stack>
                );
            }
        }
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <Paper sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <FlagIcon sx={{ mr: 1 }} /> Event Reports
                    </Typography>
                </Stack>

                {/* Summary Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Pending Reports
                            </Typography>
                            <Typography variant="h4" color="warning.main" fontWeight="bold">
                                {pendingReports}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                High Severity
                            </Typography>
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                                {highSeverityReports}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Resolved
                            </Typography>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {resolvedReports}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Total Reports
                            </Typography>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                {totalReports}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Filter Tabs */}
                <Box sx={{ width: '100%', mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                        aria-label="report filter tabs"
                    >
                        <Tab label="All Reports" />
                        <Tab label="Pending" />
                        <Tab label="Under Review" />
                        <Tab label="Resolved" />
                    </Tabs>
                </Box>

                {/* Data Grid */}
                <Box sx={{ height: 500, width: '100%' }}>
                    <CustomizedDataGrid
                        rows={reports}
                        columns={reportColumns}
                        pageSize={10}
                        pageSizeOptions={[5, 10, 25]}
                        disableRowSelectionOnClick
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                            sorting: {
                                sortModel: [{ field: 'reportDate', sort: 'desc' }],
                            },
                        }}
                        getRowClassName={(params) =>
                            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
                        }
                        sx={{
                            '& .MuiDataGrid-cell': {
                                padding: '8px',
                            }
                        }}
                    />
                </Box>
            </Paper>

            {/* Report Detail Dialog */}
            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedReport && (
                    <>
                        <DialogTitle>
                            Report for {selectedReport.eventName}
                            <Typography variant="subtitle2" color="text.secondary" component="div">
                                Report ID: {selectedReport.id} | Event ID: {selectedReport.eventId}
                            </Typography>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Reported By</Typography>
                                    <Typography variant="body1">{selectedReport.reportedBy}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Date Reported</Typography>
                                    <Typography variant="body1">{new Date(selectedReport.reportDate).toLocaleDateString()}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Reason</Typography>
                                    <Typography variant="body1">{selectedReport.reason}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="subtitle2" color="text.secondary">Status:</Typography>
                                        {getStatusChip(selectedReport.status)}

                                        <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 2 }}>Severity:</Typography>
                                        <Chip
                                            label={selectedReport.severity.charAt(0).toUpperCase() + selectedReport.severity.slice(1)}
                                            size="small"
                                            color={selectedReport.severity === 'high' ? 'error' : selectedReport.severity === 'medium' ? 'warning' : 'info'}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                                        <Typography variant="body2">{selectedReport.description}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Admin Notes</Typography>
                                    <TextField
                                        multiline
                                        rows={4}
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Add your notes about this report..."
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        sx={{ mt: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Action</Typography>
                                    <FormControl fullWidth sx={{ mt: 1 }}>
                                        <InputLabel id="action-type-label">Select Action</InputLabel>
                                        <Select
                                            labelId="action-type-label"
                                            value={actionType}
                                            label="Select Action"
                                            onChange={(e) => setActionType(e.target.value)}
                                        >
                                            <MenuItem value="none">No Action Required</MenuItem>
                                            <MenuItem value="warning">Issue Warning to Organizer</MenuItem>
                                            <MenuItem value="suspend_event">Suspend Event</MenuItem>
                                            <MenuItem value="suspend_organizer">Suspend Organizer Account</MenuItem>
                                            <MenuItem value="refund">Process Refunds</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Stack direction="row" spacing={1}>
                                {selectedReport.status === 'pending' && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleStartReview(selectedReport.id)}
                                    >
                                        Start Review
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => handleResolveReport(selectedReport.id)}
                                >
                                    Mark Resolved
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleResolveReport(selectedReport.id, true)}
                                >
                                    Take Action
                                </Button>
                            </Stack>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}