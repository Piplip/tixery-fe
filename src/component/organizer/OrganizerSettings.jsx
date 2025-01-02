import {NavLink, Outlet} from "react-router-dom";
import '../../styles/organizer-setting-styles.css'
import {Stack, Typography} from "@mui/material";
import {getUserData} from "../../common/Utilities.js";

function OrganizerSettings() {
    return (
        <div className={'organizer-setting-template'}>
            <Stack className={'organizer-setting-header'} rowGap={1}>
                <p>{getUserData('fullname') || 'GREETINGS'}</p>
                <Typography variant={'h2'} fontWeight={'bold'}>Organization Settings</Typography>
                <nav className="horizontal-nav">
                    <ul className="horizontal-nav__list">
                        <li>
                            <NavLink to="" className="horizontal-nav__link">
                                Organizer Profile
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/team-management" className="horizontal-nav__link">
                                Team Management
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/ticket-fees" className="horizontal-nav__link">
                                Ticket Fees
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/plan-management" className="horizontal-nav__link">
                                Plan Management
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </Stack>
            <Outlet />
        </div>
    )
}

export default OrganizerSettings