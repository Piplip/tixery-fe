import * as React from 'react';
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import CustomizedDataGrid from '../CustomizedDataGrid';
import {alpha, useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlagIcon from '@mui/icons-material/Flag';
import {Link as RouterLink, useLoaderData} from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import EventIcon from '@mui/icons-material/Event';
import {useTranslation} from 'react-i18next';
import dayjs from 'dayjs';
import {eventAxiosWithToken} from '../../../../config/axiosConfig';
import {useAlert} from "../../../../custom-hooks/useAlert";
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';

interface EventReport {
    report_id: number;
    event_id: string;
    organizer_id: number;
    event_name: string;
    reporter_name: string;
    reporter_email: string | null;
    report_reason: string;
    report_details: string;
    report_date: string;
    status: 'pending' | 'under_review' | 'resolved' | 'action_taken';
    reporter_profile_id: number;
    organizer_name: string;
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
    const [isLoading, setIsLoading] = useState(false);

    const [reports, setReports] = useState<EventReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [actionType, setActionType] = useState('');
    const [tabValue, setTabValue] = useState(0);
    const [statusDistribution, setStatusDistribution] = useState<{[key: string]: number}>({});
    const [totalCount, setTotalCount] = useState(0);
    const {showError, showSuccess} = useAlert()

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
    }, [loaderData]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);

        let filteredReports;
        if (newValue === 0) {
            filteredReports = loaderData.reports;
        } else if (newValue === 1) {
            filteredReports = loaderData.reports.filter(report => report.status === 'pending');
        } else if (newValue === 2) {
            filteredReports = loaderData.reports.filter(report => report.status === 'under_review');
        } else if (newValue === 3) {
            filteredReports = loaderData.reports.filter(report =>
                report.status === 'resolved' || report.status === 'action_taken');
        } else {
            filteredReports = loaderData.reports;
        }

        const formattedReports = filteredReports.map(report => ({
            ...report,
            id: report.report_id
        }));

        setReports(formattedReports);
    };

    const handleViewDetails = (id: number) => {
        const report = reports.find((r) => r.report_id === id);
        if (report) {
            setSelectedReport(report);
            setActionType('');
            setOpenDialog(true);
        }
    };

    const handleResolveReport = (id: number, actionTaken: boolean = false) => {
        const report = reports.find(r => r.report_id === id);
        if (!report) return;

        setIsLoading(true);
        const newStatus = actionTaken ? 'action_taken' : 'resolved';

        const requestData = {
            reportID: id.toString(),
            eventID: report.event_id,
            organizerID: report.organizer_id.toString(),
            status: newStatus,
            action: actionTaken ? actionType : null
        };

        const customAxios = axios.create({
            baseURL: 'http://localhost:4001/events',
            timeout: 20000,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('tk')
            }
        });

        customAxios.post('/admin/report', requestData)
            .then(response => {
                updateUiAfterSuccess(id, newStatus);
            })
            .catch(error => {
                console.error("Error updating report:", error.response?.status, error.response?.data);

                if (error.response?.status === 404) {
                    updateUiAfterSuccess(id, newStatus);
                } else {
                    showError(t('error.reportUpdateFailed'));
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const updateUiAfterSuccess = (id: number, newStatus: string) => {
        setReports(reports.map(report => report.report_id === id ? { ...report, status: newStatus } : report));

        const updatedDistribution = { ...statusDistribution };
        if (reports.find(r => r.report_id === id)?.status) {
            const oldStatus = reports.find(r => r.report_id === id)!.status;
            updatedDistribution[oldStatus] = (updatedDistribution[oldStatus] || 0) - 1;
        }
        updatedDistribution[newStatus] = (updatedDistribution[newStatus] || 0) + 1;
        setStatusDistribution(updatedDistribution);

        setOpenDialog(false);
        showSuccess(t('success.reportUpdated'));
    };

    const handleStartReview = (id: number) => {
        const report = reports.find(r => r.report_id === id);
        if (!report) return;

        setIsLoading(true);
        const requestData = {
            reportID: id.toString(),
            eventID: report.event_id,
            organizerID: report.organizer_id.toString(),
            status: 'under_review',
            action: null
        };

        eventAxiosWithToken.post('/admin/report', requestData)
            .then(() => {
                setReports(reports.map(report =>
                    report.report_id === id ? { ...report, status: 'under_review' } : report
                ));

                const updatedDistribution = { ...statusDistribution };
                if (reports.find(r => r.report_id === id)?.status) {
                    const oldStatus = reports.find(r => r.report_id === id)!.status;
                    updatedDistribution[oldStatus] = (updatedDistribution[oldStatus] || 0) - 1;
                }
                updatedDistribution['under_review'] = (updatedDistribution['under_review'] || 0) + 1;
                setStatusDistribution(updatedDistribution);

                setOpenDialog(false);
                showSuccess(t('success.reportUpdated'));
            })
            .catch(() => {
                showError(t('error.reportUpdateFailed'));
            })
            .finally(() => {
                setIsLoading(false);
            });
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
        { field: 'report_id', headerName: 'ID', width: 50 },
        { field: 'event_name', headerName: t('columns.eventName'), flex: 1, minWidth: 180 },
        { field: 'reporter_name', headerName: t('columns.reportedBy'), flex: 1, minWidth: 150 },
        { field: 'organizer_name', headerName: t('columns.organizer'), flex: 1, minWidth: 150 },
        {
            field: 'report_date',
            headerName: t('columns.dateReported'),
            flex: 1,
            minWidth: 150,
            valueFormatter: (params) => {
                return dayjs(params.toString()).format('HH:mm DD/MM/YYYY');
            }
        },
        { field: 'report_reason', headerName: t('columns.reason'), flex: 1, minWidth: 150,
            renderCell: (params: GridRenderCellParams<any>) => {
                if (!params) return null;
                const reason = params.value as string;
                const formattedReason = reason.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, '')
                return <Typography variant="body2" noWrap>{t(`${formattedReason}`)}</Typography>;
            }
        },
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
                                    <Typography variant="body1">{dayjs(selectedReport.report_date).format('DD/MM/YYYY')}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('columns.organizer')}</Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body1">{selectedReport.organizer_name}</Typography>
                                        <Button
                                            component={RouterLink}
                                            to={`/o/${selectedReport.organizer_id}`}
                                            target="_blank"
                                            size="small"
                                            startIcon={<PersonIcon />}
                                            endIcon={<OpenInNewIcon fontSize="small" />}
                                            sx={{ ml: 1 }}
                                        >
                                            {t('dialog.viewProfile')}
                                        </Button>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('columns.eventName')}</Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body1" noWrap sx={{ maxWidth: '200px' }}>
                                            {selectedReport.event_name}
                                        </Typography>
                                        <Button
                                            component={RouterLink}
                                            to={`/events/${selectedReport.event_id}`}
                                            target="_blank"
                                            size="small"
                                            startIcon={<EventIcon />}
                                            endIcon={<OpenInNewIcon fontSize="small" />}
                                            sx={{ ml: 1 }}
                                        >
                                            {t('dialog.viewEvent')}
                                        </Button>
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.reason')}</Typography>
                                    <Typography variant="body1">{t(selectedReport.report_reason.toLowerCase().replace(/ /g, '_').replace(/[^a-z0-9_]/g, ''))}</Typography>
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
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Report Count</Typography>
                                    <Typography variant="body1">{selectedReport.report_count}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">{t('dialog.description')}</Typography>
                                    <Paper variant="outlined" sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                                        <Typography variant="body2">{selectedReport.report_details}</Typography>
                                    </Paper>
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
                                            <MenuItem value="process_refunds">{t('actions.processRefunds')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                            <Button
                                onClick={() => setOpenDialog(false)}
                                disabled={isLoading}
                            >
                                {t('buttons.cancel')}
                            </Button>
                            <Stack direction="row" spacing={1}>
                                {selectedReport.status === 'pending' && (
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        onClick={() => handleStartReview(selectedReport.report_id)}
                                        disabled={isLoading}
                                        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                                    >
                                        {isLoading ? t('buttons.processing') : t('buttons.startReview')}
                                    </Button>
                                )}
                                <Button
                                    variant="outlined"
                                    color="success"
                                    onClick={() => handleResolveReport(selectedReport.report_id)}
                                    disabled={isLoading}
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                                >
                                    {isLoading ? t('buttons.processing') : t('buttons.markResolved')}
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleResolveReport(selectedReport.report_id, true)}
                                    disabled={isLoading || !actionType || actionType === 'none'}
                                    startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                                >
                                    {isLoading ? t('buttons.processing') : t('buttons.takeAction')}
                                </Button>
                            </Stack>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
}