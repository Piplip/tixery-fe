import * as React from 'react';
import {useState} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {GridColDef} from '@mui/x-data-grid';
import CustomizedDataGrid from '../CustomizedDataGrid';
import {alpha, useTheme} from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import dayjs from 'dayjs';
import {useLoaderData} from 'react-router-dom';
import {eventAxiosWithToken} from "../../../../config/axiosConfig.js";
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

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
    const theme = useTheme();
    const { stats, events } = useLoaderData() as { stats: EventStats; events: EventsData };
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [filteredEvents, setFilteredEvents] = useState<Event[]>(events.events);
    const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day'));
    const [endDate, setEndDate] = useState(dayjs());
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        if (newValue === 0) {
            setFilteredEvents(events.events);
        } else if (newValue === 1) {
            setFilteredEvents(events.events.filter(event => event.completion_rate >= 75));
        } else if (newValue === 2) {
            setFilteredEvents(events.events.filter(event => event.completion_rate < 75));
        }
    };

    const handleExport = () => {
        alert('Report export started');
    };

    const applyDateFilter = async () => {
        const searchParams = new URLSearchParams({
            page: (page + 1).toString(),
            size: pageSize.toString(),
            start_date: startDate.format('YYYY-MM-DD'),
            end_date: endDate.format('YYYY-MM-DD')
        });

        const url = `/admin/events?${searchParams.toString()}`;
        const response = await eventAxiosWithToken.get(url);
        setFilteredEvents(response.data.events);
    };

    const reportColumns: GridColDef[] = [
        { field: 'name', headerName: 'Event Name', flex: 1, minWidth: 200 },
        { field: 'organizer_name', headerName: 'Organizer', flex: 1, minWidth: 150 },
        {
            field: 'start_time',
            headerName: 'Date',
            flex: 1,
            minWidth: 200,
            valueGetter: (params) => {
                return dayjs.tz(params, 'Asia/Ho_Chi_Minh').format('HH:mm DD MMM YYYY');
            }
        },
        {
            field: 'total_tickets_sold',
            headerName: 'Tickets Sold',
            type: 'number',
            flex: 1,
            minWidth: 120
        },
        {
            field: 'completion_rate',
            headerName: 'Completion Rate',
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
            headerName: 'Revenue',
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
            headerName: 'Platform Fee',
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
            headerName: 'Status',
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
                        {status.charAt(0).toUpperCase() + status.slice(1)}
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
                        Event Reports
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon/>}
                        onClick={handleExport}
                        sx={{borderRadius: '8px'}}
                    >
                        Export
                    </Button>
                </Stack>

                <Grid container spacing={3} sx={{mb: 4}}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2}}>
                            <CardContent>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Total Revenue
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
                                    Tickets Sold
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
                                    Platform Fee
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
                                    Avg. Completion Rate
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
                            <FilterListIcon sx={{mr: 1}}/> Filter Reports
                        </Typography>

                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <Stack direction={{xs: 'column', sm: 'row'}} spacing={2} alignItems="center">
                                <DatePicker format={"DD/MM/YYYY"}
                                    label="Start Date"
                                    value={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    slotProps={{textField: {size: 'small'}}}
                                />
                                <DatePicker format={"DD/MM/YYYY"}
                                    label="End Date"
                                    value={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    slotProps={{textField: {size: 'small'}}}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={applyDateFilter}
                                    size="small"
                                >
                                    Apply
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
                            <Tab label="All Events"/>
                            <Tab label="High Performance"/>
                            <Tab label="Low Performance"/>
                        </Tabs>
                    </Box>
                </Paper>

                <Box sx={{height: 600, width: '100%'}}>
                    <CustomizedDataGrid
                        rows={filteredEvents}
                        columns={reportColumns}
                        pageSize={10}
                        pageSizeOptions={[10, 25, 50]}
                        checkboxSelection
                        disableRowSelectionOnClick
                        initialState={{
                            pagination: {paginationModel: {pageSize: 10}},
                            sorting: {
                                sortModel: [{field: 'eventDate', sort: 'desc'}],
                            },
                        }}
                        getRowClassName={(params) =>
                            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
                        }
                        sx={{
                            '& .MuiDataGrid-cell': {
                                whiteSpace: 'normal',
                                lineHeight: 'normal',
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
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
                            '& .MuiDataGrid-footerContainer': {
                                borderTop: `1px solid ${theme.palette.divider}`,
                            },
                            '& .MuiDataGrid-virtualScroller': {
                                backgroundColor: theme.palette.background.paper,
                            },
                            '& .MuiDataGrid-virtualScrollerContent': {
                                minHeight: '100% !important',
                            },
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}