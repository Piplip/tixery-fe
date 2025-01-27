import TopNav from "../shared/TopNav.jsx";
import {Outlet} from "react-router-dom";
import RootFooter from "../shared/RootFooter.jsx";
import {useEffect, useState} from "react";
import {checkLoggedIn, clearCookie, getCookie} from "../../common/Utilities.js";

function RootTemplate(){
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
        <>
            <TopNav enableScrollEffect={true} isLoggedIn={isLoggedIn}/>
            <Outlet />
            <RootFooter />
        </>
    )
}

export default RootTemplate