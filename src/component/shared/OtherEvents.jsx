import {IconButton, Stack, Typography} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import {useEffect, useState} from "react";
import {eventAxios} from "../../config/axiosConfig.js";
import EventCard from "./EventCard.jsx";
import Grid from "@mui/material/Grid2";

function OtherEvents(){
    const [events, setEvents] = useState(null)
    const [currentPage, setCurrentPage] = useState(0);
    const eventsPerPage = 4;

    useEffect(() => {
        if(events === null) {
            eventAxios.get(`/get/suggested?limit=12`)
                .then(r => {
                    setEvents(r.data)
                })
                .catch(err => console.log(err))
        }
    }, []);

    const handleNext = () => {
        if (currentPage < Math.ceil(events?.length / eventsPerPage) - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const startIndex = currentPage * eventsPerPage;
    const displayedEvents = events?.slice(startIndex, startIndex + eventsPerPage);

    return (
        <Stack rowGap={3}>
            <Stack direction={'row'} justifyContent={'space-between'}>
                <Typography variant={'h5'} fontWeight={'bold'}>
                    Other events you may like
                </Typography>
                <Stack direction={'row'} columnGap={2}>
                    <IconButton onClick={handlePrev} disabled={currentPage === 0}>
                        <ArrowBackIcon />
                    </IconButton>
                    <IconButton onClick={handleNext} disabled={currentPage >= Math.ceil(events?.length / eventsPerPage) - 1}>
                        <ArrowForwardIcon />
                    </IconButton>
                </Stack>
            </Stack>
            <Stack>
                <Grid container spacing={2} columns={{xs: 16}} columnGap={2}>
                    {displayedEvents?.length > 0 && displayedEvents.map((event, index) => (
                        <Grid key={index} size={4}>
                            <EventCard event={event} organizer={event.profileName} id={event.profile_id}/>
                        </Grid>
                    ))}
                </Grid>
            </Stack>
        </Stack>
    )
}

export default OtherEvents