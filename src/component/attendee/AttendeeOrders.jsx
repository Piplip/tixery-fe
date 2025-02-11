import {Stack, Typography} from "@mui/material";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import {useEffect, useRef, useState} from "react";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import OrderCard from "../shared/OrderCard.jsx";

function AttendeeOrders(){
    const [orders, setOrders] = useState([])
    const [pastOrders, setPastOrders] = useState(null)
    const hasFetch = useRef(false)

    useEffect(() => {
        if(!hasFetch.current){
            hasFetch.current = true
            eventAxiosWithToken.get(`/orders/profile?pid=${getUserData('profileID')}`)
                .then(r => {
                    setOrders(r.data)
                })
                .catch(err => console.log(err))
        }
    }, [hasFetch]);

    function loadPastOrders(){
        eventAxiosWithToken.get(`/orders/profile/past?pid=${getUserData('profileID')}`)
            .then(r => {
                setPastOrders(r.data)
            })
            .catch(err => console.log(err))
    }

    return (
        <>
            <Stack direction={'row'} alignItems={'center'} columnGap={.5} className="attendee-profile__section-header">
                <p className="attendee-profile__section-title">Orders ({orders.length})</p>
            </Stack>
            <Stack rowGap={3}>
                {orders.length > 0 ?
                    orders.map((item, index) => {
                        return (
                            <OrderCard key={index} order={item}/>
                        )
                    })
                    :
                    <Stack className="attendee-profile__section-content" alignItems={'center'} justifyContent={'center'} rowGap={4}>
                        <ShoppingBasketIcon sx={{width: '6rem', height: '6rem', backgroundColor: '#e7e7e7', padding: 1.5, borderRadius: '50%'}}/>
                        <Typography variant={'h6'} sx={{color: '#4b6791'}}>No upcoming orders</Typography>
                    </Stack>
                }
            </Stack>
            <Stack marginTop={5}>
                {pastOrders === null ?
                    <Typography variant={'body2'} className="link" style={{alignSelf: 'center'}}
                                onClick={loadPastOrders}
                    >See past orders</Typography>
                    :
                    <Stack>
                        <Stack direction={'row'} alignItems={'center'} columnGap={.5} className="attendee-profile__section-header">
                            <p className="attendee-profile__section-title">Past Orders ({pastOrders?.length})</p>
                        </Stack>
                        <Stack rowGap={3}>
                            {pastOrders?.length > 0 ?
                                pastOrders.map((item, index) => {
                                    return (
                                        <OrderCard key={index} order={item}/>
                                    )
                                })
                                :
                                <Stack className="attendee-profile__section-content" alignItems={'center'} justifyContent={'center'} rowGap={4}>
                                    <ShoppingBasketIcon sx={{width: '6rem', height: '6rem', backgroundColor: '#e7e7e7', padding: 1.5, borderRadius: '50%'}}/>
                                    <Typography variant={'h6'} sx={{color: '#4b6791'}}>No upcoming orders</Typography>
                                </Stack>
                            }
                        </Stack>
                    </Stack>
                }
            </Stack>
        </>
    )
}

export default AttendeeOrders;