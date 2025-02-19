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
import {useTranslation} from "react-i18next";

function OrganizerNavBar(){
    const {t} = useTranslation()

    const navItems = [
        { label: t('organizerNavBar.home'), icon: <HomeIcon />, to: '' },
        { label: t('organizerNavBar.events'), icon: <EventIcon />, to: 'events' },
        { label: t('organizerNavBar.orders'), icon: <FilterFramesIcon />, to: 'order-management' },
        { label: t('organizerNavBar.marketing'), icon: <VolumeDownIcon />, to: 'marketing' },
        { label: t('organizerNavBar.reporting'), icon: <SignalCellularAltIcon />, to: 'reporting' },
        { label: t('organizerNavBar.finance'), icon: <AccountBalanceIcon />, to: 'finance' },
        { label: t('organizerNavBar.organizations'), icon: <SettingsIcon />, to: 'u' },
    ];

    return (
        <div className="left-nav">
            <ul className="left-nav__list">
                <li className="left-nav__item">
                    <img className={'left-nav__link'} src={ShortLogo} alt={t('organizerNavBar.logoAlt')} width={'40px'} style={{ alignSelf: 'center' }} />
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
                    <span className="left-nav__label">{t('organizerNavBar.helpCenter')}</span>
                </NavLink>
            </div>
        </div>
    );
}

export default OrganizerNavBar;