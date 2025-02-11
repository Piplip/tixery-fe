import {Button, Stack, Typography} from "@mui/material";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";
import Grid from "@mui/material/Grid2";
import EventCard from "./EventCard.jsx";

const fetchType = {
    cost: {
        path: '/events/cost',
        title: ''
    },
    online: {
        path: '/events/online',
        title: 'Online events'
    },
    time: {
        path: '/events/time',
        title: 'Events '
    },
    category: {
        path: '/events/type',
        title: ''
    }
}

EventSuggestion.propTypes = {
    type: PropTypes.string,
    value: PropTypes.any,
    lat: PropTypes.string,
    lon: PropTypes.string
}

function EventSuggestion({type, value, lat, lon}){
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if(type) {
            const payload = {
                lat: lat, lon: lon, val: value
            }
            eventAxios.get(fetchType[type]?.path + '?' + new URLSearchParams(payload))
                .then(response => {
                    console.log(response.data)
                    setEvents(response.data)
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }, [type, value]);

    function renderTitle(){
        if(type === 'time'){
            if(value === 'today'){
                return 'Today events'
            } else {
                return `Events this ${value}`
            }
        } else if(type === 'category'){
            return `${value} events`
        }
        else if(type === 'cost'){
            return value === 0 ? 'Free events' : `Events under $${value}`
        }
        else{
            return fetchType[type]?.title
        }
    }

    return (
        <Stack rowGap={2}>
            <Typography variant={'h5'} fontWeight={'bold'}>{renderTitle()}</Typography>
            {events.length !== 0 ?
                <>
                    <Grid container spacing={3.25} columns={{xs: 16}}>
                        {events.map((event, index) => (
                            <Grid item key={index} size={4}>
                                <EventCard event={event} showAction={true} renderAddress={true} organizer={event.profileName} id={event.profile_id}/>
                            </Grid>
                        ))}
                    </Grid>
                    <Button sx={{background: 'transparent', color: 'blue', cursor: 'pointer', padding: '.5rem 1rem', border: '1px solid blue', width: '50%',
                        alignSelf: 'center',
                        '&:hover': {
                            background: '#3b51be',
                            color: 'white'
                        }
                    }}>
                        See more
                    </Button>
                </>
                :
                <Stack alignItems={'center'} paddingBlock={10} border={'2px solid gray'}>
                    <Typography variant={'h5'}>No events found</Typography>
                </Stack>
            }
        </Stack>
    )
}

export default EventSuggestion;