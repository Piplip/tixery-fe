import {Outlet} from "react-router-dom";
import OrganizerNavBar from "../organizer/OrganizerNavBar.jsx";
import '../../styles/organizer-template-styles.css'
import TopNav from "../shared/TopNav.jsx";
import {useEffect, useState} from "react";
import {checkLoggedIn, clearCookie, getCookie} from "@/common/Utilities.js";

function OrganizerTemplate(){
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

    useEffect(() => {
        const hashToken = window.location.hash.match(/#token=([^&]*)/);

        if (hashToken && hashToken[1]) {
            const token = hashToken[1];

            try {
                if (token.split('.').length === 3) {
                    localStorage.setItem('tk', token);
                    window.location.hash = '';
                    window.location.reload();
                } else {
                    console.error('Invalid token format received');
                }
            } catch (error) {
                console.error('Error storing token:', error);
            }
        }
    }, [])

    return (
        <div className={'organizer-template'}>
            <TopNav isLoggedIn={isLoggedIn}/>
            <OrganizerNavBar />
            <div className={'organizer-template-outlet-wrapper'}>
                <Outlet />
            </div>
        </div>
    )
}

export default OrganizerTemplate