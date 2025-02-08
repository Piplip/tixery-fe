import {Stack, Typography} from "@mui/material";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import {useState} from "react";

function AttendeeOrders(){
    const [orders, setOrders] = useState([])


    // TODO: Implement the logic to fetch the user's orders
    return (
        <div>
            {orders.length === 0 ?
                <Stack className="attendee-profile__section-content" alignItems={'center'} justifyContent={'center'} rowGap={4}>
                    <ShoppingBasketIcon sx={{width: '6rem', height: '6rem', backgroundColor: '#e7e7e7', padding: 1.5, borderRadius: '50%'}}/>
                    <Typography variant={'h6'} sx={{color: '#4b6791'}}>No upcoming orders</Typography>
                    <Typography variant={'body2'} className="link">See past orders</Typography>
                </Stack>
                :
                <Stack>

                </Stack>
            }
        </div>
    )
}

export default AttendeeOrders;