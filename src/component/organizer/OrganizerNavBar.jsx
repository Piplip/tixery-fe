import {NavLink} from "react-router-dom";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import VolumeDownIcon from '@mui/icons-material/VolumeDown';
import FilterFramesIcon from '@mui/icons-material/FilterFrames';
import EventIcon from '@mui/icons-material/Event';
import HomeIcon from '@mui/icons-material/Home';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ShortLogo from "../../../public/assets/file.png"

function OrganizerNavBar(){
    const navItems = [
        { label: 'Home', icon: <HomeIcon />, to: '' },
        { label: 'Events', icon: <EventIcon />, to: 'events' },
        { label: 'Orders', icon: <FilterFramesIcon />, to: 'order-management' },
        { label: 'Marketing', icon: <VolumeDownIcon />, to: 'marketing' },
        { label: 'Reporting', icon: <SignalCellularAltIcon />, to: 'reporting' },
        { label: 'Finance', icon: <AccountBalanceIcon />, to: 'finance' },
        { label: 'Organizations', icon: <SettingsIcon />, to: 'u' },
    ];

    return (
        <div className="left-nav">
            <ul className="left-nav__list">
                <li className="left-nav__item">
                    <img className={'left-nav__link'} src={ShortLogo} alt={'logo'} width={'40px'} style={{alignSelf: 'center'}}/>
                </li>
                {navItems.map((item) => (
                    <li key={item.label} className="left-nav__item">
                        <NavLink
                            to={item.to} end={item.to === ''}
                            className={({ isActive }) =>
                                isActive ? 'left-nav__link active' : 'left-nav__link'
                            }
                        >
                            <span className="left-nav__icon">{item.icon}</span>
                            <span className="left-nav__label">{item.label}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
            <div className="left-nav__help-center">
                <NavLink
                    to="/help-center"
                    className={({ isActive }) =>
                        isActive ? 'left-nav__link active' : 'left-nav__link'
                    }
                >
          <span className="left-nav__icon">
            <HelpOutlineIcon />
          </span>
                    <span className="left-nav__label">Help Center</span>
                </NavLink>
            </div>
        </div>
    );
}

export default OrganizerNavBar;