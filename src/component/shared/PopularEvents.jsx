import {useEffect} from "react";
import {eventAxios} from "../../config/axiosConfig.js";
import cookie from "react-cookies";

function PopularEvents(){

    useEffect(() => {
        eventAxios.get(`/event/trends?lat=${cookie.load('user-location').lat}&lon=${cookie.load('user-location').lon}`)
            .then(r => {
                console.log(r.data)
            })
            .catch(err => console.log(err))
    }, []);

    return (
        <div>

        </div>
    )
}

export default PopularEvents;