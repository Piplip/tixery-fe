import Logo from "../../assets/logo.svg"
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {Stack, Typography} from "@mui/material";
import "../../styles/top-nav-styles.css"
import {Link, useLocation} from "react-router-dom";
import {hasRole, checkLoggedIn, getUserData} from "../../common/Utilities.js";
import LoggedInUserNav from "./LoggedInUserNav.jsx";
import * as PropsType from "prop-types";
import {useEffect, useRef, useState} from "react";
import TurnSharpRightIcon from '@mui/icons-material/TurnSharpRight';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import ScheduleIcon from '@mui/icons-material/Schedule';

TopNav.propTypes = {
    isLoggedIn: PropsType.bool,
    enableScrollEffect: PropsType.bool
}

function TopNav(props){
    const isLoggedIn = checkLoggedIn();
    const location = useLocation()
    const homeLocation = getUserData('role') === 'HOST' ? '/organizer' : '/'
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollPos, setLastScrollPos] = useState(0);
    const [showLocationOption, setShowLocationOption] = useState(false);
    const [showRecentSearches, setShowRecentSearches] = useState(false);

    const recentSearchesRef = useRef(null);
    const locationOptionRef = useRef(null);
    const searchBarRef = useRef(null);

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

    useEffect(() => {
        if (!props.enableScrollEffect) return;

        const handleScroll = () => {
            const currentScrollPos = window.scrollY;

            if (currentScrollPos > lastScrollPos && currentScrollPos > 50) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            setLastScrollPos(currentScrollPos);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [props.enableScrollEffect, lastScrollPos]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (
                !recentSearchesRef.current?.contains(event.target) &&
                !locationOptionRef.current?.contains(event.target) &&
                !searchBarRef.current?.contains(event.target)
            ) {
                setShowRecentSearches(false);
                setShowLocationOption(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const handleSearchClick = () => {
        setShowRecentSearches(true);
        setShowLocationOption(false);
    };

    const handleLocationClick = () => {
        setShowLocationOption(true);
        setShowRecentSearches(false);
    };

    return (
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}
               className={`top-nav-container ${isVisible ? 'visible' : 'hidden'}`}
        >
            <Link to={homeLocation}>
                <img src={Logo} alt="logo" width={'100px'}/>
            </Link>
            {!location.pathname.includes('organizer') &&
                <Stack direction={'row'} className={'top-nav-input-container'} alignItems={'center'}>
                    <div style={{position: 'relative'}} ref={recentSearchesRef}>
                        <SearchIcon />
                        <input className={'top-nav-input-container__input'} type="text" placeholder="Search events"
                               onClick={handleSearchClick}
                        />
                        {showRecentSearches &&
                            <Stack className={'drop-down-suggestion'}>
                                <Stack flexDirection={'row'} justifyContent={'space-between'}>
                                    <Typography variant={'h6'}>Recent searches</Typography>
                                    <div style={{color: 'blue'}}>Clear</div>
                                </Stack>
                                <Stack>
                                    <Stack direction={'row'} columnGap={1} alignItems={'center'} style={{width: '100%'}}>
                                        <ScheduleIcon /> <Typography variant={'caption'}>Foo</Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                        }
                    </div>
                    <div style={{position: 'relative'}} ref={locationOptionRef}>
                        <LocationOnIcon />
                        <input className={'top-nav-input-container__input'} type="text" placeholder="Choose a location"
                               onClick={handleLocationClick}
                        />
                        {showLocationOption &&
                            <Stack className={'drop-down-suggestion'}>
                                <Stack flexDirection={'row'}>
                                    <TurnSharpRightIcon />
                                    <span>Use my current location</span>
                                </Stack>
                                <Stack flexDirection={'row'}>
                                    <LiveTvIcon />
                                    <span>Browse online events</span>
                                </Stack>
                            </Stack>
                        }
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