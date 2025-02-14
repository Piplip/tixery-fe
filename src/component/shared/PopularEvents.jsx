import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";
import cookie from "react-cookies";
import {Stack, Typography} from "@mui/material";
import EventCard from "./EventCard.jsx";

function PopularEvents(){
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if(events.length === 0){
            eventAxios.get(`/event/trends?lat=${cookie.load('user-location').lat}&lon=${cookie.load('user-location').lon}`)
                .then(r => {
                    setEvents(r.data)
                })
                .catch(err => console.log(err))
        }
    }, [events]);

    return (
        <Stack sx={{width: '100%'}} rowGap={3}>
            <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                <Typography fontWeight={'bold'} fontSize={24}>
                    Popular Events
                </Typography>
                <Typography variant={'body2'} className={'link'}>
                    Explore more events
                </Typography>
            </Stack>
            <Stack rowGap={2.5} sx={{alignSelf: 'center'}}>
                {events.map((event, index) => (
                    <EventCard event={event} key={index} horizontal={true} renderAddress={true}/>
                ))}
            </Stack>
        </Stack>
    )
}

export default PopularEvents;