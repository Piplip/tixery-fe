import {Outlet} from "react-router-dom";
import OrganizerNavBar from "../organizer/OrganizerNavBar.jsx";
import '../../styles/organizer-template-styles.css'
import TopNav from "../shared/TopNav.jsx";
import {useEffect} from "react";
import {checkLoggedIn} from "@/common/Utilities.js";

function OrganizerTemplate(){

    useEffect(() => {
        if (window.location.hash && window.location.hash.startsWith('#token=')) {
            try {
                const token = decodeURIComponent(window.location.hash.slice(7));

                if (token && token.split('.').length === 3) {
                    localStorage.setItem('tk', token);

                    const cleanUrl = window.location.pathname + window.location.search;
                    window.history.replaceState({}, document.title, cleanUrl);

                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            } catch (error) {
                console.error('Token processing error:', error);
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