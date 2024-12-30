import Logo from "../assets/logo.svg"
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {Stack} from "@mui/material";
import "../styles/top-nav-styles.css"
import {Link} from "react-router-dom";
import {hasRole, checkLoggedIn, getUserData} from "../common/Utilities.js";
import LoggedInUserNav from "./LoggedInUserNav.jsx";
import * as PropsType from "prop-types";

TopNav.propTypes = {
    isLoggedIn: PropsType.bool
}

function TopNav(props){
    const navLinks = [
        {title: 'Find Events', link: '/events', roles: ['attendee'], public: true},
        {title: 'Likes', link: '/events/liked', roles: ['attendee']},
        {title: 'Tickets', link: '/tickets', roles: ['attendee']},
        {title: 'Create Events', link: '/host', roles: ['host'], public: true},
        {title: 'For Supplier', link: '/about', roles: ['supplier'], public: true},
        {title: 'Help Center', link: '/help', roles: ['attendee', 'host', 'vendor'], public: true},
        {title: 'Log In', link: '/login', roles: ['attendee', 'host', 'vendor'], hide: checkLoggedIn(), public: true},
        {title: 'Sign Up', link: '/sign-up', roles: ['attendee', 'host', 'vendor'], hide: checkLoggedIn(), public: true},
    ]

    // TODO: Re implement the navbar rendering logic, it now isn't rendering correctly for logged in user with roles

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
                    const userRole = getUserData('role');
                    const isLoggedIn = checkLoggedIn();

                    if (isLoggedIn) {
                        if (item.hide) return null;
                        if (userRole) {
                            if (hasRole(item.roles)) {
                                return (
                                    <Stack key={index} justifyContent={'center'}>
                                        <Link to={item.link} className={'top-nav-container__nav-links-container__link'}>
                                            {item.title}
                                        </Link>
                                    </Stack>
                                );
                            }
                        } else {
                            if (item.public) {
                                return (
                                    <Stack key={index} justifyContent={'center'}>
                                        <Link to={item.link} className={'top-nav-container__nav-links-container__link'}>
                                            {item.title}
                                        </Link>
                                    </Stack>
                                );
                            }
                        }
                    } else {
                        if (item.public && (!userRole || hasRole(item.roles))) {
                            return (
                                <Stack key={index} justifyContent={'center'}>
                                    <Link to={item.link} className={'top-nav-container__nav-links-container__link'}>
                                        {item.title}
                                    </Link>
                                </Stack>
                            );
                        }
                    }
                })}
                {checkLoggedIn() && props.isLoggedIn && <LoggedInUserNav />}
            </Stack>
        </Stack>
    )
}

export default TopNav