import PropTypes from "prop-types";
import {
    Button, IconButton, InputAdornment,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {useState} from "react";
import {Divider, Modal, ModalDialog, Slider} from "@mui/joy";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import PaymentCheckout from "../attendee/PaymentCheckout.jsx";

TicketPanel.propTypes = {
    tickets: PropTypes.array.isRequired,
    eventEndTime: PropTypes.string.isRequired,
    image: PropTypes.string,
    eventName: PropTypes.string,
    eventStartTime: PropTypes.string
}

function TicketPanel({tickets, eventEndTime, image, eventName, eventStartTime}){
    const [totalPrice, setTotalPrice] = useState(0)
    const [step, setStep] = useState(1)
    const [expandedTickets, setExpandedTickets] = useState({});
    const [prices, setPrices] = useState(
        tickets.map((ticket) => ticket.price || 0)
    );
    const [totalDonationPrice, setTotalDonationPrice] = useState(0)
    const [quantities, setQuantities] = useState(tickets.reduce((acc, _, index) => ({ ...acc, [index]: 0 }), {}));
    const [open, setOpen] = useState(false);

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
        if (dayjs(eventEndTime).isBefore(dayjs())) {
            return (
                <Stack rowGap={2}>
                    <Typography variant={'h6'} textAlign={'center'}>This event has ended</Typography>
                    <button className={'view-more-btn'}>
                        View more events
                    </button>
                </Stack>
            );
        }

        if (tickets.length === 0) {
            return (
                <div>
                    <Typography variant={'h6'} textAlign={'center'}>No tickets available now</Typography>
                </div>
            );
        }

        return (
            <>
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
                                    <Tooltip title="Show more details">
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
                                    <ErrorOutlineOutlinedIcon /> Sale ending soon
                                </div>
                            }
                            {isExpanded && (
                                <Stack rowGap={1}>
                                    <Typography variant={"body2"} alignSelf={"end"}>
                                        Sales end on{" "}
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
                <button className={'event-view__registration-button'} onClick={() => setOpen(true)}>
                    Checkout {totalPrice > 0 ? `- $${Math.round((totalPrice + totalDonationPrice) * 100) / 100}` : ''}
                </button>
            </>
        );
    };

    function handleCheckout(){
        if(Object.values(quantities).reduce((acc, quantity) => acc + quantity, 0) === 0){
            alert('Please select at least one ticket before continuing');
            return;
        }
        setStep(2)
    }

    return (
        <Stack className={'event-view__registration'} rowGap={2}>
            <Modal open={open} onClose={() => setOpen(false)} sx={{zIndex: 100000000}}>
                <ModalDialog size={"md"} sx={{minWidth: '80%', height: '95dvh'}}>
                    <IconButton sx={{width: 'fit-content', marginLeft: 2, position: 'absolute'}}
                        onClick={() => {
                            if(step === 2){
                                setStep(1);
                            }
                            else setOpen(false)
                        }}
                    >
                        <KeyboardBackspaceIcon />
                    </IconButton>
                    <Stack direction={'row'} height={'100%'}>
                        {step === 1 ?
                            <Stack rowGap={3} sx={{minWidth: '25rem', paddingInline: '2rem 3rem' ,flexGrow: 1}}>
                                <Stack textAlign={'center'} borderBottom={'1px solid'} paddingBottom={2}>
                                    <Typography variant={'h5'}>{eventName}</Typography>
                                    <Typography variant={'caption'}>Starts on {dayjs(eventStartTime).format("ddd, DD MMM YYYY HH:mm [GMT]Z")}</Typography>
                                </Stack>
                                <Stack rowGap={2} flexGrow={1} overflow={'auto'} paddingBlock={1}>
                                    <TextField placeholder={'Enter code'} fullWidth variant={'outlined'}
                                               label="Promo code" focused
                                               slotProps={
                                                   {input: {
                                                           endAdornment: <Button>Apply</Button>
                                                       }}
                                               }
                                    />
                                    {tickets.map((ticket, index) => {
                                        const quantity = quantities[index];
                                        return (
                                            <Stack key={index} style={{border: '2px solid blue', borderRadius: 5, padding: '.75rem'}}>
                                                <Stack direction={'row'} justifyContent={'space-between'} paddingBottom={2}>
                                                    <Typography variant={'h6'} style={{maxWidth: '70%'}}>{ticket.name}</Typography>
                                                    {renderQuantityControl(quantity, index)}
                                                </Stack>
                                                <Divider />
                                                {quantity !== 0 && ticket.ticket_type === 'donation' && (
                                                    <>
                                                        <Stack direction={'row'} width={'80%'} paddingBlock={2} columnGap={2} alignItems={'center'} alignSelf={'center'}>
                                                            <TextField fullWidth variant={'outlined'} label={'Donation amount'} autoFocus size={"small"}
                                                                       value={prices[index]}
                                                                       onChange={(e) => {
                                                                           const newPrices = [...prices];
                                                                           const value = parseFloat(e.target.value);
                                                                           newPrices[index] = isNaN(value) ? 0 : value;
                                                                           setPrices(newPrices);
                                                                           setTotalDonationPrice(newPrices.reduce((total, price, idx) => total + (price * quantities[idx]), 0));
                                                                       }}
                                                                       slotProps={{input:
                                                                               {startAdornment:
                                                                                       <InputAdornment position={'start'}>
                                                                                           $
                                                                                       </InputAdornment>
                                                                               }
                                                                       }}
                                                            />
                                                            <Slider disabled={prices[index] > 1000}
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
                                                    <Typography variant={'h6'} sx={{textTransform: 'capitalize'}}>
                                                        {ticket.ticket_type === 'paid' ? `${ticket.currency.symbol !== "null" ? ticket.currency.symbol : ''}${ticket.price}` : ticket.ticket_type}</Typography>
                                                    <Typography variant={'body2'}>Sales end at {dayjs(ticket.sale_end_time).format("HH:mm DD MMM YYYY")}</Typography>
                                                </Stack>
                                            </Stack>
                                        )
                                    })}
                                </Stack>
                                <Stack borderTop={'1px solid'} paddingTop={2} alignItems={'flex-end'} onClick={handleCheckout}>
                                    <button className={'event-view__registration-button'} style={{width: 'fit-content'}}>Checkout</button>
                                </Stack>
                            </Stack>
                            :
                            <PaymentCheckout total={totalPrice} currency={tickets[0]?.currency?.currency} eventName={eventName}
                                eventID={tickets[0]?.event_id} tickets={tickets} quantities={quantities}
                            />
                        }
                        <Stack rowGap={2} className={'order-summary'}>
                            <Stack style={{width: '20rem', height: '10rem', backgroundColor: '#e5e5e5'}} justifyContent={'center'} alignItems={'center'}>
                                <img src={image} alt={eventName} height={'100%'}/>
                            </Stack>
                            <Stack paddingInline={2}>
                                <b>Order summary</b>
                                <Stack paddingBlock={1} rowGap={1}>
                                    {tickets.map((ticket, index) => {
                                        const quantity = quantities[index];
                                        if(quantity > 0){
                                            return (
                                                <Stack key={index} direction={'row'} justifyContent={'space-between'} className={'billed-item'}>
                                                    <Typography style={{maxWidth: '70%', wordWrap: 'break-word'}} variant={'body2'}>{ticket.name} x{quantity}</Typography>
                                                    <Typography variant={'body2'}>{ticket.currency.symbol !== "null" ? ticket.currency.symbol : ''}{Math.round(quantity * prices[index] * 100) / 100}</Typography>
                                                </Stack>
                                            )
                                        }
                                    })}
                                </Stack>
                                <Stack direction={'row'} justifyContent={'space-between'} borderTop={'2px solid'} paddingTop={.5}>
                                    <Typography variant={'h6'} fontWeight={'bold'}>Total</Typography>
                                    <Typography variant={'h6'} fontWeight={'bold'}>{tickets[0]?.currency.symbol}{Math.round((totalPrice + totalDonationPrice) * 100) / 100}</Typography>
                                </Stack>
                            </Stack>
                        </Stack>
                    </Stack>
                </ModalDialog>
            </Modal>
            {renderTickets()}
        </Stack>
    )
}

export default TicketPanel;