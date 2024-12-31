import TopNav from "../TopNav.jsx";
import AttendeeHero from "./AttendeeHero.jsx";
import {useEffect, useState} from "react";
import {clearCookie, getCookie} from "../../common/Utilities.js";
import {checkLoggedIn} from "../../common/Utilities.js";

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

    // TODO: Send a request to check if the JWT is expired or not when loading the page
    // TODO: handle the case where user haven't set up roles

    return (
        <div>
            <TopNav isLoggedIn={isLoggedIn}/>
            <AttendeeHero />
        </div>
    )
}

export default AttendeeHome