import {Outlet} from "react-router-dom";
import OrganizerNavBar from "../organizer/OrganizerNavBar.jsx";
import '../../styles/organizer-template-styles.css'
import TopNav from "../shared/TopNav.jsx";
import {useEffect} from "react";
import {checkLoggedIn} from "@/common/Utilities.js";

function OrganizerTemplate(){

    useEffect(() => {
        try {
            console.log("Checking for token in hash");
            const hash = window.location.hash;

            if (hash.startsWith('#token=')) {
                const token = hash.substring(7);

                if (token && token.split('.').length === 3) {
                    console.log("Token found, storing in localStorage");
                    localStorage.setItem('tk', token);

                    window.history.replaceState(
                        null,
                        document.title,
                        window.location.pathname + window.location.search
                    );

                    window.location.reload();
                }
            }
        } catch (error) {
            console.error('Error checking token:', error);
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