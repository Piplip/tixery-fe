import'../styles/select-role-styles.css'
import Logo from "../assets/logo.svg"
import {Stack} from "@mui/material";
import EventOrganizer from "../assets/event-organizer.png"
import Attendee from "../assets/event-attendee.png"
import Vendor from "../assets/vendor-supplier.png"
import {Link} from "react-router-dom";

function SelectRole(){
    // TODO: Implement set up user data for attendee

    return (
        <div className={'select-role-container'}>
            <Link to={'/'} className={'select-role-container__logo'}>
                <img src={Logo} alt={'logo'} width={'100px'}/>
            </Link>
            <Stack>
                <p className={'select-role-title'}>Welcome to Tixery! 👋</p>
                <p className={'select-role-description'}>Let's get started by selecting your interests</p>
            </Stack>
            <Stack direction={'row'} columnGap={'3rem'} className={'role-card-container'}>
                <Link to={'/organizer'}>
                    <div className={'role-card'}>
                        <img src={EventOrganizer} alt={'event-organizer'}/>
                        <p>Organize an event</p>
                        <button>Plan your best event ever</button>
                    </div>
                </Link>
                <Link to={'info'}>
                    <div className={'role-card'}>
                        <img src={Attendee} alt={'event-attendee'}/>
                        <p>Find an experience</p>
                        <button>Tell us what you love</button>
                    </div>
                </Link>
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