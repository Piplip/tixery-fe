import {useLoaderData} from "react-router-dom";
import "../../styles/attendee-favorite-styles.css"
import BeenhereIcon from '@mui/icons-material/Beenhere';
import {Stack, Typography} from "@mui/material";
import EventCard from "../shared/EventCard.jsx";

function AttendeeFavorite(){
    const loaderData = useLoaderData()

    console.log(loaderData)

    return(
        <Stack className={'attendee-favorite'} rowGap={3}>
            <Typography variant={'h3'} fontWeight={'bold'}>Like Events</Typography>
            <Stack alignItems={'center'} rowGap={3}>
                {loaderData.length > 0 ?
                    loaderData.map((event, index) => {
                        return(
                            <EventCard key={index} event={event} horizontal={true} showAction={false} renderAddress={true}/>
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
        </Stack>
    )
}

export default AttendeeFavorite;