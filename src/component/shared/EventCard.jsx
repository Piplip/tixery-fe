import PropTypes from "prop-types";
import {Button, Dialog, DialogContent, IconButton, Snackbar, Stack, Typography} from "@mui/material";
import "../../styles/event-card-styles.css"
import dayjs from "dayjs";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage, ref, getDownloadURL} from "firebase/storage";
import {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareDialog from "./ShareDialog.jsx";
import CloseIcon from "@mui/icons-material/Close";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";

EventCard.propTypes = {
    event: PropTypes.shape({
        name: PropTypes.string,
        start_time: PropTypes.string,
        price: PropTypes.string,
        images: PropTypes.array,
        event_id: PropTypes.string,
        customURL: PropTypes.string,
        location: PropTypes.shape({
            location: PropTypes.string
        })
    }),
    organizer: PropTypes.string,
    id: PropTypes.number,
    customURL: PropTypes.string,
    horizontal: PropTypes.bool,
    showAction: PropTypes.bool,
    renderAddress: PropTypes.bool
}

initializeApp(firebaseConfig);
const storage = getStorage()

function EventCard ({ event, organizer, id, customURL, horizontal, showAction = true, renderAddress}) {
    const [imageUrl, setImageUrl] = useState(null)
    const [open, setOpen] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [liked, setLiked] = useState(sessionStorage.getItem('liked-event')?.includes(event.event_id));

    const undoClick = useRef(false)

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpenSnackbar(false);
    };

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

    const snackbarAction = (
        <>
            <Button color="secondary" size="small" onClick={() => {
                setOpenSnackbar(false)
                setLiked(false)
                undoClick.current = true
            }}>
                UNDO
            </Button>
            <IconButton
                size="small"
                color="inherit"
                onClick={handleCloseSnackbar}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </>
    );

    const EventAction = () => {
        return (
            showAction &&
            <Stack className={`event-card__action ${horizontal ? 'event-card__action-horizontal' : ''} `} direction={'row'}>
                <FavoriteBorderIcon className={liked ? 'liked-event' : ''} sx={liked ? {color: 'red'} : {}} onClick={e => {
                    handleLikeEvent()
                    e.stopPropagation()
                }}/>
                <ShareDialog eventID={event.event_id}/>
            </Stack>
        )
    }

    function handleLikeEvent(){
        if(!checkLoggedIn()){
            setOpen(true)
        }
        else{
            if(!liked){
                setLiked(prev => !prev)
                setOpenSnackbar(true)
                setTimeout(() => {
                    if(!undoClick.current){
                        eventAxiosWithToken.post(`/event/favorite/add?eid=${event.event_id}&pid=${getUserData('profileID')}`)
                            .then(r => {
                                console.log(r.data)
                            })
                            .catch(err => console.log(err))
                    }
                }, 6000)
            }
            else{
                setLiked(prev => !prev)
                undoClick.current = true
                eventAxiosWithToken.post(`/event/favorite/del?eid=${event.event_id}&pid=${getUserData('profileID')}`)
                    .then(r => {
                        console.log(r.data)
                    })
                    .catch(err => console.log(err))
            }
        }
    }

    return (
        <>
            <Snackbar anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                message="Added to your saved events"
                action={snackbarAction}
            />
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
                    {renderAddress && <p className={'event-card__address'}>{event.location.location}</p>}
                    <Link to={`/o/${customURL || id}`} className="event-card__organizer" target={'_blank'}
                          onClick={(e) => e.stopPropagation()}
                    >
                        <p className="event-card__organizer">{organizer}</p>
                    </Link>
                </Stack>
                {horizontal && <EventAction />}
            </Stack>
            <Dialog onClose={handleClose} open={open} fullWidth={true} maxWidth={'md'}>
                <IconButton
                    onClick={handleClose}
                    sx={{position: 'absolute', right: 8, top: 8,}}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{marginTop: 2, fontFamily: 'Nunito'}}>
                    <Stack alignItems={'center'} rowGap={4}>
                        <Typography variant={'h3'} fontWeight={'bold'} fontFamily={'Nunito'}>
                            Sign in to save this event
                        </Typography>
                        <Stack className="event-card" flexDirection={'row'} style={{width: 'clamp(30rem, 100%, 35rem)'}}
                        >
                            <Stack style={{position: 'relative'}}>
                                <img className="event-card__image" style={{width: '15rem', height: '10rem', borderRadius: '1rem 0 0 1rem'}}
                                     src={imageUrl || "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59"}
                                     alt={"foo"}/>
                            </Stack>
                            <Stack rowGap={.5} padding={'0 1rem 1rem 1rem'} marginTop={1}>
                                <p className="event-card__title">{event.name}</p>
                                <p className="event-card__date">{dayjs(event.start_time).format("ddd, DD MMM")} • {dayjs(event.start_time).format("HH:mm [GMT]Z")}</p>
                            </Stack>
                        </Stack>
                        <Button
                            sx={{
                                backgroundColor: '#e82727', marginBlock: '1rem', fontSize: '1.25rem',
                                color: 'white', padding: '.4rem 3rem', textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#d50000'
                                }
                            }}
                        >
                            Sign in
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default EventCard