import "../../styles/attendee-favorite-styles.css"
import BeenhereIcon from '@mui/icons-material/Beenhere';
import {Stack, Typography} from "@mui/material";
import EventCard from "../shared/EventCard.jsx";
import {useEffect, useState} from "react";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

AttendeeFavoriteEvents.propTypes = {
    isSubComponent: PropTypes.bool
}

function AttendeeFavoriteEvents({isSubComponent = false}){
    const [favoriteEvents, setFavoriteEvents] = useState([]);
    const {t} = useTranslation()

    useEffect(() => {
        if(sessionStorage.getItem('liked-event')?.length > 0){
            eventAxiosWithToken.post(`/event/favorite/get`, sessionStorage.getItem('liked-event'))
                .then(r => {
                    setFavoriteEvents(r.data)
                })
                .catch(err => console.log(err))
        }
    }, []);

    return (
        <div className={isSubComponent ? 'attendee-favorite' : 'attendee-favorite-f'}>
            {!isSubComponent && <Typography variant={'h3'} fontWeight={'bold'}>{t('attendeeFavorites.likeEvents')}</Typography>}
            <Stack gap={3} className={isSubComponent ? 'attendee-favorite-sub' : 'attendee-favorite-sub-f'} flexDirection={isSubComponent ? 'row' : 'column'}>
                {favoriteEvents?.length > 0 ?
                    favoriteEvents.map((event, index) => {
                        return (
                            <EventCard key={index} event={event} horizontal={!isSubComponent} renderAddress={true} />
                        )
                    })
                    :
                    <Stack alignItems={'center'} rowGap={3}>
                        <BeenhereIcon sx={{ width: '7.5rem', height: '7.5rem', backgroundColor: '#ecf6e1', padding: 2, borderRadius: '50%', color: 'limegreen' }} />
                        <Stack textAlign={'center'}>
                            <Typography variant={'h5'} fontWeight={'bold'}>{t('attendeeFavorites.addEventsShareFriends')}</Typography>
                            <Typography variant={'body1'}>{t('attendeeFavorites.easyPeasy')}</Typography>
                        </Stack>
                    </Stack>
                }
            </Stack>
        </div>
    );
}

export default AttendeeFavoriteEvents;