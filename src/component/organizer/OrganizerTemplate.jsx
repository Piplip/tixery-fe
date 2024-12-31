import {Outlet} from "react-router-dom";
import OrganizerNavBar from "./OrganizerNavBar.jsx";
import '../../styles/organizer-template-styles.css'
import TopNav from "../TopNav.jsx";

function OrganizerTemplate(){
    return (
        <div className={'organizer-template'}>
            <TopNav />
            <OrganizerNavBar />
            <div className={'organizer-template-outlet-wrapper'}>
                <Outlet />
            </div>

        </div>
    )
}

export default OrganizerTemplate