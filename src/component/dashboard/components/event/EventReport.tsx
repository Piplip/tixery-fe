import * as React from 'react';
import { useState, useEffect } from 'react';
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
import { useLoaderData } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface EventReport {
    report_id: number;
    event_id: string;
    event_name: string;
    reporter_name: string;
    reporter_email: string | null;
    report_reason: string;
    report_details: string;
    report_date: string;
    status: 'pending' | 'under_review' | 'resolved' | 'action_taken';
    reporter_profile_id: number;
    report_level: 'LOW' | 'MEDIUM' | 'HIGH';
    report_count: number;
}

interface LoaderData {
    reports: EventReport[];
    total: number;
    size: number;
    page: number;
    status_distribution: {
        [key: string]: number;
    };
}

export default function EventReport() {
    const loaderData = useLoaderData() as LoaderData;
    const theme = useTheme();
    const { t } = useTranslation();

    const [reports, setReports] = useState<EventReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [actionType, setActionType] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [statusDistribution, setStatusDistribution] = useState<{[key: string]: number}>({});
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (loaderData) {
            const formattedReports = loaderData.reports.map(report => ({
                ...report,
                id: report.report_id
            }));
            setReports(formattedReports);
            setStatusDistribution(loaderData.status_distribution);
            setTotalCount(loaderData.total);
        }
    }, [loaderData]);;

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);

        if (newValue === 0) {
            setReports(loaderData.reports);
        } else if (newValue === 1) {
            setReports(loaderData.reports.filter(report => report.status === 'pending'));
        } else if (newValue === 2) {
            setReports(loaderData.reports.filter(report => report.status === 'under_review'));
        } else if (newValue === 3) {
            setReports(loaderData.reports.filter(report =>
                report.status === 'resolved' || report.status === 'action_taken'));
        }
    };

    const handleViewDetails = (id: number) => {
        const report = reports.find((r) => r.report_id === id);
        if (report) {
            setSelectedReport(report);
            setAdminNotes('');
            setActionType('');
            setOpenDialog(true);
        }
    };

    const handleResolveReport = (id: number, actionTaken: boolean = false) => {
        setReports(reports.map(report =>
            report.report_id === id ?
                { ...report, status: actionTaken ? 'action_taken' : 'resolved' } :
                report
        ));
        setOpenDialog(false);
    };

    const handleStartReview = (id: number) => {
        setReports(reports.map(report =>
            report.report_id === id ? { ...report, status: 'under_review' } : report
        ));
        setOpenDialog(false);
    };

    const pendingReports = statusDistribution['pending'] || 0;
    const highSeverityReports = reports.filter(r => r.report_level === 'HIGH').length;
    const resolvedReports = (statusDistribution['resolved'] || 0) +
        (statusDistribution['action_taken'] || 0);

    const getSeverityColor = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'HIGH': return theme.palette.error;
            case 'MEDIUM': return theme.palette.warning;
            case 'LOW': return theme.palette.info;
            default: return theme.palette.primary;
        }
    };

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'pending':
                return <Chip size="small" icon={<WarningAmberIcon />} label={t('status.pending')} color="warning" />;
            case 'under_review':
                return <Chip size="small" icon={<VisibilityIcon />} label={t('status.underReview')} color="info" />;
            case 'resolved':
                return <Chip size="small" icon={<CheckCircleIcon />} label={t('status.resolved')} color="success" />;
            case 'action_taken':
                return <Chip size="small" icon={<BlockIcon />} label={t('status.actionTaken')} color="error" />;
            default:
                return <Chip size="small" label={status} />;
        }
    };

    const reportColumns: GridColDef[] = [
        { field: 'report_id', headerName: 'ID', width: 70 },
        { field: 'event_name', headerName: t('columns.eventName'), flex: 1, minWidth: 180 },
        { field: 'reporter_name', headerName: t('columns.reportedBy'), flex: 1, minWidth: 150 },
        {
            field: 'report_date',
            headerName: t('columns.dateReported'),
            flex: 1,
            minWidth: 120,
            valueFormatter: (params) => {
                if (!params.value) return '-';
                return dayjs(params.value.toString()).format('MM/DD/YYYY');
            }
        },
        { field: 'report_reason', headerName: t('columns.reason'), flex: 1, minWidth: 150 },
        {
            field: 'report_level',
            headerName: t('columns.severity'),
            flex: 1,
            minWidth: 120,
            renderCell: (params: GridRenderCellParams<any>) => {
                if (!params.value) return null;
                const severity = params.value as string;
                const color = getSeverityColor(severity);

                return (
                    <Chip
                        label={t(`severity.${severity.toLowerCase()}`)}
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
            headerName: t('columns.status'),
            flex: 1,
            minWidth: 140,
            renderCell: (params: GridRenderCellParams<any>) => {
                if (!params.value) return null;
                return getStatusChip(params.value as string);
            }
        },
        {
            field: 'actions',
            headerName: t('columns.actions'),
            flex: 1,
            minWidth: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams<EventReport>) => {
                return (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleViewDetails(params.row.report_id)}
                            sx={{ borderRadius: '8px' }}
                        >
                            {t('buttons.review')}
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
                        <FlagIcon sx={{ mr: 1 }} /> {t('eventReports')}
                    </Typography>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {t('metrics.pendingReports')}
                            </Typography>
                            <Typography variant="h4" color="warning.main" fontWeight="bold">
                                {pendingReports}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {t('metrics.highSeverity')}
                            </Typography>
                            <Typography variant="h4" color="error.main" fontWeight="bold">
                                {highSeverityReports}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {t('metrics.resolved')}
                            </Typography>
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                                {resolvedReports}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                {t('metrics.totalReports')}
                            </Typography>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                                {totalCount}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ width: '100%', mb: 2 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        textColor="primary"
                        indicatorColor="primary"
                        aria-label="report filter tabs"
                    >
                        <Tab label={t('tabs.allReports')} />
                        <Tab label={t('tabs.pending')} />
                        <Tab label={t('tabs.underReview')} />
                        <Tab label={t('tabs.resolved')} />
                    </Tabs>
                </Box>

                <Box sx={{ height: 500, width: '100%' }}>
                    <CustomizedDataGrid
                        rows={reports}
                        columns={reportColumns}
                        getRowId={(row) => row.report_id}
                        pageSizeOptions={[loaderData.size, 5, 10, 25]}
                        disableRowSelectionOnClick
                        initialState={{
                            pagination: { paginationModel: { pageSize: loaderData.size } },
                            sorting: {
                                sortModel: [{ field: 'report_date', sort: 'desc' }],
                            },
                        }}
                        getRowClassName={(params) =>
                            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
                        }
                        sx={{
                            '& .MuiDataGrid-cell': {
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center'
                            }
                        }}
                    />
                </Box>
            </Paper>

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedReport && (
                    <>
                        <DialogTitle>
                            {t('dialog.reportFor')} {selectedReport.event_name}
                            <Typography variant="subtitle2" color="text.secondary" component="div">
                                {t('dialog.reportId')}: {selectedReport.report_id} | {t('dialog.eventId')}: {selectedReport.event_id}
                            </Typography>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.reportedBy')}</Typography>
                                    <Typography variant="body1">{selectedReport.reporter_name}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.dateReported')}</Typography>
                                    <Typography variant="body1">{dayjs(selectedReport.report_date).format('MM/DD/YYYY')}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.reason')}</Typography>
                                    <Typography variant="body1">{selectedReport.report_reason}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Typography variant="subtitle2" color="text.secondary">{t('dialog.status')}:</Typography>
                                        {getStatusChip(selectedReport.status)}

                                        <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 2 }}>{t('dialog.severity')}:</Typography>
                                        <Chip
                                            label={t(`severity.${selectedReport.report_level.toLowerCase()}`)}
                                            size="small"
                                            color={selectedReport.report_level === 'HIGH' ? 'error' : selectedReport.report_level === 'MEDIUM' ? 'warning' : 'info'}
                                        />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.description')}</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                                        <Typography variant="body2">{selectedReport.report_details}</Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.adminNotes')}</Typography>
                                    <TextField
                                        multiline
                                        rows={4}
                                        fullWidth
                                        variant="outlined"
                                        placeholder={t('dialog.addNotes')}
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        sx={{ mt: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.action')}</Typography>
                                    <FormControl fullWidth sx={{ mt: 1 }}>
                                        <InputLabel id="action-type-label">{t('dialog.selectAction')}</InputLabel>
                                        <Select
                                            labelId="action-type-label"
                                            value={actionType}
                                            label={t('dialog.selectAction')}
                                            onChange={(e) => setActionType(e.target.value)}
                                        >
                                            <MenuItem value="none">{t('actions.noAction')}</MenuItem>
                                            <MenuItem value="warning">{t('actions.issueWarning')}</MenuItem>
                                            <MenuItem value="suspend_event">{t('actions.suspendEvent')}</MenuItem>
                                            <MenuItem value="suspend_organizer">{t('actions.suspendOrganizer')}</MenuItem>
                                            <MenuItem value="refund">{t('actions.processRefunds')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                            <Button onClick={() => setOpenDialog(false)}>{t('buttons.cancel')}</Button>
                            <Stack direction="row" spacing={1}>
                                {selectedReport.status === 'pending' && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleStartReview(selectedReport.report_id)}
                                    >
                                        {t('buttons.startReview')}
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => handleResolveReport(selectedReport.report_id)}
                                >
                                    {t('buttons.markResolved')}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleResolveReport(selectedReport.report_id, true)}
                                >
                                    {t('buttons.takeAction')}
                                </Button>
                            </Stack>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}