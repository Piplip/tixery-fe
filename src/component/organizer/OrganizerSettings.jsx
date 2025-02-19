import {NavLink, Outlet} from "react-router-dom";
import '../../styles/organizer-setting-styles.css'
import {Stack, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

function OrganizerSettings() {
    const {t} = useTranslation();

    return (
        <div className={'organizer-setting-template'}>
            <Stack className={'organizer-setting-header'} rowGap={1}>
                <Typography fontSize={'3.5rem'} fontFamily={'Raleway'} fontWeight={'bold'}>
                    {t('organizerSetting.organizationSettings')}
                </Typography>
                <nav className="horizontal-nav">
                    <ul className="horizontal-nav__list">
                        <li>
                            <NavLink to="" className="horizontal-nav__link">
                                {t('organizerSetting.organizerProfile')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/team-management" className="horizontal-nav__link">
                                {t('organizerSetting.teamManagement')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/ticket-fees" className="horizontal-nav__link">
                                {t('organizerSetting.ticketFees')}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/plan-management" className="horizontal-nav__link">
                                {t('organizerSetting.planManagement')}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </Stack>
            <Outlet />
        </div>
    );
}

export default OrganizerSettings