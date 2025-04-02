import {
    Checkbox,
    FormControlLabel,
    FormGroup,
    IconButton,
    OutlinedInput,
    Stack,
    Typography
} from "@mui/material";
import {collectData, getUserData} from "../../common/Utilities.js";
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
import dayjs from "dayjs";
import {useTranslation} from "react-i18next";
import {useAlert} from "../../custom-hooks/useAlert.js";
import GooglePayButton from "@google-pay/button-react";

PaymentCheckout.propTypes = {
    total: PropTypes.number,
    currency: PropTypes.string,
    eventName: PropTypes.string,
    eventID: PropTypes.string,
    tickets: PropTypes.array,
    quantities: PropTypes.object,
    tierTicketIDs: PropTypes.array,
    resetState: PropTypes.func
}

function PaymentCheckout({total, currency, eventName, eventID, tickets, quantities, tierTicketIDs, resetState}){
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState('credit-card');
    const {t} = useTranslation()
    const {showError, showSuccess} = useAlert()

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
        collectData(eventID, 'purchase', total)
        accountAxiosWithToken.post(`/notification/preferences/update?pid=${getUserData('profileID')}&role=${getUserData('role')}`, preferences)
            .catch(error => console.log(error))

        let payload = {
            amount: total*100,
            email: getUserData('sub'),
            currency: currency,
            quantity: 1,
            name: `Tickets for ${eventName} - Tixery Event - ${dayjs().format("HH:mm DD/MM/YYYY")}`,
            userID: getUserData('userID'),
            profileID: getUserData('profileID'),
            eventID: eventID,
            username: getUserData('fullName'),
            tickets: tickets.filter((ticket, index) => quantities[index] !== 0)
                .map((ticket) => {
                    const originalIndex = tickets.findIndex(t => t === ticket);
                    return {
                        ticketTypeID: ticket.ticket_type_id,
                        quantity: quantities[originalIndex],
                        price: ticket.price * quantities[originalIndex]
                    };
                })
        }
        const isReserve = tierTicketIDs && tierTicketIDs.length > 0

        if(isReserve){
            payload = {...payload, tierTicketIDs: tierTicketIDs}
        }

        eventAxiosWithToken.post(`/payment/stripe/checkout?reserve=${isReserve}`, payload).then(response => {
            console.log(response.data)
            if(response.data.status === 'success'){
                window.location.href = response.data.sessionURL
            }
            else{
                setIsLoading(false)
                showError(t('paymentCheckout.paymentError'));
            }
        }).catch(() => {
            setIsLoading(false)
            showError(t('paymentCheckout.paymentError'));
        })
    }

    function handleGooglePayment(paymentData) {
        setIsLoading(true);
        collectData(eventID, 'purchase', total);
        accountAxiosWithToken.post(`/notification/preferences/update?pid=${getUserData('profileID')}&role=${getUserData('role')}`, preferences)
            .catch(error => console.log(error));

        let payload = {
            amount: total*100,
            email: getUserData('sub'),
            currency: currency,
            quantity: 1,
            name: `Tickets for ${eventName} - Tixery Event - ${dayjs().format("HH:mm DD/MM/YYYY")}`,
            userID: getUserData('userID'),
            profileID: getUserData('profileID'),
            eventID: eventID,
            username: getUserData('fullName'),
            tickets: tickets.filter((ticket, index) => quantities[index] !== 0)
                .map((ticket) => {
                    const originalIndex = tickets.findIndex(t => t === ticket);
                    return {
                        ticketTypeID: ticket.ticket_type_id,
                        quantity: quantities[originalIndex],
                        price: ticket.price * quantities[originalIndex]
                    };
                }),
            googlePaymentData: paymentData
        };

        const isReserve = tierTicketIDs && tierTicketIDs.length > 0;
        if(isReserve){
            payload = {...payload, tierTicketIDs: tierTicketIDs};
        }

        eventAxiosWithToken.post(`/payment/google-pay/checkout?reserve=${isReserve}`, payload).then(response => {
            if(response.data.status === 'OK'){
                resetState()
                showSuccess(t('paymentCheckout.paymentSuccess'));
            } else {
                setIsLoading(false);
                showSuccess(t('paymentCheckout.paymentError'));
            }
        }).catch(() => {
            setIsLoading(false);
            showError(t('paymentCheckout.paymentError'));
        });
    }

    return (
        <Stack flexGrow={1} sx={{ minWidth: '25rem', paddingInline: '2rem 3rem', flexGrow: 1 }}>
            <Stack textAlign={'center'} borderBottom={'1px solid'} paddingBottom={1} rowGap={1}>
                <Typography variant={'h6'} fontWeight={'bold'}>{t('paymentCheckout.checkout')}</Typography>
            </Stack>
            <Stack rowGap={3} paddingInline={10} paddingBlock={2} style={{ overflowY: 'auto' }}>
                <Stack rowGap={1}>
                    <Typography fontSize={'1.6rem'} fontWeight={'bold'}>{t('paymentCheckout.billingInformation')}</Typography>
                    <Typography variant={'body1'}>{t('paymentCheckout.loggedInAs')} {getUserData('sub')}. <span className={'link'}>{t('paymentCheckout.switchProfile')}</span></Typography>
                    <Stack>
                        <OutlinedInput fullWidth disabled label={t('paymentCheckout.emailAddress')}
                                       value={getUserData('sub')}
                                       endAdornment={
                                           <IconButton>
                                               <EditOutlinedIcon />
                                           </IconButton>
                                       }
                        />
                    </Stack>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox value={preferences.organizer_pay_update} onChange={() => handlePreferencesChange('organizer_pay_update')} />}
                                          label={t('paymentCheckout.organizerUpdates')} />
                        <FormControlLabel control={<Checkbox value={preferences.popular_events} onChange={() => handlePreferencesChange('popular_events')} />}
                                          label={t('paymentCheckout.nearbyEvents')} />
                    </FormGroup>
                </Stack>

                <Stack rowGap={2.5}>
                    <Typography fontSize={'1.6rem'} fontWeight={'bold'}>{t('paymentCheckout.payWith')}</Typography>
                    <Stack rowGap={1.5}>
                        <Stack direction={'row'} columnGap={2} alignItems={'center'} className={'payment-method'}
                               onClick={() => setSelectedMethod('credit-card')}
                        >
                            <img src={CreditCardIcon} alt={t('paymentCheckout.creditCard')} />
                            <Typography fontWeight={'bold'} fontSize={'1.1rem'}>{t('paymentCheckout.creditOrDebitCard')}</Typography>
                        </Stack>
                        <Stack direction={'row'} columnGap={2} alignItems={'center'} className={'payment-method'}
                               onClick={() => setSelectedMethod('stripe')}
                        >
                            <img src={StripeIcon} alt={'stripe'} />
                            <Typography fontWeight={'bold'} fontSize={'1.1rem'}>Stripe</Typography>
                        </Stack>
                        <Stack direction={'row'} columnGap={2} alignItems={'center'} className={'payment-method'}
                            onClick={() => setSelectedMethod('google-pay')}
                        >
                            <img src={GooglePayIcon} alt={'google pay'} />
                            <Typography fontWeight={'bold'} fontSize={'1.1rem'}>Google Pay</Typography>
                        </Stack>
                    </Stack>
                    <Stack rowGap={.25}>
                        <Typography fontSize={'.9rem'}>
                            {t("paymentCheckout.agreement", {method: selectedMethod})} <Link to={'/terms-of-service'} className={'link'} target={'_blank'}>{t('paymentCheckout.terms-of-service')}</Link></Typography>
                        {selectedMethod === 'stripe' ?
                            <button className={`pay-btn stripe-pay-btn ${isLoading ? 'stripe-pay-btn-loading' : ''}`} onClick={handleStripePayment}>
                                {isLoading ? t('paymentCheckout.processing') : 'Stripe'}
                            </button>
                            :
                            selectedMethod === 'credit-card' ?
                                <button className={'pay-btn'}>{t('paymentCheckout.placeOrder')}</button>
                                :
                                <GooglePayButton
                                    style={{height: '3rem'}}
                                    environment={"TEST"}
                                    buttonSizeMode={"fill"}
                                    paymentRequest={{
                                        apiVersion: 2,
                                        apiVersionMinor: 0,
                                        allowedPaymentMethods: [
                                            {
                                                type: 'CARD',
                                                parameters: {
                                                    allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                                                    allowedCardNetworks: ['MASTERCARD', 'VISA']
                                                },
                                                tokenizationSpecification: {
                                                    type: 'PAYMENT_GATEWAY',
                                                    parameters: {
                                                        gateway: 'example',
                                                        gatewayMerchantId: 'exampleGatewayMerchantId'
                                                    }
                                                }
                                            },
                                        ],
                                        merchantInfo: {
                                            merchantId: '01234567890123456789',
                                            merchantName: 'Tixery'
                                        },
                                        transactionInfo: {
                                            totalPriceStatus: 'FINAL',
                                            totalPriceLabel: t('paymentCheckout.total'),
                                            totalPrice: `${total}`,
                                            currencyCode: currency,
                                            countryCode: 'US'
                                        }
                                    }}
                                    onLoadPaymentData={handleGooglePayment}
                                    onError={() => {
                                        showError(t('paymentCheckout.paymentError'));
                                    }}
                                />
                        }
                    </Stack>
                </Stack>
            </Stack>
            <Stack fontSize={'.9rem'} color={'gray'} borderTop={'1px solid'} paddingTop={1} paddingInline={10} direction={'row'} alignItems={'center'} columnGap={.5}>
                {t('paymentCheckout.poweredBy')} <img width={'50px'} src={Logo} alt={'logo'} style={{ transform: 'translateY(.15rem)' }} />
            </Stack>
        </Stack>
    );
}

export default PaymentCheckout;