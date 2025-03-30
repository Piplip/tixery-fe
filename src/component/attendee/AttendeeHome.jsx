import AttendeeHero from "./AttendeeHero.jsx";
import BrowseEvents from "./BrowseEvents.jsx";
import {useEffect, useRef} from "react";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {accountAxiosWithToken, eventAxiosWithToken} from "../../config/axiosConfig.js";
import TopDestination from "../shared/TopDestination.jsx";
import {useNavigate} from "react-router-dom";

function AttendeeHome(){
    const hasCalledAPI = useRef(false)
    const navigate = useNavigate()

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
                sessionStorage.setItem("serverError", JSON.stringify({
                    type: "server-down",
                    message: "Service is unavailable. Please try again later."
                }));

                navigate('/error');
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
            <TopDestination />
        </div>
    )
}

export default AttendeeHome