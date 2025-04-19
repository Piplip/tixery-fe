import {Outlet} from "react-router-dom";
import OrganizerNavBar from "../organizer/OrganizerNavBar.jsx";
import '../../styles/organizer-template-styles.css'
import TopNav from "../shared/TopNav.jsx";
import {useEffect} from "react";
import {checkLoggedIn} from "@/common/Utilities.js";

function OrganizerTemplate(){

    useEffect(() => {
        try {
            console.log("Processing token from URL");
            const hash = window.location.hash.substring(1);

            if (hash.startsWith('token=')) {
                const token = hash.substring(6);
                console.log("Token found, processing...");

                if (token && token.split('.').length === 3) {
                    localStorage.setItem('tk', token);
                    console.log("Token stored successfully");

                    window.history.replaceState(null, null, window.location.pathname);

                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                } else {
                    console.error('Invalid token format received');
                }
            }
        } catch (error) {
            console.error('Error handling token:', error);
        }
    }, []);

    return (
        <div className={'organizer-template'}>
            <TopNav isLoggedIn={checkLoggedIn()}/>
            <OrganizerNavBar />
            <div className={'organizer-template-outlet-wrapper'}>
                <Outlet />
            </div>
        </div>
    )
}

export default OrganizerTemplate