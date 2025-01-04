import {Outlet} from "react-router-dom";
import TopNav from "../TopNav.jsx";

function OrganizerViewTemplate() {
    return (
        <div>
            <TopNav enableScrollEffect={true}/>
            <Outlet />
        </div>
    );
}

export default OrganizerViewTemplate;