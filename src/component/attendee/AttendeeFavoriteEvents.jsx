import "../../styles/attendee-favorite-styles.css"
import BeenhereIcon from '@mui/icons-material/Beenhere';
import {Stack, Typography} from "@mui/material";
import EventCard from "../shared/EventCard.jsx";
import {useEffect, useState} from "react";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import PropTypes from "prop-types";

AttendeeFavoriteEvents.propTypes = {
    isSubComponent: PropTypes.bool
}

function AttendeeFavoriteEvents({isSubComponent = false}){
    const [favoriteEvents, setFavoriteEvents] = useState([]);

    useEffect(() => {
        if(sessionStorage.getItem('liked-event')?.length > 0){
            eventAxiosWithToken.post(`/event/favorite/get`, sessionStorage.getItem('liked-event'))
                .then(r => {
                    setFavoriteEvents(r.data)
                })
                .catch(err => console.log(err))
        }
    }, []);

    return(
        <div className={isSubComponent ? 'attendee-favorite' : 'attendee-favorite-f'}>
            {!isSubComponent && <Typography variant={'h3'} fontWeight={'bold'}>Like Events</Typography>}
            <Stack rowGap={3} className={isSubComponent ? 'attendee-favorite-sub' : 'attendee-favorite-sub-f'} flexDirection={isSubComponent ? 'row' : 'column'}>
                {favoriteEvents?.length > 0 ?
                    favoriteEvents.map((event, index) => {
                        return(
                            <EventCard key={index} event={event} horizontal={!isSubComponent} renderAddress={true}/>
                        )
                    })
                    :
                    <Stack alignItems={'center'} rowGap={3}>
                        <BeenhereIcon sx={{width: '7.5rem', height: '7.5rem', backgroundColor: '#ecf6e1', padding: 2, borderRadius: '50%', color: 'limegreen'}}/>
                        <Stack textAlign={'center'}>
                            <Typography variant={'h5'} fontWeight={'bold'}>Add events, share with friends!</Typography>
                            <Typography variant={'body1'}>Easy peasy</Typography>
                        </Stack>
                    </Stack>
                }
            </Stack>
        </div>
    )
}

export default AttendeeFavoriteEvents;