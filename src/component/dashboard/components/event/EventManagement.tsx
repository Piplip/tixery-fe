import * as React from 'react';
import {useState} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {DataGrid, GridColDef, GridPaginationModel} from '@mui/x-data-grid';
import {alpha, useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FilterListIcon from '@mui/icons-material/FilterList';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import dayjs from 'dayjs';
import {useLoaderData, useSearchParams, useSubmit} from 'react-router-dom';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import Chip from '@mui/material/Chip';
import {useTranslation} from "react-i18next";
import {viVN, enUS} from '@mui/x-data-grid/locales';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

interface EventStats {
    soldTickets: number;
    totalRevenue: number;
    completionRate: number;
    platformFee: number;
}

interface Event {
    id: string;
    name: string;
    organizer_name: string;
    start_time: string;
    total_tickets_sold: number;
    revenue: number;
    platform_fee: number;
    status: string;
    completion_rate: number;
}

interface EventsData {
    size: number;
    total_count: number;
    page: number;
    events: Event[];
}

export default function EventManagement() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const submit = useSubmit();
    const [searchParams] = useSearchParams();
    const { stats, events } = useLoaderData() as { stats: EventStats; events: EventsData };

    const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) - 1 : 0;
    const initialPageSize = searchParams.get('size') ? parseInt(searchParams.get('size')!, 10) : 10;
    const initialStartDate = searchParams.get('start_date')
        ? dayjs(searchParams.get('start_date'))
        : dayjs().subtract(30, 'day');
    const initialEndDate = searchParams.get('end_date')
        ? dayjs(searchParams.get('end_date'))
        : dayjs();

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: initialPage,
        pageSize: initialPageSize,
    });
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);
    const [tabValue, setTabValue] = useState(0);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(events.events);
    const [filteredCount, setFilteredCount] = useState<number>(events.total_count);

    const totalEvents = events.total_count || 0;

    const getLocale = () => {
        return i18n.language.startsWith('vi') ? viVN : enUS;
    };

    React.useEffect(() => {
        if (tabValue === 0) {
            setFilteredEvents(events.events);
            setFilteredCount(events.total_count);
        } else {
            const threshold = 70;
            const comparison = tabValue === 1
                ? (rate: number) => rate >= threshold
                : (rate: number) => rate < threshold;

            const filtered = events.events.filter(event => comparison(event.completion_rate));
            setFilteredEvents(filtered);

            const filterRatio = filtered.length / events.events.length || 1;
            const estimatedTotal = Math.max(filtered.length, Math.round(events.total_count * filterRatio));
            setFilteredCount(estimatedTotal);
        }
    }, [tabValue, events]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handlePaginationModelChange = (newModel: GridPaginationModel) => {
        setPaginationModel(newModel);

        const formData = new FormData();
        formData.append('page', String(newModel.page + 1));
        formData.append('size', String(newModel.pageSize));
        formData.append('start_date', startDate.format('YYYY-MM-DD'));
        formData.append('end_date', endDate.format('YYYY-MM-DD'));

        submit(formData, {method: 'get', action: '/admin/events'});
    };

    const applyDateFilter = () => {
        const formData = new FormData();
        formData.append('page', '1');
        formData.append('size', paginationModel.pageSize.toString());
        formData.append('start_date', startDate.format('YYYY-MM-DD'));
        formData.append('end_date', endDate.format('YYYY-MM-DD'));

        submit(formData, {method: 'get', action: '/admin/events'});
    };

    const reportColumns: GridColDef[] = [
        {field: 'name', headerName: t('eventManagement.eventName'), flex: 1, minWidth: 250},
        {field: 'organizer_name', headerName: t('eventManagement.organizer'), flex: 1, minWidth: 200},
        {
            field: 'start_time',
            headerName: t('eventManagement.date'),
            minWidth: 140,
            valueGetter: (params) => {
                return dayjs.tz(params, 'Asia/Ho_Chi_Minh').format('HH:mm DD MMM YYYY');
            }
        },
        {
            field: 'total_tickets_sold',
            headerName: t('eventManagement.ticketsSold'),
            type: 'number',
            flex: 1,
            minWidth: 120
        },
        {
            field: 'completion_rate',
            headerName: t('eventManagement.completionRate'),
            type: 'number',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                const value = params.value as number;
                const color = value >= 85 ? 'success' :
                    value >= 70 ? 'warning' : 'error';

                return (
                    <Box
                        sx={{
                            width: '100%',
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(theme.palette[color].main, 0.2),
                            position: 'relative',
                        }}
                    >
                        <Box
                            sx={{
                                height: '100%',
                                borderRadius: 5,
                                width: `${value}%`,
                                bgcolor: theme.palette[color].main
                            }}
                        />
                        <Typography
                            variant="caption"
                            sx={{
                                position: 'absolute',
                                top: -18,
                                right: 0,
                                color: theme.palette[color].main,
                                fontWeight: 'bold'
                            }}
                        >
                            {value}%
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: 'revenue',
            headerName: t('eventManagement.revenue'),
            type: 'number',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                if (params.value == null) return null;
                return `$${Number(params.value).toLocaleString()}`;
            }
        },
        {
            field: 'platform_fee',
            headerName: t('eventManagement.platformFee'),
            type: 'number',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                if (params.value == null) return null;
                return `$${Number(params.value).toLocaleString()}`;
            }
        },
        {
            field: 'status',
            headerName: t('eventManagement.status'),
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                const status = params.value as string;
                let color;
                let backgroundColor;

                switch (status) {
                    case 'published':
                        color = theme.palette.success.main;
                        backgroundColor = alpha(theme.palette.success.main, 0.1);
                        break;
                    case 'past':
                        color = theme.palette.info.main;
                        backgroundColor = alpha(theme.palette.info.main, 0.1);
                        break;
                    case 'cancelled':
                        color = theme.palette.error.main;
                        backgroundColor = alpha(theme.palette.error.main, 0.1);
                        break;
                    default:
                        color = theme.palette.text.primary;
                        backgroundColor = alpha(theme.palette.action.hover, 0.1);
                }

                return (
                    <Box
                        sx={{
                            backgroundColor,
                            color,
                            py: 0.5,
                            px: 1.5,
                            borderRadius: 1,
                            display: 'inline-block',
                            fontWeight: 'medium',
                            textAlign: 'center',
                            minWidth: '80px'
                        }}
                    >
                        {t(`eventManagement.statusValue.${status}`)}
                    </Box>
                );
            }
        }
    ];

    return (
        <Box sx={{height: '100%', width: '100%'}}>
            <Paper sx={{p: 3}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h2">
                        {t('eventManagement.title')}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            {t('eventManagement.totalEvents')}:
                        </Typography>
                        <Chip
                            label={totalEvents}
                            color="primary"
                            size="small"
                            sx={{fontWeight: 'bold'}}
                        />
                    </Stack>
                </Stack>

                <Grid container spacing={3} sx={{mb: 4}}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2}}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('eventManagement.totalRevenue')}
                                </Typography>
                                <Typography variant="h4" component="div" color="primary.main" fontWeight="bold">
                                    ${stats.totalRevenue.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2}}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('eventManagement.ticketsSold')}
                                </Typography>
                                <Typography variant="h4" component="div" color="success.main" fontWeight="bold">
                                    {stats.soldTickets.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 2}}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('eventManagement.platformFee')}
                                </Typography>
                                <Typography variant="h4" component="div" color="info.main" fontWeight="bold">
                                    ${stats.platformFee.toLocaleString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2}}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    {t('eventManagement.avgCompletionRate')}
                                </Typography>
                                <Typography variant="h4" component="div" color="warning.main" fontWeight="bold">
                                    {stats.completionRate.toFixed(1)}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Paper sx={{p: 2, mb: 3, borderRadius: 2}}>
                    <Stack
                        direction={{xs: 'column', md: 'row'}}
                        spacing={2}
                        alignItems={{xs: 'flex-start', md: 'center'}}
                        justifyContent="space-between"
                    >
                        <Typography variant="subtitle1" sx={{display: 'flex', alignItems: 'center'}}>
                            <FilterListIcon sx={{mr: 1}}/> {t('eventManagement.filterReports')}
                        </Typography>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                                <DatePicker format={"DD/MM/YYYY"}
                                            label={t('eventManagement.startDate')}
                                            value={startDate}
                                            onChange={(date) => setStartDate(date)}
                                            slotProps={{textField: {size: 'small'}}}
                                />
                                <DatePicker format={"DD/MM/YYYY"}
                                            label={t('eventManagement.endDate')}
                                            value={endDate}
                                            onChange={(date) => setEndDate(date)}
                                            slotProps={{textField: {size: 'small'}}}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={applyDateFilter}
                                    size="small"
                                >
                                    {t('eventManagement.apply')}
                                </Button>
                            </Stack>
                        </LocalizationProvider>
                    </Stack>

                    <Box sx={{width: '100%', mt: 2}}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            textColor="primary"
                            indicatorColor="primary"
                        >
                            <Tab label={t('eventManagement.allEvents')}/>
                            <Tab label={t('eventManagement.highPerformance')}/>
                            <Tab label={t('eventManagement.lowPerformance')}/>
                        </Tabs>
                    </Box>
                </Paper>

                <Box sx={{height: 600, width: '100%'}}>
                    <DataGrid
                        localeText={getLocale().components.MuiDataGrid.defaultProps.localeText}
                        rows={filteredEvents}
                        columns={reportColumns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePaginationModelChange}
                        pageSizeOptions={[5, 10, 25, 50]}
                        paginationMode="server"
                        rowCount={filteredCount}
                        disableRowSelectionOnClick
                        getRowClassName={(params) =>
                            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
                        }
                        sx={{
                            '& .MuiDataGrid-cell': {
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center'
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.primary.dark, 0.7)
                                    : theme.palette.primary.main,
                                color: theme.palette.mode === 'dark'
                                    ? theme.palette.primary.contrastText
                                    : '#000000',
                                fontWeight: 'bold',
                                '& .MuiDataGrid-columnHeaderTitle': {
                                    fontWeight: 'bold',
                                },
                            },
                            '& .even-row': {
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.paper, 0.3)
                                    : theme.palette.background.paper,
                            },
                            '& .odd-row': {
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? alpha(theme.palette.background.default, 0.6)
                                    : alpha(theme.palette.action.hover, 0.3),
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            },
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}