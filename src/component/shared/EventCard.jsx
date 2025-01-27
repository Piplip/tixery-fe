import PropTypes from "prop-types";
import {Stack} from "@mui/material";
import "../../styles/event-card-styles.css"
import dayjs from "dayjs";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage, ref, getDownloadURL} from "firebase/storage";
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareDialog from "./ShareDialog.jsx";

EventCard.propTypes = {
    event: PropTypes.shape({
        name: PropTypes.string,
        start_time: PropTypes.string,
        price: PropTypes.string,
        images: PropTypes.array,
        event_id: PropTypes.string,
        customURL: PropTypes.string
    }),
    organizer: PropTypes.string,
    id: PropTypes.number,
    customURL: PropTypes.string,
    horizontal: PropTypes.bool
}

initializeApp(firebaseConfig);
const storage = getStorage()

function EventCard ({ event, organizer, id, customURL, horizontal }) {
    const [imageUrl, setImageUrl] = useState(null)

    useEffect(() => {
        if(event?.images?.length > 0) {
            const imageRef = ref(storage, event.images[0])
            getDownloadURL(imageRef)
                .then(url => {
                    setImageUrl(url)
                })
                .catch(err => console.log(err))
        }
    }, []);

    const EventAction = () => {
        return (
            <Stack className={`event-card__action ${horizontal ? 'event-card__action-horizontal' : ''} `} direction={'row'} onClick={e => e.stopPropagation()}>
                <FavoriteBorderIcon />
                <ShareDialog eventID={event.event_id}/>
            </Stack>
        )
    }

    return (
        <Stack className="event-card" onClick={() => window.location.href = `/events/${event.event_id}`}
            flexDirection={horizontal ? 'row' : 'column'} style={horizontal ? {width: 'clamp(38rem, 100%, 45rem)'} : {width: 'clamp(18rem, 100%, 22rem)'}}
        >
            <Stack style={{position: 'relative'}}>
                <img className="event-card__image" style={horizontal ? {width: '15rem', height: '10rem', borderRadius: '1rem 0 0 1rem'} : {}}
                     src={imageUrl || "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59"}
                     alt={"foo"}/>
                {!horizontal && <EventAction />}
            </Stack>
            <Stack rowGap={.5} padding={'0 1rem 1rem 1rem'} marginTop={1}>
                <p className="event-card__title">{event.name}</p>
                <p className="event-card__date">{dayjs(event.start_time).format("ddd, DD MMM")} • {dayjs(event.start_time).format("HH:mm [GMT]Z")}</p>
                <p className="event-card__price">{event.price === 'Free' ? 'Free ' : `From $${event.price}`}</p>
                <Link to={`/o/${customURL || id}`} className="event-card__organizer" target={'_blank'}
                    onClick={(e) => e.stopPropagation()}
                >
                    <p className="event-card__organizer">{organizer}</p>
                </Link>
            </Stack>
            {horizontal && <EventAction />}
        </Stack>
    )
}

export default EventCard