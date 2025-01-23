import TopNav from "../shared/TopNav.jsx";
import AttendeeHero from "./AttendeeHero.jsx";
import {useEffect, useState} from "react";
import {clearCookie, getCookie} from "../../common/Utilities.js";
import {checkLoggedIn} from "../../common/Utilities.js";
import BrowseEvents from "./BrowseEvents.jsx";
import RootFooter from "../shared/RootFooter.jsx";

function AttendeeHome(){
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

    // TODO: handle the case where user haven't set up roles

    return (
        <div>
            <TopNav isLoggedIn={isLoggedIn}/>
            <AttendeeHero />
            <BrowseEvents />
            <RootFooter />
        </div>
    )
}

export default AttendeeHome