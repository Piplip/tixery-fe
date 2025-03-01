import "../../styles/organizer-report-styles.css"
import {
    Alert,
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {Card, CardContent} from "@mui/joy";
import {useEffect, useState} from "react";
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
} from "recharts";
import {useLoaderData} from "react-router-dom";
import dayjs from "dayjs";
import {formatCurrency, getUserData} from "../../common/Utilities.js";
import {DatePicker} from "@mui/x-date-pickers";
import {accountAxiosWithToken, eventAxiosWithToken} from "../../config/axiosConfig.js";
import Option from "@mui/joy/Option";
import Select from "@mui/joy/Select";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {useTranslation} from "react-i18next";
import EventIcon from '@mui/icons-material/Event';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import PersonIcon from "@mui/icons-material/Person";

const CustomizedYAxisTick = ({ x, y, payload }) => {
    const fullName = payload.value;
    const displayName = fullName.length > 15 ? fullName.substring(0, 15) + '...' : fullName;
    return (
        <text x={x - 5} y={y + 4} textAnchor="end" fill="#666">
            {displayName}
        </text>
    );
};

initializeApp(firebaseConfig);
const storage = getStorage();

function OrganizerReport(){
    const loaderData  = useLoaderData()
    console.log(loaderData)
    const [reportData, setReportData] = useState(loaderData);
    const [profiles, setProfiles] = useState(null);
    const [filters, setFilters] = useState({
        startDate: dayjs().subtract(1, 'week'),
        endDate: dayjs(),
        profile: 'all'
    });
    const {t} = useTranslation()
    const [openEventMetrics, setOpenEventMetrics] = useState(false);

    useEffect(() => {
        if(profiles === null) {{
            accountAxiosWithToken.get(`/organizer/profile?u=${getUserData('sub')}`)
                .then(r => {
                    const data = r.data.records
                    Promise.all(data.map(async (profile) => {
                        try {
                            const imgRef = ref(storage, profile[2]);
                            profile[2] = await getDownloadURL(imgRef)
                        } catch (err) {
                            console.log(err);
                            return profile;
                        }
                    })).then(() => setProfiles(data));
                })
                .catch(err => console.log(err))
        }}
    }, [profiles]);

    const sumViews = () =>
        reportData?.viewsByEvent.reduce((acc, curr) => acc + curr.views, 0);

    const sumLikes = () =>
        reportData?.likedByEvent.reduce((acc, curr) => acc + curr.likes, 0);

    const sumTickets = () =>
        reportData?.ticketsAndBuyersData.reduce((acc, curr) => acc + curr.tickets, 0);

    const sumBuyers = () =>
        reportData?.ticketsAndBuyersData.reduce((acc, curr) => acc + curr.buyers, 0);

    const countEvents = () => {
        const uniqueEvents = new Set(reportData?.viewsByEvent.map(ev => ev.event_id));
        return uniqueEvents.size;
    };

    const applyFilters = () => {
        const params = new URLSearchParams({
            uid: getUserData("userID"),
            start: dayjs().subtract(1, 'month').format("YYYY-MM-DDTHH:mm:ssZ"),
            end: dayjs().add(1, 'day').format("YYYY-MM-DDTHH:mm:ssZ")
        })

        if(filters.profile !== 'all') {
            params.append('pid', filters.profile)
        }

        eventAxiosWithToken.get(`/organizer/report?${params.toString()}`)
            .then((response) => {
                console.log(response.data)
                setReportData(response.data.data);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const eventMetricsData = reportData?.viewsByEvent
        .map(item => {
            const likesEntry = reportData?.likedByEvent.find(
                like => like.event_id === item.event_id
            );
            return {
                Name: item.name || item.event_id,
                Views: item.views,
                Likes: likesEntry ? likesEntry.likes : undefined
            };
        })
        .sort((a, b) => b.Views - a.Views);

    const handleOpenEventMetrics = () => setOpenEventMetrics(true);
    const handleCloseEventMetrics = () => setOpenEventMetrics(false);

    const grossRevenueData = reportData?.grossRevenueData.map((item) => {
        return {
            date: dayjs(item.date).format('DD/MM'),
            Revenue: item.revenue / 100
        }
    })

    const ticketsAndBuyersData = reportData?.ticketsAndBuyersData.map((item) => {
        return {
            date: dayjs(item.date).format('DD/MM'),
            Tickets: item.tickets,
            Orders: item.buyers
        }
    })

    return (
        <div className="organizer-report">
            <Typography variant="h4" className="organizer-report__title">
                {t('organizerReport.organizerReport', {start: filters.startDate.format("DD/MM/YYYY"), end: filters.endDate.format("DD/MM/YYYY")})}
            </Typography>

            <Paper className="organizer-report__filters" elevation={2}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <DatePicker format={"DD/MM/YYYY"}
                                    slotProps={{
                                        textField: {
                                            size: 'small'
                                        }
                                    }}
                                    type="date"
                                    label={t('organizerReport.startDate')}
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={(val) => setFilters({ ...filters, startDate: val })}
                                    fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <DatePicker format={"DD/MM/YYYY"}
                                    slotProps={{
                                        textField: {
                                            size: 'small'
                                        }
                                    }}
                                    type="date"
                                    label={t('organizerReport.endDate')}
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={(val) => setFilters({ ...filters, endDate: val })}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Select value={filters.profile} onChange={(_, val) => setFilters(prev => ({ ...prev, profile: val }))} fullWidth>
                            <Option value="all">{t('eventList.allOrganizers')}</Option>
                            {profiles && profiles.map((profile, index) => {
                                return (
                                    <Option value={profile[0]} key={index} sx={{ padding: '.5rem 1rem' }}>
                                        <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                            <Avatar src={profile[2]} />
                                            {profile[1]}
                                        </Stack>
                                    </Option>
                                )
                            })}
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <Button variant="contained" color="primary" onClick={applyFilters} fullWidth>
                            {t('organizerReport.applyFilters')}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {reportData ?
                <>
                    <Typography variant="h6" sx={{ mt: 3, mb: 1, fontWeight: 500 }}>
                        {t('organizerReport.keyPerformanceMetrics')}
                    </Typography>

                    <Grid container spacing={2} className="organizer-report__summary">
                        <Grid item xs={12} sm={4} md={3}>
                            <Card className="organizer-report__card" variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={1}>
                                        <EventIcon className="organizer-report__summary-icon" />
                                        <Typography variant="subtitle1">{t('organizerReport.totalEvents')}</Typography>
                                    </Stack>
                                    <Typography variant="h5">{countEvents()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4} md={3}>
                            <Card className="organizer-report__card" variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={1}>
                                        <VisibilityIcon className="organizer-report__summary-icon" />
                                        <Typography variant="subtitle1">{t('organizerReport.totalViews')}</Typography>
                                    </Stack>
                                    <Typography variant="h5">{sumViews()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={4} md={3}>
                            <Card className="organizer-report__card" variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={1}>
                                        <FavoriteIcon className="organizer-report__summary-icon" />
                                        <Typography variant="subtitle1">{t('organizerReport.totalLikes')}</Typography>
                                    </Stack>
                                    <Typography variant="h5">{sumLikes()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card className="organizer-report__card" variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={1}>
                                        <ConfirmationNumberIcon className="organizer-report__summary-icon" />
                                        <Typography variant="subtitle1">{t('organizerReport.ticketsSold')}</Typography>
                                    </Stack>
                                    <Typography variant="h5">{sumTickets()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card className="organizer-report__card" variant="outlined">
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" mb={1}>
                                        <PersonIcon className="organizer-report__summary-icon" />
                                        <Typography variant="subtitle1">{t('organizerReport.totalOrders')}</Typography>
                                    </Stack>
                                    <Typography variant="h5">{sumBuyers()}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <div className="organizer-report__charts">
                        <Paper className="organizer-report__chart-card" elevation={2}>
                            <Typography variant="h6" className="organizer-report__chart-title">
                                {t('organizerReport.grossRevenue')}
                            </Typography>
                            {grossRevenueData && grossRevenueData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={grossRevenueData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(val, name) => [formatCurrency(val, 'USD'), t(`organizerReport.${name}`)]} />
                                        <Legend formatter={(val) => t(`organizerReport.${val}`)}/>
                                        <Line type="monotone" dataKey="Revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="organizer-report__chart-fallback">
                                    <Alert severity="info">{t('organizerReport.noGrossRevenueData')}</Alert>
                                </div>
                            )}
                        </Paper>

                        <Paper className="organizer-report__chart-card" elevation={2}>
                            <Typography variant="h6" className="organizer-report__chart-title">
                                {t('organizerReport.ticketsAndOrders')}
                            </Typography>
                            {ticketsAndBuyersData && ticketsAndBuyersData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={ticketsAndBuyersData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip formatter={(val, name) => [val, t(`organizerReport.${name}`)]}/>
                                        <Legend formatter={(val) => t(`organizerReport.${val}`)}/>
                                        <Bar dataKey="Tickets" fill="#82ca9d" />
                                        <Bar dataKey="Orders" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="organizer-report__chart-fallback">
                                    <Alert severity="info">{t('organizerReport.noTicketsOrdersData')}</Alert>
                                </div>
                            )}
                        </Paper>
                        <Typography variant={'body2'} sx={{ color: '#363636' }}>
                            {t('organizerReport.onlyDatesWithData')}
                        </Typography>
                    </div>

                    <Stack columnGap={1} className="organizer-report__cta" direction="row" justifyContent="center">
                        <Button variant="outlined" color="primary" onClick={handleOpenEventMetrics} className="organizer-report__cta-button">
                            {t('organizerReport.viewEventMetrics')}
                        </Button>
                    </Stack>
                </>
                :
                <Stack rowGap={2} className={'no-data-to-report'}>
                    <img alt={t('organizerReport.noDataToReport')}
                         src={'https://firebasestorage.googleapis.com/v0/b/medicare-10c3b.appspot.com/o/assets%2FAdobe%20Express%20-%20file%20(1).png?alt=media&token=2eed406f-fe0e-4b63-a4a8-4bd4321458ef'} />
                    <Typography variant="h3">{t('organizerReport.nothingToReport')}</Typography>
                    <Typography variant="body1">
                        {t('organizerReport.reportsAvailableAfterPublish')}
                    </Typography>
                </Stack>
            }

            <Dialog open={openEventMetrics} onClose={handleCloseEventMetrics} maxWidth="md" fullWidth>
                <DialogTitle>{t('organizerReport.eventMetricsTitle')}</DialogTitle>
                <DialogContent>
                    {eventMetricsData && eventMetricsData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                layout="vertical"
                                data={eventMetricsData}
                                margin={{ top: 20, right: 20, left: 120, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="Name" tick={<CustomizedYAxisTick />} />
                                <Tooltip formatter={(val, name) => [val, t(`organizerReport.${name}`)]}/>
                                <Legend formatter={(val) => t(`organizerReport.${val}`)}/>
                                <Bar dataKey="Views" fill="#82ca9d" barSize={7.5} />
                                <Bar dataKey="Likes" fill="#8884d8" barSize={7.5} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="organizer-report__chart-fallback">
                            <Alert severity="info">{t('organizerReport.noEventMetricsData')}</Alert>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEventMetrics} color="primary">
                        {t('organizerReport.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default OrganizerReport;