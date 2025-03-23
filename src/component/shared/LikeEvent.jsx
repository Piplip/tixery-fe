import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {Button, Dialog, DialogContent, IconButton, Snackbar, Stack, Tooltip, Typography} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useRef, useState} from "react";
import dayjs from "dayjs";
import {Link} from "react-router-dom";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

LikeEvent.propTypes = {
    imageUrl: PropTypes.string,
    event: PropTypes.shape({
        event_id: PropTypes.string,
        name: PropTypes.string,
        start_time: PropTypes.string,
    })
}

function LikeEvent({imageUrl, event}){
    const {t} = useTranslation()
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

    const snackbarAction = (
        <>
            <Button color="secondary" size="small" onClick={(e) => {
                e.stopPropagation()
                setOpenSnackbar(false)
                setLiked(false)
                undoClick.current = true
            }}>
                UNDO
            </Button>
            <IconButton size="small"
                onClick={handleCloseSnackbar}
            >
                <CloseIcon fontSize="small" />
            </IconButton>
        </>
    );

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
            <Snackbar anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      open={openSnackbar}
                      autoHideDuration={6000}
                      onClose={e => {
                          handleCloseSnackbar();
                          e.stopPropagation();
                      }}
                      message={t('saveEventDialog.addedToSaved')}
                      action={snackbarAction}
            />
            <Dialog onClose={handleClose} open={open} fullWidth={true} maxWidth={'md'}>
                <IconButton
                    onClick={e => {
                        handleClose();
                        e.stopPropagation();
                    }}
                    sx={{ position: 'absolute', right: 8, top: 8, }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ marginTop: 2, fontFamily: 'Nunito' }}>
                    <Stack alignItems={'center'} rowGap={4}>
                        <Typography variant={'h3'} fontWeight={'bold'} fontFamily={'Nunito'}>
                            {t('saveEventDialog.signInToSave')}
                        </Typography>
                        <Stack className="event-card" flexDirection={'row'} style={{ width: 'clamp(30rem, 100%, 35rem)' }}
                        >
                            <Stack style={{ position: 'relative' }}>
                                <img className="event-card__image" style={{ width: '15rem', height: '10rem', borderRadius: '1rem 0 0 1rem' }}
                                     src={imageUrl || "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59"}
                                     alt={t('saveEventDialog.eventImageAlt')} />
                            </Stack>
                            <Stack rowGap={.5} padding={'0 1rem 1rem 1rem'} marginTop={1}>
                                <p className="event-card__title">{event.name}</p>
                                <p className="event-card__date">{dayjs(event.start_time).format("ddd, DD MMM")} • {dayjs(event.start_time).format("HH:mm [GMT]Z")}</p>
                            </Stack>
                        </Stack>
                        <Link to={'/login'}>
                            <Button
                                sx={{
                                    backgroundColor: '#e82727', marginBlock: '1rem', fontSize: '1.25rem',
                                    color: 'white', padding: '.4rem 3rem', textTransform: 'none',
                                    '&:hover': {
                                        backgroundColor: '#d50000'
                                    }
                                }}
                            >
                                {t('saveEventDialog.signIn')}
                            </Button>
                        </Link>
                    </Stack>
                </DialogContent>
            </Dialog>
            <Tooltip className={'event-view__action event-view__action--like'}
                     title={liked ? t('saveEventDialog.unlikeEvent') : t('saveEventDialog.likeEvent')}>
                <FavoriteBorderIcon className={liked ? 'liked-event' : ''} sx={liked ? { color: 'red' } : {}} onClick={e => {
                    handleLikeEvent();
                    e.stopPropagation();
                }} />
            </Tooltip>
        </>
    );
}

export default LikeEvent