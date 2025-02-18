import PropTypes from "prop-types";
import {
    Box, Button,
    Card,
    CardContent,
    Dialog, DialogActions, DialogContent,
    Link,
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

OrderCardDetail.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
}

const orderData = {
    orderId: '123456',
    status: 'Confirmed',
    statusColor: 'green',
    orderDateTime: '2025-02-18 14:30',
    totalAmount: '$120.00',
    event: {
        name: 'Concert of the Year',
        dateTime: '2025-03-01 20:00',
        venue: 'Madison Square Garden',
        link: '#'
    },
    tickets: [
        { type: 'VIP', quantity: 2, price: '$50', subtotal: '$100' },
        { type: 'General', quantity: 1, price: '$20', subtotal: '$20' }
    ],
    customer: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '555-1234'
    },
    paymentMethod: 'Credit Card',
    deliveryMethod: 'Email',
    specialInstructions: 'Please send tickets via email.',
    ticketDetails: [
        { id: 'ticket1', qrCode: 'QR_CODE_1', number: 'A1' },
        { id: 'ticket2', qrCode: 'QR_CODE_2', number: 'A2' },
        { id: 'ticket3', qrCode: 'QR_CODE_3', number: 'B1' }
    ]
};


function OrderCardDetail({open, handleClose, data}){
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            sx={{ zIndex: 10000000}}
        >
            <DialogContent dividers={true}>
                <Stack p={1} className="order-details">
                    <Card className="order-details__card order-details__header">
                        <CardContent className="order-details__header-content">
                            <Grid container alignItems="center" justifyContent={'space-between'} alignContent={'center'}>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant={'h6'} className="order-details__header-title">
                                        Order ID: <b>#{data.order.order_id}</b>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="h6">
                                        Status:{' '}
                                        <span
                                            style={{
                                                color: orderData.statusColor,
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                    {data.order.status}
                                  </span>
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="h6">
                                        Date: {dayjs(data.order.created_at).format('HH:mm DD/MM/YYYY')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <Typography variant="h6">
                                        Total:{' '}
                                        {data.order.amount &&
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
                                <Link href={orderData.event.link} underline="hover">
                                    {data.order.name}
                                </Link>
                            </Typography>
                            <Typography variant="body2">
                                Date: {dayjs(data.order.start_time).format('HH:mm DD/MM/YYYY')}
                            </Typography>
                            <Typography variant="body2">
                                {data.order?.location?.locationType === 'venue'
                                    ? `${data.order.location.name}, ${data.order.location.location}`
                                    : `Online event`}
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card className="order-details__card order-details__tickets">
                        <CardContent className="order-details__tickets-content">
                            <Typography variant="h6" gutterBottom>
                                Tickets
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
                                        <Typography variant="body2">Ticket ID: {ticket.ticket_id}</Typography>
                                        <Typography variant="body2" sx={{ wordWrap: 'break-word' }}>
                                            Ticket Name: {ticket.name}
                                        </Typography>
                                        <Typography variant="body2">Quantity: {ticket.quantity}</Typography>
                                        <Typography variant="body2">Price: {ticket.price}</Typography>
                                        <Typography variant="body2">Subtotal: {ticket.subtotal}</Typography>
                                    </Box>
                                ))
                            ) : (
                                <TableContainer component={Paper} className="order-details__table-container">
                                    <Table
                                        size="small"
                                        className="order-details__ticket-table"
                                        /* Key for truncation: fixed table layout */
                                        style={{ tableLayout: 'fixed', width: '100%' }}
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell className="order-details__table-header">Ticket ID</TableCell>
                                                <TableCell className="order-details__ticket-name order-details__table-header">
                                                    Ticket Name
                                                </TableCell>
                                                <TableCell className="order-details__table-header">Quantity</TableCell>
                                                <TableCell className="order-details__table-header">Price</TableCell>
                                                <TableCell className="order-details__table-header">Subtotal</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.order?.tickets?.map((ticket, index) => (
                                                <TableRow key={index} className="order-details__table-row">
                                                    <TableCell>{ticket.ticket_id}</TableCell>
                                                    <TableCell className="order-details__ticket-name">
                                                        {ticket.name}
                                                    </TableCell>
                                                    <TableCell>{ticket.quantity}</TableCell>
                                                    <TableCell>
                                                        {ticket?.price &&
                                                            ticket?.currency &&
                                                            formatCurrency(ticket.price, ticket.currency.currency)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {ticket?.price &&
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
                                Customer Information
                            </Typography>
                            <Typography variant="body1">Name: {data.info.profile_name}</Typography>
                            <Typography variant="body1">Email: {data.info.account_email}</Typography>
                            {orderData.customer.phone && (
                                <Typography variant="body1">Phone: {data.info.phone_number}</Typography>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="order-details__card order-details__payment-delivery">
                        <CardContent className="order-details__payment-delivery-content">
                            <Typography variant="h6" gutterBottom>
                                Payment & Delivery
                            </Typography>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                Payment Method: {data.order.payment_method}
                            </Typography>
                            <Typography variant="body1">Delivery Method: e-Ticket</Typography>
                        </CardContent>
                    </Card>
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} variant={'contained'} color={'primary'}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default OrderCardDetail