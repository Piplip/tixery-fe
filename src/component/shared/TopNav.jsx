import Logo from "../../assets/logo.svg"
import {Stack} from "@mui/material";
import "../../styles/top-nav-styles.css"
import {Link} from "react-router-dom";
import {hasRole, getUserData} from "../../common/Utilities.js";
import LoggedInUserNav from "./LoggedInUserNav.jsx";
import * as PropsType from "prop-types";
import {useEffect, useState} from "react";
import TopNavSearchBar from "./TopNavSearchBar.jsx";

TopNav.propTypes = {
    isLoggedIn: PropsType.bool,
    enableScrollEffect: PropsType.bool
}

function TopNav({isLoggedIn, enableScrollEffect}){
    const homeLocation = getUserData('role') === 'HOST' ? '/organizer' : '/'
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollPos, setLastScrollPos] = useState(0);

    const navLinks = [
        {
            title: 'Likes', link: '/favorites',
            shouldRender: (isLoggedIn) => isLoggedIn && hasRole(['attendee'])
        },
        {
            title: 'Tickets', link: `/u/${getUserData('profileID')}`,
            shouldRender: (isLoggedIn) => isLoggedIn && hasRole(['attendee'])
        },
        {
            title: 'Create Events', link: '/organizer/create-event',
            shouldRender: (isLoggedIn) => isLoggedIn && hasRole(['host'])
        },
        {
            title: 'Create Events', link: isLoggedIn ? '/organizer' : 'organizer/overview',
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
        if (!enableScrollEffect) return;

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
    }, [enableScrollEffect, lastScrollPos]);

    return (
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}
               className={`top-nav-container ${isVisible ? 'visible' : 'hidden'}`}
        >
            <Link to={homeLocation}>
                <img src={Logo} alt="logo" width={'100px'}/>
            </Link>
            <TopNavSearchBar />
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
                {isLoggedIn && <LoggedInUserNav />}
            </Stack>
        </Stack>
    )
}

export default TopNav