import {IconButton, Stack, Typography} from "@mui/material";
import EventCard from "../shared/EventCard.jsx";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import {useEffect, useState} from "react";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

function AttendeeFollowedEvents(){
    const [followedEvents, setFollowedEvents] = useState([]);
    const navigate = useNavigate();
    const {t} = useTranslation()

    useEffect(() => {
        if(followedEvents.length === 0){
            eventAxiosWithToken.post(`/event/followed`, sessionStorage.getItem('followed-organizer'))
                .then(r => {
                    console.log(r.data)
                    setFollowedEvents(r.data)
                })
                .catch(err => console.log(err))
        }
    }, []);

    return (
        <Stack sx={{ padding: '7.5rem 10%' }} rowGap={3}>
            <Stack direction={'row'} columnGap={2} alignItems={'center'}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography fontSize={'1.8rem'} fontWeight={'bold'}>{t('followedEvents.eventsFromFollowedOrganizers')}</Typography>
            </Stack>
            <Stack rowGap={3}>
                {followedEvents?.length > 0 ?
                    followedEvents.map((event, index) => {
                        return (
                            <EventCard key={index} event={event} horizontal={true} showAction={true} renderAddress={true} />
                        )
                    })
                    :
                    <Stack alignItems={'center'} rowGap={3} marginTop={10}>
                        <BeenhereIcon sx={{ width: '7.5rem', height: '7.5rem', backgroundColor: '#ecf6e1', padding: 2, borderRadius: '50%', color: 'limegreen' }} />
                        <Stack textAlign={'center'}>
                            <Typography variant={'h5'} fontWeight={'bold'}>{t('followedEvents.addEventsShareFriends')}</Typography>
                            <Typography variant={'body1'}>{t('followedEvents.easyPeasy')}</Typography>
                        </Stack>
                    </Stack>
                }
            </Stack>
        </Stack>
    );
}

export default AttendeeFollowedEvents;