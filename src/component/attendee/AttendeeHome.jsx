import AttendeeHero from "./AttendeeHero.jsx";
import BrowseEvents from "./BrowseEvents.jsx";
import {useEffect, useRef} from "react";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";

function AttendeeHome(){
    // TODO: handle the case where user haven't set up roles

    const hasCalledAPI = useRef(false)

    useEffect(() => {
        if(checkLoggedIn() && !hasCalledAPI.current){
            hasCalledAPI.current = true
            eventAxiosWithToken.get(`/event/favorite?pid=${getUserData('profileID')}`)
                .then(r => {
                    sessionStorage.setItem('liked-event', JSON.stringify(r.data))
                })
                .catch(err => console.log(err))
        }
    }, []);

    return (
        <div>
            <AttendeeHero />
            <BrowseEvents />
        </div>
    )
}

export default AttendeeHome