import Logo from "../assets/logo.svg"
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {Stack} from "@mui/material";
import "../styles/top-nav-styles.css"
import {Link} from "react-router-dom";

function TopNav(){
    const navLinks = [
        {title: 'Find Events', link: '/events'},
        {title: 'Create Events', link: '/organizer'},
        {title: 'For Supplier', link: '/about'},
        {title: 'Help Center', link: '/help'},
        {title: 'Log In', link: '/login'},
        {title: 'Sign Up', link: '/sign-up'}
    ]

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
                {navLinks.map((item, index) => (
                    <div key={index}>
                        <Link to={item.link}>{item.title}</Link>
                    </div>
                ))}
            </Stack>
        </Stack>
    )
}

export default TopNav