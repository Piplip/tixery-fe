import Logo from "../assets/logo.svg"
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {Stack} from "@mui/material";
import "../styles/top-nav-styles.css"
import {Link} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {hasRole, isLoggedIn} from "../common/Utilities.js";
import LoggedInUserNav from "./LoggedInUserNav.jsx";

function TopNav(){
    const navLinks = [
        {title: 'Find Events', link: '/events', roles: ['attendee'], public: true},
        {title: 'Likes', link: '/events/liked', roles: ['attendee']},
        {title: 'Tickets', link: '/tickets', roles: ['attendee']},
        {title: 'Create Events', link: '/organizer', roles: ['organizer'], public: true},
        {title: 'For Supplier', link: '/about', roles: ['supplier'], public: true},
        {title: 'Help Center', link: '/help', roles: ['attendee', 'organizer', 'vendor'], public: true},
        {title: 'Log In', link: '/login', roles: ['attendee', 'organizer', 'vendor'], hide: isLoggedIn(), public: true},
        {title: 'Sign Up', link: '/sign-up', roles: ['attendee', 'organizer', 'vendor'], hide: isLoggedIn(), public: true},
    ]
    if(localStorage.getItem('tk')){
        console.log(jwtDecode(localStorage.getItem('tk')))
    }

    return (
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}
               className={`top-nav-container`}>
            <Link to={'/'}>
                <img src={Logo} alt="logo" width={'100px'}/>
            </Link>
            <Stack direction={'row'} className={'top-nav-input-container'} alignItems={'center'}>
                <div>
                    <SearchIcon />
                    <input className={'top-nav-input-container__input'} type="text" placeholder="Search events"/>
                </div>
                <div>
                    <LocationOnIcon />
                    <input className={'top-nav-input-container__input'} type="text" placeholder="Choose a location"/>
                </div>
                <div className={'top-nav__search-btn'}>
                    <SearchIcon />
                </div>
            </Stack>
            <Stack direction={'row'} className={'top-nav-container__nav-links-container'} columnGap={'1rem'}>
                {navLinks.map((item, index) => {
                    if(isLoggedIn()){
                        if(item.hide) return null
                        else{
                            if(hasRole(item.roles))
                                return (
                                    <Stack key={index} justifyContent={'center'}>
                                        <Link to={item.link} className={'top-nav-container__nav-links-container__link'}>
                                            {item.title}
                                        </Link>
                                    </Stack>
                                )
                        }
                    }
                    else if(item.public) {
                            return (
                                <Stack key={index} justifyContent={'center'}>
                                    <Link to={item.link} className={'top-nav-container__nav-links-container__link'}>
                                        {item.title}
                                    </Link>
                                </Stack>
                            )
                    }
                })}
                {isLoggedIn() && <LoggedInUserNav />}
            </Stack>
        </Stack>
    )
}

export default TopNav