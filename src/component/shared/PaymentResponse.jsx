import {Link, useLocation} from "react-router-dom";
import {Box, Button, Stack, Typography} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import "../../styles/payment-response-styles.css"
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from '@mui/icons-material/Cancel';
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {formatCurrency, getUserData} from "../../common/Utilities.js";
import {useTranslation} from "react-i18next";

function PaymentResponse(){
    const location = useLocation()
    const initialType = location.pathname.includes('success') ? 'success' : 'failed'
    const [isLoading, setIsLoading] = useState(true);
    const processed = useRef(false)
    const [response, setResponse] = useState({})
    const {t} = useTranslation()

    useEffect(() => {
        if(!processed.current){
            processed.current = true
            const url = `/payment/${initialType === 'success' ? 'stripe/success' : 'stripe/failure'}?order-id=${new URLSearchParams(location.search).get('orderID')}&pid=${getUserData('profileID')}`
            eventAxiosWithToken.post(url)
                .then(r => {
                    console.log(r.data)
                    setIsLoading(false)
                    setResponse(r.data)
                })
                .catch(err => console.log(err))
        }
    }, [processed.current]);

    return (
        <Stack className={isLoading ? '' : initialType && response?.status === 'success' ? 'payment-response-success' : 'payment-response-failed'} justifyContent={'center'} alignItems={'center'} height={'100dvh'}>
            {isLoading ?
                <Stack rowGap={5} alignItems={'center'}>
                    <Typography variant={'h4'}>{t('paymentResponse.processingPayment')}</Typography>
                    <div className={'payment-loader'}></div>
                </Stack>
                :
                initialType && response?.status === 'success' ?
                    <Box className="payment-success">
                        <Box className="payment-success__icon-wrapper">
                            <Box className="payment-success__icon-background">
                                <Box className="payment-success__icon-circle payment-success__icon-circle--large"></Box>
                                <Box className="payment-success__icon-circle payment-success__icon-circle--medium"></Box>
                                <Box className="payment-success__icon-circle payment-success__icon-circle--small"></Box>
                                <CheckCircleIcon className="payment-success__icon" sx={{ fontSize: '75px' }} />
                            </Box>
                        </Box>

                        <Typography variant="h5" className="payment-success__title" fontFamily={'Roboto Slab'} fontWeight={500}>
                            {response?.message || (initialType ? t('paymentResponse.ticketPaymentSuccess') : t('paymentResponse.ticketPaymentFailed'))}
                        </Typography>
                        <Typography variant="body1" className="payment-success__transaction">
                            {t('paymentResponse.transactionID')}: {response.sessionID}
                        </Typography>

                        <Box className="payment-success__details">
                            <Typography variant="h6">
                                {t('paymentResponse.paidAmount')}: <span className="payment-success__amount">{formatCurrency(response.amount / 100, response.currency)}</span>
                            </Typography>
                            <Typography variant="h6">
                                {t('paymentResponse.paidBy')} <span className="payment-success__method">{getUserData('profileName')}</span>
                            </Typography>
                        </Box>
                        <Link to={`/u/${getUserData('profileID')}`}>
                            <Button variant={'contained'} color={'primary'} sx={{ marginTop: 3 }}>{t('paymentResponse.goToMyTickets')}</Button>
                        </Link>
                    </Box>
                    :
                    <Box className="payment-failed">
                        <Box className="payment-failed__icon-wrapper">
                            <Box className="payment-failed__icon-background">
                                <Box className="payment-failed__icon-circle payment-failed__icon-circle--large"></Box>
                                <Box className="payment-failed__icon-circle payment-failed__icon-circle--medium"></Box>
                                <Box className="payment-failed__icon-circle payment-failed__icon-circle--small"></Box>
                                <CancelIcon className="payment-failed__icon" sx={{ fontSize: '50px' }} />
                            </Box>
                        </Box>

                        <Typography variant="h5" className="payment-failed__title" fontFamily={'Roboto Slab'} fontWeight={500}>
                            {response?.message || (initialType ? t('paymentResponse.ticketPaymentSuccess') : t('paymentResponse.ticketPaymentFailed'))}
                        </Typography>
                        <Typography variant="body1" className="payment-failed__transaction">
                            {t('paymentResponse.transactionID')}: {response.sessionID}
                        </Typography>

                        <Box className="payment-failed__details">
                            <Typography variant="h6">
                                {t('paymentResponse.payWith')} <span className="payment-failed__method">{response.paymentMethod}</span>
                            </Typography>
                        </Box>
                        <Link to={`/events/${response.eventID}`}>
                            <Button variant={'contained'} color={'error'} sx={{ marginTop: 3 }}>{t('paymentResponse.retry')}</Button>
                        </Link>
                    </Box>
            }
        </Stack>
    );
}

export default PaymentResponse;
