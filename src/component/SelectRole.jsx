import'../styles/select-role-styles.css'
import Logo from "../assets/logo.svg"
import {Stack} from "@mui/material";
import EventOrganizer from "../assets/event-organizer.png"
import Attendee from "../assets/event-attendee.png"
import Vendor from "../assets/vendor-supplier.png"
import {Link, useLocation, useNavigate} from "react-router-dom";
import accountAxios from "../config/axiosConfig.js";

function SelectRole(){
    const navigate = useNavigate()
    const location = useLocation()

    function createSetUpRequest(){
        const uid = location.search.split('=')[1]
        if(uid === undefined){
            return
        }
        accountAxios.post('/profile/setup?uid=' + uid)
            .then(res => {
                navigate('info?rid=' + res.data.data.requestID)
            })
            .catch(err => console.log(err))
    }

    return (
        <div className={'select-role-container'}>
            <Link to={'/'} className={'select-role-container__logo'}>
                <img src={Logo} alt={'logo'} width={'100px'}/>
            </Link>
            <Stack>
                <p className={'select-role-title'}>Welcome to Tixery! 👋</p>
                <p className={'select-role-description'}>Let&#39;s get started by selecting your interests</p>
            </Stack>
            <Stack direction={'row'} columnGap={'3rem'} className={'role-card-container'}>
                <Link to={'/organizer'}>
                    <div className={'role-card'}>
                        <img src={EventOrganizer} alt={'event-organizer'}/>
                        <p>Organize an event</p>
                        <button>Plan your best event ever</button>
                    </div>
                </Link>
                <div className={'role-card'} onClick={createSetUpRequest}>
                    <img src={Attendee} alt={'event-attendee'}/>
                    <p>Find an experience</p>
                    <button onClick={createSetUpRequest}>Tell us what you love</button>
                </div>
                <Link to={'/vendor'}>
                    <div className={'role-card'}>
                        <img src={Vendor} alt={'vendor supplier'}/>
                        <p>Sell your services</p>
                        <button>Make profit with us</button>
                    </div>
                </Link>
            </Stack>
        </div>
    )
}

export default SelectRole