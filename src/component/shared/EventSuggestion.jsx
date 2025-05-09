import {Button, Stack, Typography} from "@mui/material";
import PropTypes from "prop-types";
import {useEffect, useRef, useState} from "react";
import {eventAxios, rootAxios} from "../../config/axiosConfig.js";
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
    lon: PropTypes.string,
    maxCols: PropTypes.number
}

function EventSuggestion({type, value, lat, lon, maxCols = 4}){
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {t} = useTranslation()
    const userLocation = useRef()

    useEffect(() => {
        const fetchEvents = async () => {
            if (type) {
                setIsLoading(true);
                let latValue = lat;
                let lonValue = lon;

                if (latValue === undefined || lonValue === undefined) {
                    userLocation.current = await rootAxios.get('https://ipinfo.io/json');
                    if (userLocation.current) {
                        latValue = userLocation.current.data.loc.split(',')[0];
                        lonValue = userLocation.current.data.loc.split(',')[1];
                    }
                }

                const payload = {
                    lat: latValue,
                    lon: lonValue,
                    val: value
                };

                if (type === 'self' && checkLoggedIn()) {
                    payload['pid'] = getUserData('profileID');
                }

                try {
                    const response = await eventAxios.get(fetchType[type]?.path + '?' + new URLSearchParams(payload));
                    setEvents(response.data);
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 400);
                } catch (err) {
                    setIsLoading(false);
                }
            }
        };

        fetchEvents();
    }, [type, value, lat, lon]);

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
                        <Grid container spacing={3.25} columns={{ xs: 4 * maxCols }}>
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