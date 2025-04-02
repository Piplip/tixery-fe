import TopNav from "../shared/TopNav.jsx";
import {Outlet} from "react-router-dom";
import RootFooter from "../shared/RootFooter.jsx";
import {useEffect, useState} from "react";
import {checkLoggedIn, clearCookie, getCookie} from "../../common/Utilities.js";
import {Stack} from "@mui/material";

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
        <Stack sx={{minHeight: '100vh'}}>
            <TopNav enableScrollEffect={true} isLoggedIn={isLoggedIn}/>
            <div style={{flexGrow: 1}}>
                <Outlet />
            </div>
            <RootFooter />
        </Stack>
    )
}

export default RootTemplate