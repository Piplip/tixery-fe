import AttendeeHero from "./AttendeeHero.jsx";
import BrowseEvents from "./BrowseEvents.jsx";
import {useEffect, useRef} from "react";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {accountAxiosWithToken, eventAxiosWithToken} from "../../config/axiosConfig.js";

function AttendeeHome(){
    // TODO: handle the case where user haven't set up roles

    const hasCalledAPI = useRef(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [favoriteEvents, followedOrganizers] = await Promise.all([
                    eventAxiosWithToken.get(`/event/favorite?pid=${getUserData('profileID')}`),
                    accountAxiosWithToken.get(`/follow?pid=${getUserData('profileID')}`)
                ]);

                sessionStorage.setItem('liked-event', JSON.stringify(favoriteEvents.data));
                sessionStorage.setItem('followed-organizer', JSON.stringify(followedOrganizers.data));
            } catch (err) {
                console.log(err);
            }
        };

        if (checkLoggedIn() && !hasCalledAPI.current) {
            hasCalledAPI.current = true;
            fetchData();
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