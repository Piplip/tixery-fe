import {Outlet} from "react-router-dom";
import OrganizerNavBar from "../organizer/OrganizerNavBar.jsx";
import '../../styles/organizer-template-styles.css'
import TopNav from "../shared/TopNav.jsx";
import {useEffect} from "react";
import {checkLoggedIn} from "@/common/Utilities.js";

function OrganizerTemplate(){

    useEffect(() => {
        const hash = window.location.hash.substring(1);

        if (hash.startsWith('token=')) {
            const token = hash.substring(6);

            try {
                if (token && token.split('.').length === 3) {
                    console.log("Token found, storing in localStorage");
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