import "../../styles/event-view-styles.css"
import TopNav from "./TopNav.jsx";
import {Avatar, Stack, Tooltip, Typography} from "@mui/material";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import XIcon from '@mui/icons-material/X';
import LanguageIcon from '@mui/icons-material/Language';
import FlagIcon from '@mui/icons-material/Flag';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function EventView(){
    return (
        <>
            <TopNav enableScrollEffect={true}/>
            <div className={'event-view'}>
                <div className={'event-view__hero'}>
                    <div
                        className={'event-view__hero-background'}
                        style={{backgroundImage: 'url(https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F853404539%2F775342518943%2F1%2Foriginal.20240918-144702?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=e7692b0437fc0bbbb725aef2335123d4)'}}>
                        <Stack
                            className={'event-view__hero-stack'}
                            style={{width: '100%', backdropFilter: 'blur(30px)'}}
                            direction={'row'}
                            justifyContent={'center'}>
                            <img
                                className={'event-view__hero-image'}
                                alt={'img'}
                                src={'https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F853404539%2F775342518943%2F1%2Foriginal.20240918-144702?crop=focalpoint&fit=crop&w=940&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=e7692b0437fc0bbbb725aef2335123d4'}/>
                        </Stack>
                    </div>
                </div>
                <div className={'event-view__content'}>
                    <Stack className={'event-view__registration'} rowGap={2}>
                        <Stack className={'event-view__registration-details'} rowGap={4}>
                            <p className={'event-view__registration-text'}>
                                Registration for one guest and one companion
                            </p>
                            <Stack
                                className={'event-view__registration-controls'}
                                direction={'row'}
                                justifyContent={'space-between'}>
                                <div className={'event-view__registration-price'}>
                                    Free <InfoOutlinedIcon />
                                </div>
                                <Stack
                                    className={'event-view__quantity-controls'}
                                    direction={'row'} alignItems={'center'}
                                    columnGap={1.5}>
                                    <div className={'event-view__quantity-button'}>-</div>
                                    <div className={'event-view__quantity-value'}>1</div>
                                    <div className={'event-view__quantity-button'}>+</div>
                                </Stack>
                            </Stack>
                            <Stack rowGap={1}>
                                <Typography variant={'body2'} alignSelf={'end'}>Sales end on Jan 24, 2025</Typography>
                                <Typography variant={'body1'}>This ticket entitles admittance for one guest and one companion.</Typography>
                            </Stack>
                        </Stack>
                        <button className={'event-view__registration-button'}>
                            Reserve a spot
                        </button>
                    </Stack>
                    <Stack style={{width: '60%'}} rowGap={4}>
                        <div>
                            <Stack
                                className={'event-view__info-bar'}
                                direction={'row'}
                                justifyContent={'space-between'}>
                                <p className={'event-view__date'}>Saturday, January 25 2025</p>
                                <Stack
                                    className={'event-view__actions'}
                                    direction={'row'}
                                    columnGap={2}>
                                    <Tooltip
                                        className={'event-view__action event-view__action--like'}
                                        title={'Like event'}>
                                        <FavoriteBorderIcon />
                                    </Tooltip>
                                    <Tooltip
                                        className={'event-view__action event-view__action--share'}
                                        title={'Share event'}>
                                        <ShareIcon />
                                    </Tooltip>
                                </Stack>
                            </Stack>
                            <Stack className={'event-view__description'} rowGap={3}>
                                <p className={'event-view__title'}>Space for Me: Sensory-Friendly Hour</p>
                                <p className={'event-view__summary'}>
                                    Explore the Goddard Visitor Center during a sensory-friendly hour before we open for the day with limited lights, sounds, and participants.
                                </p>
                                <Stack
                                    className={'event-view__organizer'}
                                    direction={'row'}
                                    justifyContent={'space-between'}>
                                    <Stack columnGap={2} alignItems={'center'}
                                           className={'event-view__organizer-details'}
                                           direction={'row'}>
                                        <Avatar
                                            className={'event-view__organizer-avatar'}
                                            alt={'avatar'} />
                                        <Stack>
                                            <p className={'event-view__organizer-name'}>
                                                By NASA 121.8k followers
                                            </p>
                                            <div className={'event-view__organizer-stats'}>
                                                <p><b>1.5M</b> attendees hosted</p> <ShowChartIcon />
                                            </div>
                                        </Stack>
                                    </Stack>
                                    <button className={'event-view__follow-button'}>
                                        Follow
                                    </button>
                                </Stack>
                            </Stack>
                        </div>
                        <Stack className={'event-view__details'} rowGap={1}>
                            <p className={'event-view__details-heading'}>Date and Time</p>
                            <div className={'event-view__details-date'}>
                                <EventIcon /> Saturday, January 25 · 10:30 - 11:30am EST
                            </div>
                        </Stack>
                        <Stack className={'event-view__location'} rowGap={1}>
                            <p className={'event-view__location-heading'}>Location</p>
                            <Stack columnGap={1}
                                className={'event-view__location-content'}
                                direction={'row'}>
                                <LocationOnIcon className={'event-view__location-icon'} />
                                <Stack rowGap={.5}>
                                    <p className={'event-view__location-name'}>
                                        NASA Goddard Visitor Center
                                    </p>
                                    <p className={'event-view__location-address'}>
                                        9432 Greenbelt Road Greenbelt, MD 20771 United States
                                    </p>
                                    <div className={'event-view__location-map'}>
                                        Show map<KeyboardArrowDownIcon />
                                    </div>
                                </Stack>
                            </Stack>
                        </Stack>
                        <Stack className={'event-view__about'} rowGap={1}>
                            <p className={'event-view__about-heading'}>About this event</p>
                            <Stack alignItems={'center'} columnGap={1}
                                   className={'event-view__about-duration'}
                                   direction={'row'}>
                                <TimelapseIcon /> Event lasts 1 hour
                            </Stack>
                        </Stack>
                        <Stack className={'event-view__organizer-info'} rowGap={2}>
                            <p className={'event-view__organizer-title'}>Organized by</p>
                            <Stack className={'event-view__organizer-overview'} rowGap={5}>
                                <Stack
                                    direction={'row'}
                                    justifyContent={'space-between'}>
                                    <Stack alignItems={'center'}
                                        className={'event-view__organizer-header'}
                                        direction={'row'}
                                        columnGap={2}>
                                        <Avatar
                                            className={'event-view__organizer-avatar'}
                                            alt={'avatar'} />
                                        <Stack rowGap={.25}>
                                            <p className={'event-view__organizer-name'}>NASA</p>
                                            <p className={'event-view__organizer-followers'}>
                                                <b>121.8k</b> followers
                                            </p>
                                            <p className={'event-view__organizer-attendees'}>
                                                <b>1.5M</b> attendees hosted
                                            </p>
                                        </Stack>
                                    </Stack>
                                    <Stack alignItems={'center'} columnGap={2}
                                        className={'event-view__organizer-buttons'}
                                        direction={'row'}>
                                        <button className={'event-view__contact-button'}>
                                            Contact
                                        </button>
                                        <button className={'event-view__follow-button'}>
                                            Follow
                                        </button>
                                    </Stack>
                                </Stack>
                                <p className={'event-view__organizer-description'}>
                                    Explore the universe and discover our home planet with official NASA events on Eventbrite. Join us as we discover and expand knowledge for the benefit of humanity.
                                </p>
                                <Stack alignSelf={'center'} columnGap={3} color={'#797979'}
                                    className={'event-view__social-links'}
                                    direction={'row'}>
                                    <FacebookRoundedIcon />
                                    <XIcon />
                                    <LanguageIcon />
                                </Stack>
                            </Stack>
                            <Stack alignSelf={'center'}
                                className={'event-view__report'}
                                direction={'row'}>
                                <FlagIcon /> Report this event
                            </Stack>
                        </Stack>
                    </Stack>
                </div>
            </div>
        </>
    )
}

export default EventView