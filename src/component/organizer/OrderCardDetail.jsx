import PropTypes from "prop-types";
import {
    Box, Button,
    Card,
    CardContent,
    Dialog, DialogActions, DialogContent,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    useMediaQuery
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import Grid from "@mui/material/Grid2";
import dayjs from "dayjs";
import {formatCurrency} from "../../common/Utilities.js";
import "../../styles/organizer-order-card-detail-styles.css"
import {useTranslation} from "react-i18next";
import {Link} from "react-router-dom";

OrderCardDetail.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

function OrderCardDetail({open, handleClose, data}){
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const {t} = useTranslation()

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            sx={{ zIndex: 10000000 }}
        >
            <DialogContent dividers={true}>
                <Stack p={1} className="order-details">
                    <Card className="order-details__card order-details__header">
                        <CardContent className="order-details__header-content">
                            <Grid container alignItems="center" justifyContent={'space-between'} alignContent={'center'}>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant={'h6'} className="order-details__header-title">
                                        {t('orderCardDetail.orderID')}: <b>#{data.order.order_id}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="h6">
                                        {t('orderCardDetail.status')}:{' '}
                                        <span
                                            style={{
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {t(`orderCardDetail.order-status.${data.order.status.toLowerCase()}`)}
                                        </span>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="h6">
                                        {t('orderCardDetail.date')}: {dayjs(data.order.created_at).format('HH:mm DD/MM/YYYY')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="h6">
                                        {t('orderCardDetail.total')}:{' '}
                                        {
                                            data.order?.amount === null ? t('free') :
                                            data.order.currency &&
                                            formatCurrency(data.order.amount / 100, data.order.currency)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    <Card className="order-details__card order-details__event">
                        <CardContent className="order-details__event-content">
                            <Typography variant="h6" gutterBottom>
                                <Link to={`/events/${data.order.event_id}`} target={'_blank'} className={'link'}>
                                    {data.order.name}
                                </Link>
                            </Typography>
                            <Typography variant="body2">
                                {t('orderCardDetail.eventDate')}: {dayjs(data.order.start_time).format('HH:mm DD/MM/YYYY')}
                            </Typography>
                            <Typography variant="body2">
                                {data.order?.location?.locationType === 'venue'
                                    ? `${data.order.location.name}, ${data.order.location.location}`
                                    : t('orderCardDetail.onlineEvent')}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card className="order-details__card order-details__tickets">
                        <CardContent className="order-details__tickets-content">
                            <Typography variant="h6" gutterBottom>
                                {t('orderCardDetail.tickets')}
                            </Typography>
                            {isMobile ? (
                                data.order.tickets.map((ticket, index) => (
                                    <Box
                                        key={index}
                                        mb={1}
                                        p={1}
                                        border={1}
                                        borderColor="grey.300"
                                        borderRadius={1}
                                        className="order-details__ticket-item"
                                    >
                                        <Typography variant="body2">{t('orderCardDetail.ticketID')}: {ticket.ticket_id}</Typography>
                                        <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                                            {t('orderCardDetail.ticketName')}: {ticket.name}
                                        </Typography>
                                        <Typography variant="body2">{t('orderCardDetail.quantity')}: {ticket.quantity}</Typography>
                                        <Typography variant="body2">{t('orderCardDetail.price')}:{ticket?.price === 0 ? t('free') : ticket?.currency &&
                                            formatCurrency(ticket?.price, ticket.currency)}
                                        </Typography>
                                        <Typography variant="body2">{t('orderCardDetail.subtotal')}: {ticket?.price === 0 ? ticket.price : ticket?.currency
                                            && formatCurrency(ticket.price * ticket.quantity, ticket.currency.currency)}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <TableContainer component={Paper} className="order-details__table-container">
                                    <Table
                                        size="small"
                                        className="order-details__ticket-table"
                                        style={{ tableLayout: 'fixed', width: '100%' }}
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="order-details__table-header">{t('orderCardDetail.ticketID')}</TableCell>
                                                <TableCell className="order-details__ticket-name order-details__table-header">
                                                    {t('orderCardDetail.ticketName')}
                                                </TableCell>
                                                <TableCell className="order-details__table-header">{t('orderCardDetail.quantity')}</TableCell>
                                                <TableCell className="order-details__table-header">{t('orderCardDetail.price')}</TableCell>
                                                <TableCell className="order-details__table-header">{t('orderCardDetail.subtotal')}</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.order?.tickets?.map((ticket, index) => (
                                                <TableRow key={index} className="order-details__table-row">
                                                    <TableCell>{ticket.ticket_id}</TableCell>
                                                    <TableCell className="order-details__ticket-name">
                                                        {ticket.name} {ticket?.seat_tier_name ? ` - ${ticket?.seat_tier_name} ` : ''}
                                                    </TableCell>
                                                    <TableCell>{ticket.quantity}</TableCell>
                                                    <TableCell>
                                                        {ticket.price === 0 ? t('free') :
                                                            ticket?.currency &&
                                                            formatCurrency(ticket.price, ticket.currency.currency)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {ticket?.price === 0 ? ticket.price :
                                                            ticket?.currency &&
                                                            formatCurrency(
                                                                ticket.price * ticket.quantity,
                                                                ticket.currency.currency
                                                            )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="order-details__card order-details__customer">
                        <CardContent className="order-details__customer-content">
                            <Typography variant="h6" gutterBottom>
                                {t('orderCardDetail.customerInformation')}
                            </Typography>
                            <Typography variant="body1">{t('orderCardDetail.name')}: {data.info.profile_name}</Typography>
                            <Typography variant="body1">{t('orderCardDetail.email')}: {data.info.account_email}</Typography>
                            {data.info.phone_number && (
                                <Typography variant="body1">{t('orderCardDetail.phone')}: {data.info.phone_number}</Typography>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="order-details__card order-details__payment-delivery">
                        <CardContent className="order-details__payment-delivery-content">
                            <Typography variant="h6" gutterBottom>
                                {t('orderCardDetail.paymentDelivery')}
                            </Typography>
                            <Typography variant="body1">
                                {data.order.payment_method &&
                                    <>
                                        {t('orderCardDetail.paymentMethod')}: <span style={{textTransform: 'capitalize'}}>
                                        {t(`paymentCheckout.${data.order.payment_method}`)}</span>
                                    </>
                                }
                            </Typography>
                            <Typography variant="body1">{t('orderCardDetail.deliveryMethod')}: e-Ticket</Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant={'contained'} color={'primary'}>
                    {t('orderCardDetail.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default OrderCardDetail