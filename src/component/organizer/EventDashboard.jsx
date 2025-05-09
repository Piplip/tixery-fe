import PropTypes from "prop-types";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import '../../styles/event-dashboard-styles.css'
import {useTranslation} from "react-i18next";
import ShareDialog from "../shared/ShareDialog.jsx";
import CloseIcon from "@mui/icons-material/Close";
import {useEffect, useState} from "react";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import dayjs from "dayjs";
import {formatCurrency} from "../../common/Utilities.js";
import EventAttendee from "./EventAttendee.jsx";

EventDashboard.propTypes = {
    open: PropTypes.bool,
    setOpen: PropTypes.func,
    eventID: PropTypes.string,
    startTime: PropTypes.string
}

const basePath = 'https://tixery-fe.vercel.app'

function EventDashboard({open = false, setOpen, eventID, startTime}){
    const {t} = useTranslation()
    const [stats, setStats] = useState(null)
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        if(eventID){
            Promise.all([
                eventAxiosWithToken.get(`/event/dashboard?eid=${eventID}`),
                eventAxiosWithToken.get(`/search/orders?eid=${eventID}&range=1`)
            ]).then(([stats, orders]) => {
                setStats({
                    ...stats.data,
                    recentOrders: orders.data
                })
            }).catch(err => console.log(err))
        }
    }, [eventID]);

    const handleCopyLink = () => {
        const eventLink = `${basePath}//events/${eventID}`;
        navigator.clipboard.writeText(eventLink).then(() => {
            alert(t('eventDashboard.linkCopied'));
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    return (
        <Dialog open={open} maxWidth="lg" fullWidth
                onClose={() => {
                    setOpen({startTime: null, id: null})
                    setTabValue(0)
                }}
        >
            <DialogTitle>
                <Typography fontSize={40} fontFamily={'Roboto Slab'} fontWeight="bold">
                    {t('eventDashboard.title')}
                </Typography>
                <IconButton
                    onClick={() => {
                        setOpen({startTime: null, id: null})
                        setTabValue(0)
                    }}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
                    <Tab label={t('eventDashboard.salesTab')} />
                    <Tab label={t('eventDashboard.attendeesTab')} />
                </Tabs>
            </Box>
            <DialogContent>
                {tabValue === 0 ?
                    <Stack rowGap={'1rem'}>
                        <Stack direction={'row'}>
                            <EventIcon sx={{ mr: 1 }} />
                            <Typography variant="subtitle1" style={{textTransform: 'capitalize'}}>
                                {dayjs(startTime).format('dddd, DD MMMM, YYYY')}
                            </Typography>
                        </Stack>
                        <Stack rowGap={'1rem'}>
                            <Stack direction={'row'} justifyContent={'space-between'} style={{backgroundColor: '#f3f3f3'}} alignItems={'center'} padding={'.5rem 1rem'}>
                                <Stack direction={'row'} columnGap={2}>
                                    <Typography variant="body2">
                                        {t('eventDashboard.eventLink')}
                                    </Typography>
                                    <Typography variant="body2">
                                        {basePath}/events/{eventID}
                                    </Typography>
                                </Stack>
                                <Stack direction={'row'} columnGap={2}>
                                    <Button startIcon={<ContentCopyIcon />} className={'dashboard__copy-button'}
                                            sx={{
                                                backgroundColor: 'white',
                                                color: 'black',
                                                padding: '.25rem 1rem',
                                                fontSize: 11
                                            }}
                                            onClick={handleCopyLink}
                                    >
                                        {t('eventDashboard.copyLink')}
                                    </Button>
                                    <ShareDialog eventID={eventID} />
                                </Stack>
                            </Stack>
                            <Stack direction={'row'} columnGap={2}>
                                <div className={'event-dashboard-stats'}>
                                    <Typography variant="body2">{t('eventDashboard.ticketsSold')}</Typography>
                                    <Typography variant="h3">
                                        {stats?.ticketSales ? stats.ticketSales.reduce((acc, curr) => acc + curr.sold_quantity, 0) : '--'}
                                    </Typography>
                                </div>
                                <div className={'event-dashboard-stats'}>
                                    <Typography variant="body2">{t('eventDashboard.pageViews')}</Typography>
                                    <Typography variant="h3">
                                        {stats?.totalViews || 0}
                                    </Typography>
                                </div>
                            </Stack>
                        </Stack>
                        <Stack>
                            <Typography variant="h6" mb={1}>
                                {t('eventDashboard.salesByTicketType')}
                            </Typography>
                            <TableContainer component={Paper} sx={{ mb: 2 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('eventDashboard.ticketType')}</TableCell>
                                            <TableCell>{t('eventDashboard.sold')}</TableCell>
                                            <TableCell>{t('eventDashboard.pricePerTicket')}</TableCell>
                                            <TableCell>{t('eventDashboard.salesStartTime')}</TableCell>
                                            <TableCell>{t('eventDashboard.salesEndTime')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats?.ticketSales.length > 0 ?
                                            stats.ticketSales.map((ticket, index) => (
                                                <TableRow key={index}>
                                                    <TableCell sx={{maxWidth: '12.5rem', textWrap: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                                                        {ticket.name} {ticket?.tier_name ? ` - ${ticket.tier_name}` : ''}</TableCell>
                                                    <TableCell>{ticket.sold_quantity || 0} / {ticket.total_quantity}</TableCell>
                                                    <TableCell>{formatCurrency(ticket.price, ticket.currency.currency)}</TableCell>
                                                    <TableCell>{dayjs(ticket.sale_start_time).format("HH:mm DD/MM/YYYY")}</TableCell>
                                                    <TableCell>{dayjs(ticket.sale_end_time).format("HH:mm DD/MM/YYYY")}</TableCell>
                                                </TableRow>
                                            ))
                                            :
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <div className="organizer-report__chart-fallback">
                                                        <Alert severity="info">
                                                            {t('eventDashboard.noTicketTypes')}
                                                        </Alert>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Typography variant="h6" mb={1}>
                                {t('eventDashboard.recentOrders')}
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('eventDashboard.orderNumber')}</TableCell>
                                            <TableCell>{t('eventDashboard.ticketType')}</TableCell>
                                            <TableCell>{t('eventDashboard.totalPrice')}</TableCell>
                                            <TableCell>{t('eventDashboard.status')}</TableCell>
                                            <TableCell>{t('eventDashboard.date')}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stats?.recentOrders.length > 0 ?
                                            stats.recentOrders.map((order, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{order.order_id}</TableCell>
                                                    <TableCell>
                                                        {order?.tickets.map((ticket, index) => (
                                                            <div key={index}>
                                                                {ticket.name} {ticket?.seat_tier_name ? `- ${ticket?.seat_tier_name}` : ''} x {ticket.quantity}
                                                            </div>
                                                        ))}
                                                    </TableCell>
                                                    <TableCell>{formatCurrency(order.amount / 100, order.currency)}</TableCell>
                                                    <TableCell style={{textTransform:'uppercase'}}>{t(`orderStatus.${order.status.toLowerCase()}`)}</TableCell>
                                                    <TableCell>{dayjs(order.created_at).format('DD MMM, YYYY')}</TableCell>
                                                </TableRow>
                                            ))
                                            :
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <div className="organizer-report__chart-fallback">
                                                        <Alert severity="info">
                                                            {t('eventDashboard.noOrders')}
                                                        </Alert>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Stack>
                    </Stack>
                    :
                    <EventAttendee eventID={eventID} />
                }
            </DialogContent>
        </Dialog>
    )
}

export default EventDashboard;