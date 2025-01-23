import PropTypes from "prop-types";
import {Stack, Typography} from "@mui/material";
import EventCard from "./EventCard.jsx";
import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";

MoreRelatedByOrganizer.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    customURL: PropTypes.string,
    profileID: PropTypes.number
}

function MoreRelatedByOrganizer({id, name, customURL, profileID}) {
    const [relateEvents, setRelatedEvents] = useState([]);

    useEffect(() => {
        eventAxios.get(`/get/related?eid=${id}`)
            .then(r => {
                setRelatedEvents(r.data)
            })
            .catch(err => console.log(err))
    }, []);

    return (
        relateEvents.length !== 0 &&
            <Stack rowGap={2}>
                <Typography variant="h5" fontWeight={'bold'}>More {name} events</Typography>
                <Stack direction={'row'} rowGap={5} sx={{flexWrap: 'wrap'}}>
                    {relateEvents.map((event, index) => {
                        return <EventCard key={index} event={event} organizer={name} id={profileID} customURL={customURL} horizontal={true}/>
                    })}
                </Stack>
            </Stack>
    )
}

export default MoreRelatedByOrganizer