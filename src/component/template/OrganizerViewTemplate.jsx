import {Outlet} from "react-router-dom";
import TopNav from "../shared/TopNav.jsx";
import {useEffect, useState} from "react";
import {checkLoggedIn, clearCookie, getCookie} from "../../common/Utilities.js";

function OrganizerViewTemplate() {
    const [isLoggedIn, setIsLoggedIn] = useState(checkLoggedIn())

    useEffect(() => {
        if(isLoggedIn === false){
            if(getCookie('tk') !== null){
                localStorage.setItem('tk', getCookie('tk'))
                setIsLoggedIn(true)
                clearCookie('tk')
            }
        }
    }, [])

    return (
        <div>
            <TopNav enableScrollEffect={true} isLoggedIn={isLoggedIn}/>
            <Outlet />
        </div>
    );
}

export default OrganizerViewTemplate;