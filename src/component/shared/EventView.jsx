import "../../styles/event-view-styles.css"
import {Avatar, Box, Button, Drawer, Skeleton, Stack, Typography} from "@mui/material";
import ShowChartIcon from '@mui/icons-material/ShowChart';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import XIcon from '@mui/icons-material/X';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LanguageIcon from '@mui/icons-material/Language';
import FlagIcon from '@mui/icons-material/Flag';
import {Link, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {lazy, useEffect, useRef, useState} from "react";
import accountAxios from "../../config/axiosConfig.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage} from "firebase/storage";
import {checkLoggedIn, collectData, fetchImage, transformNumber} from "../../common/Utilities.js";
import MoreRelatedByOrganizer from "./MoreRelatedByOrganizer.jsx";
import ShareDialog from "./ShareDialog.jsx";
import {Accordion, AccordionDetails, AccordionSummary, Card, CardContent} from "@mui/joy";
import TicketPanel from "./TicketPanel.jsx";
import Map from "./Map.jsx";
import LikeEvent from "./LikeEvent.jsx";
import FollowOrganizer from "./FollowOrganizer.jsx";
import {useTranslation} from "react-i18next";
import PropTypes from "prop-types";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

const OtherEvents = lazy(() => import('./OtherEvents.jsx'));

initializeApp(firebaseConfig);
const storage = getStorage()

EventView.propTypes = {
    data: PropTypes.object
}

function EventView({data}){
    const location = useLocation()
    const navigate = useNavigate()
    const loaderData = useLoaderData()
    const eventData = location.pathname.includes("preview") ? data : loaderData;
    const [profile, setProfile] = useState({})
    const [heroImage, setHeroImage] = useState()
    const [viewDetail, setViewDetail] = useState(false)
    const [showMapDetail, setShowMapDetail] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const isProfileLoaded = useRef(false)
    const {t} = useTranslation()

    useEffect(() => {
        if (eventData.profile_id && !isProfileLoaded.current) {
            isProfileLoaded.current = true;
            accountAxios.get(`/organizer/profile/get?pid=${eventData.profile_id}`)
                .then(async (response) => {
                    const profileData = { ...response.data };
                    profileData.profile_image_url = await fetchImage(storage, response.data.profile_image_url);
                    setProfile(profileData);
                })
                .catch((error) => console.error("Error loading profile:", error));
        }
    }, [eventData.profile_id]);

    useEffect(() => {
        if (eventData.images && eventData.images.length > 0) {
            try {
                fetchImage(storage, eventData.images[0])
                    .then((imageUrl) => setHeroImage(imageUrl))
            } catch (error) {
                console.log(error)
            }
        }
        else setHeroImage("https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59")
    }, []);

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setIsDrawerOpen(open);
    };

    const renderOccurrences = () => {
        return (
            <Stack spacing={2}>
                {eventData.occurrences.map((occurrence, index) => {
                    const tickets = eventData.tickets.filter(ticket =>
                        eventData.ticketOccurrences.some(
                            to =>
                                to.occurrence_id === occurrence.occurrence_id &&
                                to.ticket_type_id === ticket.ticket_type_id
                        )
                    );

                    return (
                        <Card key={index} variant="outlined">
                            <CardContent>
                                <Stack spacing={1}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <EventIcon sx={{ fontSize: 32 }} />
                                        <Typography fontSize={18} fontFamily={'Roboto Slab'} fontWeight={450}>
                                            {dayjs(occurrence.start_date).format("dddd, DD MMMM YYYY")} ·{" "}
                                            {dayjs(occurrence.start_time, "HH:mm:ss").format("HH:mm")} -{" "}
                                            {dayjs(occurrence.end_time, "HH:mm:ss").format("HH:mm")}
                                        </Typography>
                                    </Stack>
                                    <Box ml={5}>
                                        <Typography variant="subtitle1" color="textSecondary">
                                            {t('eventView.availableTickets')}
                                        </Typography>
                                        <ul style={{ marginLeft: "1.5rem" }}>
                                            {tickets.length > 0 ? (
                                                tickets.map((ticket, idx) => (
                                                    <li key={idx}>
                                                        <Typography variant="body2">{ticket.name}</Typography>
                                                    </li>
                                                ))
                                            ) : (
                                                <li>
                                                    <Typography variant="body2">
                                                        {t('eventView.noTicketsAvailable')}
                                                    </Typography>
                                                </li>
                                            )}
                                        </ul>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stack>
        );
    };

    const RenderEventState = () => {
        if(eventData.created_at && dayjs(eventData.created_at).isSame(dayjs().subtract(1, 'date'), 'day')){
            return (
                <div className={'event-state new'}>
                    {t('eventView.newEvent')}
                </div>
            )
        }
    }

    return (
        <>
            {dayjs(eventData.end_time).isBefore(dayjs()) &&
                <div className={'ended-notify'}>
                    {t('eventView.eventEnded')}
                </div>
            }
            <div className={'event-view'}>
                <div className={'event-view__hero'}>
                    {heroImage ?
                        <div
                            className={'event-view__hero-background'}
                            style={{ backgroundImage: `url(${heroImage})` }}>
                            <Stack
                                className={'event-view__hero-stack'}
                                style={{ width: '100%', backdropFilter: 'blur(30px)' }}
                                direction={'row'}
                                justifyContent={'center'}>
                                <img
                                    className={'event-view__hero-image'}
                                    alt={t('eventView.heroImage')}
                                    src={heroImage}
                                />
                            </Stack>
                        </div>
                        :
                        <Skeleton
                            animation="wave"
                            width={'80%'}
                            variant={'rectangular'}
                            height={'100%'}
                        />
                    }
                </div>
                <div className={'event-view__content'}>
                    <Stack className={'event-view__main-content'} rowGap={6}>
                        <Stack direction={'row'} justifyContent={'space-between'} columnGap={5}>
                            <Stack rowGap={3}>
                                <RenderEventState />
                                <Stack
                                    className={'event-view__info-bar'}
                                    direction={'row'}
                                    justifyContent={'space-between'}>
                                    <p className={'event-view__date'}>{dayjs(eventData.start_time).format("dddd, DD MMMM YYYY")}</p>
                                    <Stack
                                        className={'event-view__actions'}
                                        direction={'row'}
                                        columnGap={2}>
                                        {eventData && <LikeEvent event={eventData} imageUrl={heroImage} />}
                                        <ShareDialog link={"foo"} />
                                    </Stack>
                                </Stack>
                                <Stack className={'event-view__description'} rowGap={3}>
                                    <p className={'event-view__title'}>{eventData.name}</p>
                                    <p className={'event-view__summary'}>
                                        {eventData.short_description}
                                    </p>
                                    <Stack
                                        className={'event-view__organizer'}
                                        direction={'row'}
                                        justifyContent={'space-between'}>
                                        <Stack columnGap={2} alignItems={'center'}
                                               className={'event-view__organizer-details'}
                                               direction={'row'}>
                                            <Avatar src={profile.profile_image_url}
                                                    className={'event-view__organizer-avatar'}
                                                    alt={t('eventView.avatar')} />
                                            <Stack>
                                                <p className={'event-view__organizer-name'}>
                                                    {t('eventView.by')}
                                                    <b onClick={() => {
                                                        collectData(eventData.event_id, 'view-organizer', null, profile.profile_id)
                                                        navigate(`/o/${profile.custom_url || profile.profile_id}`)
                                                    }}
                                                    >{profile.profile_name}</b> · {transformNumber(profile.total_followers)} {t('eventView.followers')}
                                                </p>
                                                <div className={'event-view__organizer-stats'}>
                                                    {profile.total_event_hosted ? <p><b>{profile.total_event_hosted}</b> {t('eventView.eventsHosted')}</p>
                                                        : <p><b>{profile.total_attendee_hosted}</b> {t('eventView.attendeesHosted')}</p>
                                                    } <ShowChartIcon />
                                                </div>
                                            </Stack>
                                        </Stack>
                                        <FollowOrganizer profileImage={profile.profile_image_url} organizerID={eventData.profile_id} organizerName={profile.profile_name} />
                                    </Stack>
                                </Stack>
                                <Stack justifyContent={'center'} alignItems={'center'}>
                                    <button className={'event-view__view-detail-btn'} onClick={() => setViewDetail(prev => !prev)}>
                                        {viewDetail ? t('eventView.hideDetails') : t('eventView.viewAllDetails')}
                                    </button>
                                </Stack>
                            </Stack>
                            <TicketPanel tickets={eventData?.tickets} eventEndTime={eventData.end_time} image={heroImage}
                                         eventStartTime={eventData.start_time} eventName={eventData.name} isLoggedIn={checkLoggedIn()}
                            />
                        </Stack>
                        {viewDetail &&
                            <>
                                <Stack className={'event-view__details'} rowGap={1}>
                                    <p className={'event-view__details-heading'}>{t('eventView.dateAndTime')}</p>
                                    {eventData.is_recurring ?
                                        renderOccurrences()
                                        :
                                        <div className={'event-view__details-date'}>
                                            <EventIcon sx={{ fontSize: 32 }} /> {dayjs(eventData.start_time).format("dddd, DD MMMM")} · {dayjs(eventData.start_time).format("HH:mm")} - {dayjs(eventData.end_time).format("HH:mm")}
                                            {` GMT+${eventData.timezone}`}
                                        </div>
                                    }
                                </Stack>
                                <Stack className={'event-view__location'} rowGap={1}>
                                    <p className={'event-view__location-heading'}>{t('eventView.location')}</p>
                                    <Stack columnGap={1}
                                           className={'event-view__location-content'}
                                           direction={'row'}>
                                        <LocationOnIcon sx={{ fontSize: 32 }} className={'event-view__location-icon'} />
                                        <Stack rowGap={.5}>
                                            <p className={'event-view__location-name'}>
                                                {eventData.location.name}
                                            </p>
                                            <Stack className={'event-view__location-address'} rowGap={1}>
                                                {eventData?.location?.locationType === 'online' ?
                                                    <>
                                                        <p>{t('eventView.onlineEvent')}</p>
                                                        {eventData?.location.access !== 'holder' &&
                                                            <Link to={`/online/${eventData.event_id}`} className={'link'} target={'_blank'}>
                                                                {t('eventView.viewDetails')}
                                                            </Link>
                                                        }
                                                    </>
                                                    :
                                                    <>
                                                        {eventData.location.location.replace(new RegExp(eventData.location.name + ', ', 'g'), '')}
                                                        <div className={'event-view__location-map'} onClick={() => setShowMapDetail(prev => !prev)}>
                                                            {t('eventView.showMap')} {showMapDetail ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                        </div>
                                                    </>
                                                }
                                            </Stack>
                                            {showMapDetail && <Map latitude={eventData.location.lat} longitude={eventData.location.lon}
                                                                   locationName={eventData.location.name}
                                            />}
                                        </Stack>
                                    </Stack>
                                </Stack>
                                {eventData?.refund_policy &&
                                    <Stack className={'event-view__refund-policy'} rowGap={1}>
                                        <p className={'event-view__refund-policy-heading'}>{t('eventView.refundPolicy')}</p>
                                        <div>
                                            {eventData.refund_policy.allowRefund ?
                                                <Typography variant={'body1'}>{t('eventView.refundsUpTo')} <b>{eventData.refund_policy.daysForRefund} {t('eventView.daysBeforeEvent')}</b></Typography>
                                                :
                                                t('eventView.noRefunds')
                                            }
                                        </div>
                                    </Stack>
                                }
                                <Stack className={'event-view__about'} rowGap={2}>
                                    <p className={'event-view__about-heading'}>{t('eventView.aboutThisEvent')}</p>
                                    <Stack alignItems={'center'} columnGap={1}
                                           className={'event-view__about-duration'}
                                           direction={'row'}>
                                        <TimelapseIcon />
                                        <p>{t('eventView.eventLasts')} <b>{dayjs(eventData.end_time).diff(eventData.start_time, 'hour', false)} {t('eventView.hours')}</b></p>
                                    </Stack>
                                    <div className={'render-html'} dangerouslySetInnerHTML={{ __html: eventData.full_description }}></div>
                                </Stack>
                                {(eventData.tags || eventData.category || eventData.sub_category || eventData.event_type) &&
                                    <Stack rowGap={1}>
                                        <p className={'event-view__about-heading'}>{t('eventView.tags')}</p>
                                        <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
                                            {eventData.event_type &&
                                                <div className={'event-view__tag'}>
                                                    {t(`event-category.${eventData.event_type}`)}
                                                </div>
                                            }
                                            {eventData.category &&
                                                <Link to={`/events/search?category=${eventData.category}`}>
                                                    <div className={'event-view__tag'}>
                                                        {t(`event-category.${eventData.category}`)}
                                                    </div>
                                                </Link>
                                            }
                                            {eventData.sub_category &&
                                                <Link to={`/events/search?category=${eventData.category}&sub_category=${eventData.sub_category}`}>
                                                    <div className={'event-view__tag'}>
                                                        {t(`event-category.${eventData.sub_category}`)}
                                                    </div>
                                                </Link>
                                            }
                                            {eventData?.tags?.length > 0 && eventData.tags.map((tag, index) => {
                                                return (
                                                    <div key={index} className={'event-view__tag'}>
                                                        #{tag.trim()}
                                                    </div>
                                                )
                                            })}
                                        </Stack>
                                    </Stack>
                                }
                                {eventData?.faq &&
                                    <Stack className={'event-view__faqs'} rowGap={1}>
                                        <p className={'event-view__faqs-heading'}>{t('eventView.faqs')}</p>
                                        <Stack rowGap={1}>
                                            {eventData.faq.map((faq, index) => (
                                                <Accordion key={index} sx={{ borderBottom: '1px solid', paddingBottom: 1 }}>
                                                    <AccordionSummary>
                                                        <Typography className={'event-view__faq-question'} fontSize={'.95rem'}>
                                                            {faq.question}
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails sx={{ paddingTop: 1 }}>
                                                        <Typography className={'event-view__faq-answer'} fontSize={'.95rem'}>
                                                            {faq.answer}
                                                        </Typography>
                                                    </AccordionDetails>
                                                </Accordion>
                                            ))}
                                        </Stack>
                                    </Stack>
                                }
                                <Stack className={'event-view__organizer-info'} rowGap={2}>
                                    <p className={'event-view__organizer-title'}>{t('eventView.organizedBy')}</p>
                                    <Stack className={'event-view__organizer-overview'} rowGap={5}>
                                        <Stack
                                            direction={'row'}
                                            justifyContent={'space-between'}>
                                            <Stack alignItems={'center'}
                                                   className={'event-view__organizer-header'}
                                                   direction={'row'}
                                                   columnGap={2}>
                                                <Avatar src={profile.profile_image_url}
                                                        className={'event-view__organizer-avatar'}
                                                        alt={t('eventView.avatar')} />
                                                <Stack rowGap={.25}>
                                                    <p className={'event-view__organizer-name'}
                                                        onClick={() => {
                                                            collectData(eventData.event_id, 'view-organizer', null, profile.profile_id)
                                                            navigate(`/o/${profile.custom_url || profile.profile_id}`)
                                                        }}
                                                    >
                                                        <b>{profile.profile_name}</b>
                                                    </p>
                                                    <p className={'event-view__organizer-followers'}>
                                                        <b>{transformNumber(profile.total_followers)}</b> {t('eventView.followers')}
                                                    </p>
                                                    <p className={'event-view__organizer-attendees'}>
                                                        {profile.total_event_hosted ?
                                                            <>
                                                                <b>{profile.total_event_hosted}</b> {t('eventView.eventsHosted')}
                                                            </>
                                                            :
                                                            <>
                                                                <b>{transformNumber(profile.total_attendee_hosted)}</b> {t('eventView.attendeesHosted')}
                                                            </>
                                                        }
                                                    </p>
                                                </Stack>
                                            </Stack>
                                            <Stack alignItems={'center'} columnGap={2}
                                                   className={'event-view__organizer-buttons'}
                                                   direction={'row'}>
                                                <button className={'event-view__contact-button'}>
                                                    {t('eventView.contact')}
                                                </button>
                                                <FollowOrganizer profileImage={profile.profile_image_url} organizerID={eventData.profile_id} organizerName={profile.profile_name} />
                                            </Stack>
                                        </Stack>
                                        <p className={'event-view__organizer-description'}>
                                            {profile.description}
                                        </p>
                                        <Stack alignSelf={'center'} columnGap={3} color={'#797979'}
                                               className={'event-view__social-links'}
                                               direction={'row'}>
                                            {profile['social_media_links'] && profile['social_media_links'].split(',').map((link, index) => {
                                                return (
                                                    <Link to={link} key={index} target={'_blank'}>
                                                        {link.includes('facebook') ?
                                                            <FacebookRoundedIcon /> :
                                                            link.includes('x') ? <XIcon /> : <LanguageIcon />
                                                        }
                                                    </Link>
                                                )
                                            })}
                                        </Stack>
                                        <Stack alignSelf={'center'}
                                               className={'event-view__report'}
                                               direction={'row'}>
                                            <FlagIcon /> {t('eventView.reportThisEvent')}
                                        </Stack>
                                    </Stack>
                                </Stack>
                            </>
                        }
                        {eventData.event_id && profile.profile_id &&
                            <MoreRelatedByOrganizer id={eventData.event_id} name={profile.profile_name} customURL={profile.custom_url}
                                                    profileID={profile.profile_id} />
                        }
                    </Stack>
                </div>
                <button onClick={toggleDrawer(true)} className="event-view__open-ticket-drawer-button">
                    {t('eventView.showTickets')}
                </button>
            </div>
            <div className={'event-view__other-events'}>
                <OtherEvents />
            </div>
            <Drawer
                anchor={'bottom'}
                open={isDrawerOpen}
                onClose={toggleDrawer(false)}
                className="event-view__ticket-drawer"
            >
                <div className="event-view__ticket-drawer-content">
                    <TicketPanel
                        tickets={eventData?.tickets}
                        eventEndTime={eventData.end_time}
                        image={heroImage}
                        eventStartTime={eventData.start_time}
                        eventName={eventData.name}
                        isLoggedIn={checkLoggedIn()}
                    />
                    <Button onClick={toggleDrawer(false)}>Close</Button>
                </div>
            </Drawer>
        </>
    );
}

export default EventView