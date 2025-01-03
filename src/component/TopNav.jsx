import Logo from "../assets/logo.svg"
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {Stack} from "@mui/material";
import "../styles/top-nav-styles.css"
import {Link, useLocation} from "react-router-dom";
import {hasRole, checkLoggedIn, getUserData} from "../common/Utilities.js";
import LoggedInUserNav from "./LoggedInUserNav.jsx";
import * as PropsType from "prop-types";

TopNav.propTypes = {
    isLoggedIn: PropsType.bool
}

function TopNav(props){
    const isLoggedIn = checkLoggedIn();
    const location = useLocation()
    const homeLocation = getUserData('role') === 'host' ? '/organizer' : '/'

    const navLinks = [
        {
            title: 'Find Events', link: '/events',
            shouldRender: (isLoggedIn) => !isLoggedIn || hasRole(['attendee'])
        },
        {
            title: 'Likes', link: '/events/liked',
            shouldRender: (isLoggedIn) => isLoggedIn && hasRole(['attendee'])
        },
        {
            title: 'Tickets', link: '/tickets',
            shouldRender: (isLoggedIn) => isLoggedIn && hasRole(['attendee'])
        },
        {
            title: 'Create Events', link: '/organizer/create-event',
            shouldRender: (isLoggedIn) => isLoggedIn && hasRole(['host'])
        },
        {
            title: 'Create Events', link: '/organizer',
            shouldRender: (isLoggedIn) => !isLoggedIn
        },
        {
            title: 'For Supplier', link: '/about',
            shouldRender: (isLoggedIn) => !isLoggedIn || hasRole(['supplier'])
        },
        {
            title: 'Help Center', link: '/help',
            shouldRender: (isLoggedIn) => !isLoggedIn || hasRole(['attendee', 'host', 'vendor'])
        },
        {
            title: 'Log In', link: '/login',
            shouldRender: (isLoggedIn) => !isLoggedIn
        },
        {
            title: 'Sign Up', link: '/sign-up',
            shouldRender: (isLoggedIn) => !isLoggedIn
        }
    ];

    return (
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} className={`top-nav-container`}>
            <Link to={homeLocation}>
                <img src={Logo} alt="logo" width={'100px'}/>
            </Link>
            {!location.pathname.includes('organizer') &&
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
            }
            <Stack direction={'row'} className={'top-nav-container__nav-links-container'} columnGap={'1rem'}>
                {navLinks.map((item, index) => {
                    if (!item.shouldRender(isLoggedIn)) return null;
                    return (
                        <Stack key={index} justifyContent={'center'}>
                            <Link to={item.link} className={'top-nav-container__nav-links-container__link'}>
                                {item.title}
                            </Link>
                        </Stack>
                    );
                })}
                {(isLoggedIn || props.isLoggedIn) && <LoggedInUserNav />}
            </Stack>
        </Stack>
    )
}

export default TopNav