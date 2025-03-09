import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    InputAdornment,
    LinearProgress,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {useState} from "react";
import {Divider, Modal, ModalDialog, Slider} from "@mui/joy";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import PaymentCheckout from "../attendee/PaymentCheckout.jsx";
import {useTranslation} from "react-i18next";
import {checkLoggedIn, collectData, getUserData} from "../../common/Utilities.js";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {useNavigate} from "react-router-dom";

TicketPanel.propTypes = {
    tickets: PropTypes.array,
    eventEndTime: PropTypes.string,
    image: PropTypes.string,
    eventName: PropTypes.string,
    eventStartTime: PropTypes.string,
    isLoggedIn: PropTypes.bool
}

function TicketPanel({tickets, eventEndTime, image, eventName, eventStartTime, isLoggedIn}){
    const [totalPrice, setTotalPrice] = useState(0)
    const [step, setStep] = useState(1)
    const [expandedTickets, setExpandedTickets] = useState({});
    const [coupon, setCoupon] = useState('');
    const [prices, setPrices] = useState(
        tickets && tickets?.map((ticket) => ticket.price || 0) || []
    );
    const [totalDonationPrice, setTotalDonationPrice] = useState(0)
    const [quantities, setQuantities] = useState(tickets && tickets.reduce((acc, _, index) => ({ ...acc, [index]: 0 }), {}) || {});
    const [open, setOpen] = useState(false);
    const [loginDialogOpen, setLoginDialogOpen] = useState(false);
    const {t} = useTranslation()
    const [isLoading, setIsLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState({});
    const navigate = useNavigate()

    const toggleTicketInfo = (index) => {
        setExpandedTickets((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const isSaleEndingSoon = (saleEndTime) => {
        const now = dayjs();
        const diffInHours = dayjs(saleEndTime).diff(now, "hour");
        return diffInHours <= 24;
    };

    const handleQuantityChange = (index, operation) => {
        setQuantities((prevState) => {
            let newPrice;
            let newQuantity = prevState[index];
            const prevValue = newQuantity

            if (operation === "add") {
                newQuantity = newQuantity === 0 ? tickets[index].min_per_order : newQuantity + 1;
            } else if (operation === "subtract") {
                newQuantity = newQuantity === tickets[index].min_per_order ? 0 : newQuantity - 1;
            }

            newQuantity = Math.max(0, Math.min(newQuantity, tickets[index].max_per_order));

            if (tickets[index].ticket_type === 'paid' || tickets[index].ticket_type === 'donation') {
                if (operation === "add") {
                    newPrice = totalPrice + Math.abs(newQuantity - prevValue) * prices[index];
                } else if (operation === "subtract") {
                    newPrice = totalPrice - Math.abs(newQuantity - prevValue) * prices[index];
                }
                setTotalPrice(Math.round(newPrice * 100) / 100);
            }

            return { ...prevState, [index]: newQuantity };
        });
    };

    const renderQuantityControl = (quantity, index) => {
        return (
            <Stack
                className={'event-view__quantity-controls'}
                direction={'row'}
                alignItems={'center'}
                columnGap={1.5}>
                <div
                    className={`event-view__quantity-button ${
                        quantity === 0 ? "disabled" : ""
                    }`}
                    onClick={() => quantity > 0 &&  handleQuantityChange(index, "subtract")}
                >
                    -
                </div>
                <div className={"event-view__quantity-value"}>{quantity}</div>
                <div
                    className={`event-view__quantity-button ${
                        quantity >= tickets[index].max_per_order ? "disabled" : ""
                    }`}
                    onClick={() => quantity < tickets[index].max_per_order && handleQuantityChange(index, "add")}
                >
                    +
                </div>
            </Stack>
        )
    }

    const renderTickets = () => {
        if(!tickets) return
        if (dayjs(eventEndTime).isBefore(dayjs())) {
            return (
                <Stack rowGap={2} className={'event-view__registration-wrapper'}>
                    <Typography variant={'h6'} textAlign={'center'}>{t('ticketPanel.eventEnded')}</Typography>
                    <button className={'view-more-btn'} onClick={() => navigate(`/events/search`)}>
                        {t('ticketPanel.viewMoreEvents')}
                    </button>
                </Stack>
            );
        }

        if (tickets.length === 0) {
            return (
                <div className={'event-view__registration-wrapper'}>
                    <Typography variant={'h6'} textAlign={'center'}>{t('ticketPanel.noTicketsAvailable')}</Typography>
                </div>
            );
        }

        return (
            <Stack rowGap={2} className={'event-view__registration-wrapper'}>
                {tickets.map((ticket, index) => {
                    const isExpanded = expandedTickets[index];
                    const quantity = quantities[index];
                    const saleEndingSoon = isSaleEndingSoon(ticket.sale_end_time);

                    return (
                        <Stack key={index} className={'event-view__registration-details'} rowGap={4}>
                            <p className={'event-view__registration-text'}>
                                {ticket.name}
                            </p>
                            <Stack
                                className={'event-view__registration-controls'}
                                direction={'row'}
                                justifyContent={'space-between'}>
                                <div className={'event-view__registration-price'}>
                                    {ticket.ticket_type === 'paid' ? `${ticket.currency.symbol !== "null" ? ticket.currency.symbol : ''}${ticket.price}` : ticket.ticket_type}
                                    <Tooltip title={t('ticketPanel.showMoreDetails')}>
                                        <InfoOutlinedIcon
                                            onClick={() => toggleTicketInfo(index)}
                                            style={{ cursor: "pointer", marginLeft: 1 }}
                                        />
                                    </Tooltip>
                                </div>
                                {renderQuantityControl(quantity, index)}
                            </Stack>
                            {saleEndingSoon &&
                                <div className={'event-view__sale-ending'}>
                                    <ErrorOutlineOutlinedIcon /> {t('ticketPanel.saleEndingSoon')}
                                </div>
                            }
                            {isExpanded && (
                                <Stack rowGap={1}>
                                    <Typography variant={"body2"} alignSelf={"end"}>
                                        {t('ticketPanel.salesEndOn')}
                                        {dayjs(ticket.sale_end_time).format(
                                            "HH:mm, DD MMMM YYYY"
                                        )}
                                    </Typography>
                                    <Typography variant={"body2"}>{ticket.description}</Typography>
                                </Stack>
                            )}
                        </Stack>
                    );
                })}
                <button className={'event-view__registration-button'} onClick={() => {
                    if(!checkLoggedIn()) {
                        setLoginDialogOpen(true)
                    }
                    else {
                        collectData(tickets[0].event_id, 'view-tickets', null, tickets[0].organizer_id)
                        setOpen(true)
                    }
                }}>
                    {t('ticketPanel.checkout')} {totalPrice > 0 ? `- $${Math.round((totalPrice + totalDonationPrice) * 100) / 100}` : ''}
                </button>
            </Stack>
        );
    };

    function handleFreeCheckout(){
        setIsLoading(true)
        eventAxiosWithToken.post('/payment/free/checkout', {
                amount: totalPrice * 100,
                email: getUserData('sub'),
                currency: tickets[0]?.currency?.currency,
                quantity: 1,
                userID: getUserData('userID'),
                profileID: getUserData('profileID'),
                eventID: tickets[0]?.event_id,
                username: getUserData('fullName'),
                tickets: tickets.filter((ticket, originalIndex) => quantities[originalIndex] !== 0)
                    .map((ticket) => ({
                        ticketTypeID: ticket.ticket_type_id,
                        quantity: quantities[tickets.indexOf(ticket)],
                        price: ticket.price * quantities[tickets.indexOf(ticket)]
                    }))
            }
        ).catch(error => {
            setIsLoading(false)
            alert(t('paymentCheckout.paymentError'));
        })
    }

    function handleCheckout(){
        if (!isLoggedIn) {
            setLoginDialogOpen(true)
            return;
        }
        if(Object.values(quantities).reduce((acc, quantity) => acc + quantity, 0) === 0){
            alert(t('eventRegistration.selectAtLeastOneTicket'));
            return;
        }
        collectData(tickets[0].event_id, 'check-out', null, tickets[0].organizer_id)
        if(totalPrice === 0){
            handleFreeCheckout()
            setOpen(false)
            collectData(tickets[0].event_id, 'purchased', 0, tickets[0].organizer_id)
            alert(t('eventRegistration.freeCheckoutSuccess'));
            return;
        }
        setStep(2)
    }

    function handleCoupon(){
        eventAxiosWithToken.post(`/coupon/use?coupon=${coupon}&pid=${getUserData('profileID')}`)
            .then(r => {
                console.log(r.data)
                if(r.data.status === 'OK'){
                    setAppliedCoupon(r.data.data)
                }
                else {
                    alert(t(`response-code.${r.data.message}`))
                }
            })
            .catch(err => console.log(err))
    }

    return (
        <Stack className={'event-view__registration'} rowGap={2}>
            <Modal open={open} onClose={() => setOpen(false)} sx={{ zIndex: 100000000 }}>
                <ModalDialog size={"md"} sx={{ minWidth: '90%', height: '95dvh' }}>
                    {isLoading && <LinearProgress  sx={{height: ',5rem'}}/>}
                    <IconButton sx={{ width: 'fit-content', marginLeft: 2, position: 'absolute' }}
                                onClick={() => {
                                    if (step === 2) {
                                        setStep(1);
                                    }
                                    else setOpen(false);
                                }}
                    >
                        <KeyboardBackspaceIcon />
                    </IconButton>
                    <Stack direction={'row'} height={'100%'}>
                        {step === 1 ?
                            <Stack rowGap={3} sx={{ minWidth: '25rem', paddingInline: '2rem 3rem', flexGrow: 1 }}>
                                <Stack textAlign={'center'} borderBottom={'1px solid'} paddingBottom={2}>
                                    <Typography variant={'h5'}>{eventName}</Typography>
                                    <Typography variant={'caption'}>{t('eventRegistration.startsOn')} {dayjs(eventStartTime).format("ddd, DD MMM YYYY HH:mm [GMT]Z")}</Typography>
                                </Stack>
                                <Stack rowGap={2} flexGrow={1} overflow={'auto'} paddingBlock={1}>
                                    <TextField value={coupon} onChange={(e) => {
                                        setCoupon(e.target.value)
                                        setAppliedCoupon({})
                                    }}
                                        placeholder={t('eventRegistration.enterCode')}
                                        fullWidth
                                        variant={'outlined'}
                                        label={t('eventRegistration.promoCode')}
                                        focused
                                        InputProps={{
                                            endAdornment: <Button sx={{width: '6.5rem'}}
                                                onClick={handleCoupon}
                                            >{t('eventRegistration.apply')}</Button>
                                        }}
                                    />
                                    {tickets && tickets.map((ticket, index) => {
                                        const quantity = quantities[index];
                                        return (
                                            <Stack key={index} style={{ border: '2px solid blue', borderRadius: 5, padding: '.75rem' }}>
                                                <Stack direction={'row'} justifyContent={'space-between'} paddingBottom={2}>
                                                    <Typography variant={'h6'} style={{ maxWidth: '70%', wordWrap: 'break-word' }}>{ticket.name}</Typography>
                                                    {renderQuantityControl(quantity, index)}
                                                </Stack>
                                                <Divider />
                                                {quantity !== 0 && ticket.ticket_type === 'donation' && (
                                                    <>
                                                        <Stack direction={'row'} width={'80%'} paddingBlock={2} columnGap={2} alignItems={'center'} alignSelf={'center'}>
                                                            <TextField
                                                                fullWidth
                                                                variant={'outlined'}
                                                                label={t('eventRegistration.donationAmount')}
                                                                autoFocus
                                                                size={"small"}
                                                                value={prices[index]}
                                                                onChange={(e) => {
                                                                    const newPrices = [...prices];
                                                                    const value = parseFloat(e.target.value);
                                                                    newPrices[index] = isNaN(value) ? 0 : value;
                                                                    setTotalDonationPrice(newPrices.reduce((total, price, idx) => total + (price * quantities[idx]), 0));
                                                                }}
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <InputAdornment position={'start'}>
                                                                            $
                                                                        </InputAdornment>
                                                                    )
                                                                }}
                                                            />
                                                            <Slider
                                                                disabled={prices[index] > 1000}
                                                                onChange={(e, value) => {
                                                                    const newPrices = [...prices];
                                                                    newPrices[index] = value;
                                                                    setPrices(newPrices);
                                                                    setTotalDonationPrice(Math.round(value * quantities[index] * 100) / 100);
                                                                }}
                                                                marks
                                                                step={25}
                                                                value={prices[index]}
                                                                valueLabelDisplay="auto"
                                                                min={0}
                                                                max={1000}
                                                            />
                                                        </Stack>
                                                        <Divider />
                                                    </>
                                                )}
                                                <Stack paddingBlock={1}>
                                                    <Typography variant={'h6'} sx={{ textTransform: 'capitalize' }}>
                                                        {ticket.ticket_type === 'paid' ? `${ticket.currency.symbol !== "null" ? ticket.currency.symbol : ''}${ticket.price}` : ticket.ticket_type}
                                                    </Typography>
                                                    <Typography variant={'body2'}>{t('eventRegistration.salesEndAt')} {dayjs(ticket.sale_end_time).format("HH:mm DD MMM YYYY")}</Typography>
                                                </Stack>
                                            </Stack>
                                        )
                                    })}
                                </Stack>
                                <Stack borderTop={'1px solid'} paddingTop={2} alignItems={'flex-end'} onClick={handleCheckout}>
                                    <button className={'event-view__registration-button'} style={{ width: 'fit-content' }}>{t('eventRegistration.checkout')}</button>
                                </Stack>
                            </Stack>
                            :
                            <PaymentCheckout
                                total={totalPrice - (appliedCoupon?.amount ? totalPrice * appliedCoupon.amount / 100 : 0)}
                                currency={tickets[0]?.currency?.currency}
                                eventName={eventName}
                                eventID={tickets[0]?.event_id}
                                tickets={tickets}
                                quantities={quantities}
                            />
                        }
                        <Stack rowGap={2} className={'order-summary'}>
                            <Stack style={{ width: '25rem', height: '10rem', backgroundColor: '#e5e5e5' }} justifyContent={'center'} alignItems={'center'}>
                                <img src={image} alt={eventName} height={'100%'} />
                            </Stack>
                            <Stack paddingInline={2}>
                                <b>{t('eventRegistration.orderSummary')}</b>
                                <Stack paddingBlock={1} rowGap={1}>
                                    {tickets && tickets.map((ticket, index) => {
                                        const quantity = quantities[index];
                                        if (quantity > 0) {
                                            return (
                                                <Stack key={index} direction={'row'} justifyContent={'space-between'} className={'billed-item'}>
                                                    <Typography style={{ maxWidth: '70%', wordWrap: 'break-word' }} variant={'body2'}>{ticket.name} x{quantity}</Typography>
                                                    <Typography variant={'body2'}>{ticket.currency.symbol !== "null" ? ticket.currency.symbol : ''}{Math.round(quantity * prices[index] * 100) / 100}</Typography>
                                                </Stack>
                                            )
                                        }
                                    })}
                                </Stack>
                                <Stack borderTop={'1px solid'} paddingTop={.5}>
                                    <Stack direction={'row'} justifyContent={'space-between'}>
                                        <Typography variant={'body1'} fontWeight={'bold'}>
                                            {appliedCoupon?.amount ? t('eventRegistration.totalTicketPrice') : t('eventRegistration.total')}
                                        </Typography>
                                        <Typography variant={'body1'} fontWeight={'bold'}>{tickets && tickets[0]?.currency.symbol}{Math.round((totalPrice + totalDonationPrice) * 100) / 100}</Typography>
                                    </Stack>
                                    {appliedCoupon?.amount &&
                                        <>
                                            <Stack direction={'row'} justifyContent={'space-between'}>
                                                <Typography variant={'body1'} fontWeight={'bold'}>{t('eventRegistration.discount')}</Typography>
                                                <Typography variant={'body1'} fontWeight={'bold'} sx={{color: '#13ee00'}}>
                                                    {appliedCoupon.type === 'percentage' ?
                                                    `${appliedCoupon.amount}%` : `${tickets && tickets[0]?.currency.symbol}${appliedCoupon.amount}`} = {tickets && tickets[0]?.currency.symbol}
                                                    {Math.round((totalPrice + totalDonationPrice) * appliedCoupon.amount / 100 * 100) / 100}
                                                </Typography>
                                            </Stack>
                                            <hr style={{marginBlock: 5}}/>
                                            <Stack direction={'row'} justifyContent={'space-between'}>
                                                <Typography variant={'body1'} fontWeight={'bold'}>{t('eventRegistration.total')}</Typography>
                                                <Typography variant={'body1'} fontWeight={'bold'}>
                                                    {tickets && tickets[0]?.currency.symbol}
                                                    {Math.round((totalPrice + totalDonationPrice) * (1 - appliedCoupon.amount / 100) * 100) / 100}
                                                </Typography>
                                            </Stack>
                                        </>
                                    }
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </ModalDialog>
            </Modal>
            <Dialog
                open={loginDialogOpen}
                onClose={() => setLoginDialogOpen(false)}
            >
                <DialogTitle id="alert-dialog-title">{t('loginDialog.title')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {t('loginDialog.description')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLoginDialogOpen(false)} color="primary">
                        {t('loginDialog.cancel')}
                    </Button>
                    <Button onClick={() => window.location.href = '/login'} color="primary" autoFocus variant={'contained'}>
                        {t('loginDialog.login')}
                    </Button>
                </DialogActions>
            </Dialog>
            {renderTickets()}
        </Stack>
    );
}

export default TicketPanel;