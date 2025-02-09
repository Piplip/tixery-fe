import {
    Checkbox,
    FormControlLabel,
    FormGroup,
    IconButton,
    OutlinedInput,
    Stack,
    Typography
} from "@mui/material";
import {getUserData} from "../../common/Utilities.js";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import GooglePayIcon from "../../assets/google-pay.png"
import StripeIcon from "../../assets/stripe.png"
import CreditCardIcon from "../../assets/credit-card.png"
import '../../styles/payment-checkout-styles.css'
import Logo from '../../assets/logo.svg'
import {useState} from "react";
import {accountAxiosWithToken, eventAxiosWithToken} from "../../config/axiosConfig.js";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";

PaymentCheckout.propTypes = {
    total: PropTypes.number,
    currency: PropTypes.string,
    eventName: PropTypes.string,
    eventID: PropTypes.string,
    tickets: PropTypes.array,
    quantities: PropTypes.object
}

function PaymentCheckout({total, currency, eventName, eventID, tickets, quantities}){
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('credit-card');

    const [preferences, setPreferences] = useState({
        organizer_pay_update: true,
        popular_events: false
    })

    function handlePreferencesChange(key){
        setPreferences(prevState => ({
            ...prevState,
            [key]: !prevState[key]
        }))
    }

    function handleStripePayment(){
        setIsLoading(true)
        accountAxiosWithToken.post(`/notification/preferences/update?pid=${getUserData('profileID')}&role=${getUserData('role')}`, preferences)
            .catch(error => console.log(error))
        eventAxiosWithToken.post('/payment/stripe/checkout', {
            amount: total*100,
            email: getUserData('sub'),
            currency: currency,
            quantity: 1,
            name: `Tickets for ${eventName} - Tixery Event - ${new Date().toLocaleDateString()}`,
            userID: getUserData('userID'),
            profileID: getUserData('profileID'),
            eventID: eventID,
            username: getUserData('fullName'),
            tickets: tickets.filter((ticket, originalIndex) => quantities[originalIndex] !== 0)
                .map((ticket) => ({
                    ticketTypeID: ticket.ticket_type_id,
                    quantity: quantities[tickets.indexOf(ticket)],
                    price: ticket.price * quantities[tickets.indexOf(ticket)]
                }))
        }).then(response => {
            if(response.data.status === 'success'){
                window.location.href = response.data.sessionURL
            }
            else{
                setIsLoading(false)
                alert(response.data.message)
            }
        }).catch(error => {
            console.log(error)
        })
    }

    return (
        <Stack flexGrow={1} sx={{minWidth: '25rem', paddingInline: '2rem 3rem' ,flexGrow: 1}}>
            <Stack textAlign={'center'} borderBottom={'1px solid'} paddingBottom={1} rowGap={1}>
                <Typography variant={'h6'} fontWeight={'bold'}>Checkout</Typography>
            </Stack>
            <Stack rowGap={3} paddingInline={10} paddingBlock={2} style={{overflowY: 'auto'}}>
                <Stack rowGap={1}>
                    <Typography fontSize={'1.6rem'} fontWeight={'bold'}>Billing Information</Typography>
                    <Typography variant={'body1'}>Logged in as {getUserData('sub')}. <span className={'link'}>Switch profile?</span></Typography>
                    <Stack>
                        <OutlinedInput fullWidth disabled label={'Email Address'}
                                       value={getUserData('sub')}
                                       endAdornment={
                                           <IconButton>
                                               <EditOutlinedIcon />
                                           </IconButton>
                                       }
                        />
                    </Stack>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox value={preferences.organizer_pay_update} onChange={() => handlePreferencesChange('organizer_pay_update')}/>}
                                          label="Keep me updated on more events and news from this event organizer." />
                        <FormControlLabel control={<Checkbox value={preferences.popular_events} onChange={() => handlePreferencesChange('popular_events')}/>}
                                          label="Send me emails about the best events happening nearby or online." />
                    </FormGroup>
                </Stack>

                <Stack rowGap={2.5}>
                    <Typography fontSize={'1.6rem'} fontWeight={'bold'}>Pay with</Typography>
                    <Stack rowGap={1.5}>
                        <Stack direction={'row'} columnGap={2} alignItems={'center'} className={'payment-method'}
                            onClick={() => setSelectedMethod('credit-card')}
                        >
                            <img src={CreditCardIcon} alt={'credit-card'}/>
                            <Typography fontWeight={'bold'} fontSize={'1.1rem'}>Credit or debit card</Typography>
                        </Stack>
                        <Stack direction={'row'} columnGap={2} alignItems={'center'} className={'payment-method'}
                            onClick={() => setSelectedMethod('stripe')}
                        >
                            <img src={StripeIcon} alt={'stripe'} />
                            <Typography fontWeight={'bold'} fontSize={'1.1rem'}>Stripe</Typography>
                        </Stack>
                        <Stack direction={'row'} columnGap={2} alignItems={'center'} className={'payment-method'}>
                            <img src={GooglePayIcon} alt={'google pay'}/>
                            <Typography fontWeight={'bold'} fontSize={'1.1rem'}>Google Pay</Typography>
                        </Stack>
                    </Stack>
                    <Stack rowGap={.25}>
                        <Typography fontSize={'.9rem'}>By selecting {selectedMethod === 'stripe' ? 'Stripe' : 'Place Order'},
                            I agree to the <Link to={'/terms-of-service'} className={'link'} target={'_blank'}>Tixery Terms of Service</Link></Typography>
                        {selectedMethod === 'stripe' ?
                            <button className={`pay-btn stripe-pay-btn ${isLoading ? 'stripe-pay-btn-loading' : ''}`} onClick={handleStripePayment}>
                                {isLoading ? 'Processing...' : 'Stripe'}
                            </button>
                            :
                            selectedMethod === 'credit-card' ?
                                <button className={'pay-btn'}>Place Order</button>
                                :
                                <button className={'pay-btn google-pay-btn'}>Google Pay</button>
                        }
                    </Stack>
                </Stack>
            </Stack>
            <Stack fontSize={'.9rem'} color={'gray'} borderTop={'1px solid'} paddingTop={1} paddingInline={10} direction={'row'} alignItems={'center'} columnGap={.5}>
                Powered by <img width={'50px'} src={Logo} alt={'logo'} style={{transform: 'translateY(.15rem)'}}/>
            </Stack>
        </Stack>
    )
}

export default PaymentCheckout;