import {Button, Stack, Typography} from "@mui/material";
import PropTypes from "prop-types";
import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";
import Grid from "@mui/material/Grid2";
import EventCard from "./EventCard.jsx";
import EventFetching from "./EventFetching.jsx";
import {useTranslation} from "react-i18next";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";

const fetchType = {
    cost: {
        path: '/events/cost',
        titleKey: 'eventSuggestion.costTitle'
    },
    online: {
        path: '/events/online',
        titleKey: 'eventSuggestion.onlineTitle'
    },
    time: {
        path: '/events/time',
        titleKey: 'eventSuggestion.timeTitle'
    },
    category: {
        path: '/events/type',
        titleKey: 'eventSuggestion.categoryTitle'
    },
    self: {
        titleKey: 'eventSuggestion.selfTitle',
        path: '/get/suggested'
    }
};

EventSuggestion.propTypes = {
    type: PropTypes.string,
    value: PropTypes.any,
    lat: PropTypes.string,
    lon: PropTypes.string
}

function EventSuggestion({type, value, lat, lon}){
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {t} = useTranslation()

    useEffect(() => {
        if(type) {
            setIsLoading(true)
            const payload = {
                lat: lat, lon: lon, val: value
            }
            if(type === 'self' && checkLoggedIn()){
                payload['pid'] = getUserData('profileID')
            }
            eventAxios.get(fetchType[type]?.path + '?' + new URLSearchParams(payload))
                .then(response => {
                    setEvents(response.data)
                    setTimeout(() => {
                        setIsLoading(false)
                    }, 400)
                })
                .catch(error => {
                    console.log(error)
                })
        }
    }, [type, value]);

    function renderTitle() {
        if (type === 'time') {
            if (value === 'today') {
                return t('eventSuggestion.todayEvents');
            } else {
                return t('eventSuggestion.eventsThis', { value: t(`eventSuggestion.${value}`) });
            }
        } else if (type === 'category') {
            return t('eventSuggestion.categoryEvents', { value: t(`eventSuggestion.${value}`) });
        }
        else if (type === 'cost') {
            return value === 0 ? t('eventSuggestion.freeEvents') : t('eventSuggestion.eventsUnder', { value: value });
        }
        else {
            return t(fetchType[type]?.titleKey);
        }
    }

    return (
        <Stack rowGap={4.5}>
            {<Typography fontSize={27.5} fontFamily={'Raleway'} fontWeight={'bold'}>{renderTitle()}</Typography>}
            {isLoading ?
                <EventFetching rows={2} cols={4} />
                :
                events.length !== 0 ?
                    <>
                        <Grid container spacing={3.25} columns={{ xs: 12 }}>
                            {events.map((event, index) => (
                                <Grid item key={index} size={4}>
                                    <EventCard event={event} showAction={true} renderAddress={true} organizer={event.profileName} id={event.profile_id} />
                                </Grid>
                            ))}
                        </Grid>
                        <Button sx={{
                            background: 'transparent', color: 'blue', cursor: 'pointer', padding: '.5rem 1rem', border: '1px solid blue', width: '50%',
                            alignSelf: 'center',
                            '&:hover': {
                                background: '#3b51be',
                                color: 'white'
                            }
                        }}>
                            {t('eventSuggestion.seeMore')}
                        </Button>
                    </>
                    :
                    <Stack alignItems={'center'} paddingBlock={10} border={'2px solid gray'}>
                        <Typography variant={'h5'}>{t('eventSuggestion.noEventsFound')}</Typography>
                    </Stack>
            }
        </Stack>
    );
}

export default EventSuggestion;