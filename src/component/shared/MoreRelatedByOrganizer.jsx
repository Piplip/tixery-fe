import PropTypes from "prop-types";
import {Stack, Typography} from "@mui/material";
import EventCard from "./EventCard.jsx";
import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";

MoreRelatedByOrganizer.propTypes = {
    id: PropTypes.string.isRequired,
    name: PropTypes.string
}

function MoreRelatedByOrganizer({id, name}) {
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
                <Stack direction={'row'} gap={3} sx={{flexWrap: 'wrap'}}>
                    {relateEvents.map((event, index) => {
                        return <EventCard key={index} event={event} organizer={name}/>
                    })}
                </Stack>
            </Stack>
    )
}

export default MoreRelatedByOrganizer