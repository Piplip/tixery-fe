import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import PropTypes from "prop-types";
import {Stack, Typography} from "@mui/material";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import OrderCardDetail from "../attendee/OrderCardDetail.jsx";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {useTranslation} from "react-i18next";

OrderCard.propTypes = {
    order: PropTypes.object.isRequired
}

initializeApp(firebaseConfig);
const storage = getStorage()

function OrderCard({order}){
    const [img, setImg] = useState("https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59")
    const [open, setOpen] = useState(false);
    const [orderDetail, setOrderDetail] = useState({})
    const {t} = useTranslation()

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if(order?.images){
            let storageRef = ref(storage, order.images[0])
            getDownloadURL(storageRef)
                .then(url => {
                    setImg(url)
                })
                .catch(() => {
                    console.log('error')
                })
        }
    }, [])

    function handleOrderClick(){
        setOpen(true)
        eventAxiosWithToken.get(`/order/tickets?order-id=${order.order_id}`)
            .then(r => {
                setOrderDetail(r.data)
            })
            .catch(err => console.log(err))
    }

    return (
        <>
            <Stack direction={'row'} columnGap={3} onClick={handleOrderClick}>
                <Stack sx={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '.9rem', color: 'darkblue' }}>{order?.start_time && dayjs(order.start_time).format("MMM").toUpperCase()}</p>
                    <p style={{ fontSize: '1.5rem' }}>{order?.start_time && dayjs(order.start_time).format("DD").toUpperCase()}</p>
                </Stack>
                <Stack minWidth={'20rem'} width={'20rem'} height={'12.5rem'} sx={{ backgroundColor: 'rgb(245,245,245)' }}>
                    <img
                        src={img}
                        alt={t('orderCard.eventImage')}
                        style={{
                            height: '100%',
                            maxWidth: '100%',
                            objectFit: 'cover',
                            display: 'block'
                        }}
                    />
                </Stack>
                <Stack rowGap={.5}>
                    <Typography fontWeight={'bold'} fontSize={'1.75rem'}>{order?.name}</Typography>
                    <Typography variant={'body2'}>{dayjs(order?.start_time).format("ddd, MMM DD, YYYY HH:mm Z")}</Typography>
                    <Typography variant={'body2'}>{t('orderCard.orderPlaced')} #{order?.order_id} {t('orderCard.on')} {dayjs(order?.created_at).format("DD/MM/YYYY HH:mm")}</Typography>
                    {order?.location?.location === 'Online' &&
                        <Typography variant={'body2'} className={'link'}>{t('orderCard.goToOnlineEvent')}</Typography>
                    }
                </Stack>
            </Stack>
            <OrderCardDetail open={open} handleClose={handleClose} eventImg={img} order={order} ticketInfo={orderDetail} />
        </>
    );
}

export default OrderCard;