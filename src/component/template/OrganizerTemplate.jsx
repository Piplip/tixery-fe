import {Outlet} from "react-router-dom";
import OrganizerNavBar from "../organizer/OrganizerNavBar.jsx";
import '../../styles/organizer-template-styles.css'
import TopNav from "../shared/TopNav.jsx";
import {useEffect} from "react";

function OrganizerTemplate(){
    useEffect(() => {
        const token = window.location.hash

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
    }, [])

    return (
        <div className={'organizer-template'}>
            <TopNav isLoggedIn={!!localStorage.getItem('tk')}/>
            <OrganizerNavBar />
            <div className={'organizer-template-outlet-wrapper'}>
                <Outlet />
            </div>
        </div>
    )
}

export default OrganizerTemplate