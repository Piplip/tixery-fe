import "../../styles/event-view-styles.css"
import {Avatar, Box, Skeleton, Stack, Typography} from "@mui/material";
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
import {Link, useLoaderData} from "react-router-dom";
import dayjs from "dayjs";
import {lazy, useEffect, useRef, useState} from "react";
import accountAxios from "../../config/axiosConfig.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage} from "firebase/storage";
import {fetchImage, transformNumber} from "../../common/Utilities.js";
import MoreRelatedByOrganizer from "./MoreRelatedByOrganizer.jsx";
import ShareDialog from "./ShareDialog.jsx";
import {Accordion, AccordionDetails, AccordionSummary, Card, CardContent} from "@mui/joy";
import TicketPanel from "./TicketPanel.jsx";
import Map from "./Map.jsx";
import LikeEvent from "./LikeEvent.jsx";
import FollowOrganizer from "./FollowOrganizer.jsx";

const OtherEvents = lazy(() => import('./OtherEvents.jsx'));

initializeApp(firebaseConfig);
const storage = getStorage()

function EventView(){
    const loaderData = useLoaderData();
    const [profile, setProfile] = useState({})
    const [heroImage, setHeroImage] = useState()
    const [viewDetail, setViewDetail] = useState(false)
    const [showMapDetail, setShowMapDetail] = useState(false)
    const isProfileLoaded = useRef(false)

    useEffect(() => {
        if (loaderData.profile_id && !isProfileLoaded.current) {
            isProfileLoaded.current = true;
            accountAxios.get(`/organizer/profile/get?pid=${loaderData.profile_id}`)
                .then(async (response) => {
                    const profileData = { ...response.data };
                    profileData.profile_image_url = await fetchImage(storage, response.data.profile_image_url);
                    setProfile(profileData);
                })
                .catch((error) => console.error("Error loading profile:", error));
        }
    }, [loaderData.profile_id]);

    useEffect(() => {
        if (loaderData.images && loaderData.images.length > 0) {
            try {
                fetchImage(storage, loaderData.images[0])
                    .then((imageUrl) => setHeroImage(imageUrl))
            } catch (error) {
                console.log(error)
            }
        }
        else setHeroImage("https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59")
    }, []);

    const renderOccurrences = () => {
        return (
            <Stack spacing={2}>
                {loaderData.occurrences.map((occurrence, index) => {
                    const tickets = loaderData.tickets.filter(ticket =>
                        loaderData.ticketOccurrences.some(
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
                                            Available tickets
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
                                                        No tickets available
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

    return (
        <>
            {dayjs(loaderData.end_time).isBefore(dayjs()) &&
                <div className={'ended-notify'}>
                    This event has ended
                </div>
            }
            <div className={'event-view'}>
                <div className={'event-view__hero'}>
                    {heroImage ?
                        <div
                            className={'event-view__hero-background'}
                            style={{backgroundImage: `url(${heroImage})`}}>
                            <Stack
                                className={'event-view__hero-stack'}
                                style={{width: '100%', backdropFilter: 'blur(30px)'}}
                                direction={'row'}
                                justifyContent={'center'}>
                                <img
                                    className={'event-view__hero-image'}
                                    alt={'img'}
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
                    <TicketPanel tickets={loaderData.tickets} eventEndTime={loaderData.end_time} image={heroImage}
                        eventStartTime={loaderData.start_time} eventName={loaderData.name}
                    />
                    <Stack style={{width: '60%'}} rowGap={6}>
                        <div>
                            <Stack
                                className={'event-view__info-bar'}
                                direction={'row'}
                                justifyContent={'space-between'}>
                                <p className={'event-view__date'}>{dayjs(loaderData.start_time).format("dddd, DD MMMM YYYY")}</p>
                                <Stack
                                    className={'event-view__actions'}
                                    direction={'row'}
                                    columnGap={2}>
                                    <LikeEvent event={loaderData} imageUrl={heroImage} />
                                    <ShareDialog  link={"foo"}/>
                                </Stack>
                            </Stack>
                            <Stack className={'event-view__description'} rowGap={3}>
                                <p className={'event-view__title'}>{loaderData.name}</p>
                                <p className={'event-view__summary'}>
                                    {loaderData.short_description}
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
                                            alt={'avatar'} />
                                        <Stack>
                                            <p className={'event-view__organizer-name'}>
                                                By <Link to={`/o/${profile.custom_url || profile.profile_id}`}>
                                                <b>{profile.profile_name}</b>
                                            </Link> · {transformNumber(profile.total_followers)} followers
                                            </p>
                                            <div className={'event-view__organizer-stats'}>
                                                {profile.total_event_hosted ? <p><b>{profile.total_event_hosted}</b> events hosted</p>
                                                    : <p><b>{profile.total_attendee_hosted}</b> attendees hosted</p>
                                                } <ShowChartIcon />
                                            </div>
                                        </Stack>
                                    </Stack>
                                    <FollowOrganizer profileImage={profile.profile_image_url} organizerID={loaderData.profile_id} organizerName={profile.profile_name}/>
                                </Stack>
                            </Stack>
                        </div>
                        {viewDetail ?
                            <>
                                <Stack className={'event-view__details'} rowGap={1}>
                                    <p className={'event-view__details-heading'}>Date and Time</p>
                                    {loaderData.is_recurring ?
                                        renderOccurrences()
                                        :
                                        <div className={'event-view__details-date'}>
                                            <EventIcon sx={{fontSize: 32}}/> {dayjs(loaderData.start_time).format("dddd, DD MMMM")} · {dayjs(loaderData.start_time).format("HH:mm")} - {dayjs(loaderData.end_time).format("HH:mm")}
                                            {` GMT+${loaderData.timezone}`}
                                        </div>
                                    }
                                </Stack>
                                <Stack className={'event-view__location'} rowGap={1}>
                                    <p className={'event-view__location-heading'}>Location</p>
                                    <Stack columnGap={1}
                                           className={'event-view__location-content'}
                                           direction={'row'}>
                                        <LocationOnIcon sx={{fontSize: 32}} className={'event-view__location-icon'} />
                                        <Stack rowGap={.5}>
                                            <p className={'event-view__location-name'}>
                                                {loaderData.location.name}
                                            </p>
                                            <Stack className={'event-view__location-address'} rowGap={1}>
                                                {loaderData?.location?.locationType === 'online' ?
                                                    <>
                                                        <p>Online event</p>
                                                        {loaderData?.location.access !== 'holder' &&
                                                            <Link to={`/online/${loaderData.event_id}`} className={'link'} target={'_blank'}>
                                                                View details
                                                            </Link>
                                                        }
                                                    </>
                                                    :
                                                    <>
                                                        {loaderData.location.location.replace(new RegExp(loaderData.location.name + ', ', 'g'), '')}
                                                        <div className={'event-view__location-map'} onClick={() => setShowMapDetail(prev => !prev)}>
                                                            Show map {showMapDetail ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                        </div>
                                                    </>
                                                }
                                            </Stack>
                                            {showMapDetail && <Map latitude={loaderData.location.lat} longitude={loaderData.location.lon}
                                                locationName={loaderData.location.name}
                                            />}
                                        </Stack>
                                    </Stack>
                                </Stack>
                                {loaderData?.refund_policy &&
                                    <Stack className={'event-view__refund-policy'} rowGap={1}>
                                        <p className={'event-view__refund-policy-heading'}>Refund policy</p>
                                        <div>
                                            {loaderData.refund_policy.allowRefund ?
                                                <Typography variant={'body1'}>Refunds up to <b>{loaderData.refund_policy.daysForRefund} days</b> before event</Typography>
                                                :
                                                "No refunds"
                                            }
                                        </div>
                                    </Stack>
                                }
                                <Stack className={'event-view__about'} rowGap={2}>
                                    <p className={'event-view__about-heading'}>About this event</p>
                                    <Stack alignItems={'center'} columnGap={1}
                                           className={'event-view__about-duration'}
                                           direction={'row'}>
                                        <TimelapseIcon /> <p>Event lasts <b>{dayjs(loaderData.end_time).diff(loaderData.start_time, 'hour', true)} hours</b></p>
                                    </Stack>
                                    <div className={'render-html'} dangerouslySetInnerHTML={{__html: loaderData.full_description}}></div>
                                </Stack>
                                {loaderData.tags &&
                                    <Stack rowGap={1}>
                                        <p className={'event-view__about-heading'}>Tags</p>
                                        <Stack direction={'row'} columnGap={1}>
                                            {loaderData.event_type &&
                                                <div className={'event-view__tag'}>
                                                    {loaderData.event_type}
                                                </div>
                                            }
                                            {loaderData.category &&
                                                <div className={'event-view__tag'}>
                                                {loaderData.category}
                                                </div>
                                            }
                                            {loaderData.sub_category &&
                                                <div className={'event-view__tag'}>
                                                    {loaderData.sub_category}
                                                </div>
                                            }
                                            {loaderData.tags.map((tag, index) => {
                                                return (
                                                    <div key={index} className={'event-view__tag'}>
                                                        #{tag}
                                                    </div>
                                                )
                                            })}
                                        </Stack>
                                    </Stack>
                                }
                                {loaderData?.faq.length !== 0 &&
                                    <Stack className={'event-view__faqs'} rowGap={1}>
                                        <p className={'event-view__faqs-heading'}>FAQs</p>
                                        <Stack rowGap={1}>
                                            {loaderData.faq.map((faq, index) => (
                                                <Accordion key={index} sx={{borderBottom: '1px solid', paddingBottom: 1}}>
                                                    <AccordionSummary>
                                                        <Typography className={'event-view__faq-question'} fontSize={'.95rem'}>
                                                            {faq.question}
                                                        </Typography>
                                                    </AccordionSummary>
                                                    <AccordionDetails sx={{paddingTop: 1}}>
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
                                    <p className={'event-view__organizer-title'}>Organized by</p>
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
                                                        alt={'avatar'} />
                                                <Stack rowGap={.25}>
                                                    <Link to={`/o/${profile.custom_url || profile.profile_id}`}>
                                                        <p className={'event-view__organizer-name'}>
                                                            <b>{profile.profile_name}</b>
                                                        </p>
                                                    </Link>
                                                    <p className={'event-view__organizer-followers'}>
                                                        <b>{transformNumber(profile.total_followers)}</b> followers
                                                    </p>
                                                    <p className={'event-view__organizer-attendees'}>
                                                        {profile.total_event_hosted ?
                                                            <>
                                                                <b>{profile.total_event_hosted}</b> events hosted
                                                            </>
                                                            :
                                                            <>
                                                                <b>{transformNumber(profile.total_attendee_hosted)}</b> attendees hosted
                                                            </>
                                                        }
                                                    </p>
                                                </Stack>
                                            </Stack>
                                            <Stack alignItems={'center'} columnGap={2}
                                                   className={'event-view__organizer-buttons'}
                                                   direction={'row'}>
                                                <button className={'event-view__contact-button'}>
                                                    Contact
                                                </button>
                                                <FollowOrganizer profileImage={profile.profile_image_url} organizerID={loaderData.profile_id} organizerName={profile.profile_name}/>
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
                                    </Stack>
                                    <Stack alignSelf={'center'}
                                           className={'event-view__report'}
                                           direction={'row'}>
                                        <FlagIcon /> Report this event
                                    </Stack>
                                </Stack>
                            </>
                            :
                            <Stack justifyContent={'center'} alignItems={'center'}>
                                <button className={'event-view__view-detail-btn'} onClick={() => setViewDetail(true)}>
                                    View all event details
                                </button>
                            </Stack>
                        }
                        {loaderData.event_id && profile.profile_id &&
                            <MoreRelatedByOrganizer id={loaderData.event_id} name={profile.profile_name} customURL={profile.custom_url}
                                                    profileID={profile.profile_id}/>
                        }
                    </Stack>
                </div>
            </div>
            <div style={{paddingInline: '10%', backgroundColor: '#ececec', paddingBlock: '1rem 2rem', marginBlock: '2rem'}}>
                <OtherEvents />
            </div>
        </>
    )
}

export default EventView