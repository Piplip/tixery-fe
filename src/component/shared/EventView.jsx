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
import {Link, useLoaderData} from "react-router-dom";
import dayjs from "dayjs";
import {useEffect, useState} from "react";
import accountAxios from "../../config/axiosConfig.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage} from "firebase/storage";
import {fetchImage} from "../../common/Utilities.js";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import MoreRelatedByOrganizer from "./MoreRelatedByOrganizer.jsx";
import ShareDialog from "./ShareDialog.jsx";

initializeApp(firebaseConfig);
const storage = getStorage()

function EventView(){
    const loaderData = useLoaderData();
    const [profile, setProfile] = useState({})
    const [heroImage, setHeroImage] = useState()
    const [expandedTickets, setExpandedTickets] = useState({});
    const [viewDetail, setViewDetail] = useState(false)
    const [quantities, setQuantities] = useState(
        loaderData.tickets.reduce((acc, _, index) => ({ ...acc, [index]: 1 }), {})
    );

    useEffect(() => {
        if (loaderData.profile_id && !profile.loaded) {
            accountAxios
                .get(`/organizer/profile/get?pid=${loaderData.profile_id}`)
                .then(async (response) => {
                    response.data.profile_image_url = await fetchImage(storage, response.data.profile_image_url);
                    setProfile({ ...response.data, loaded: true });
                })
                .catch((error) => console.error("Error loading profile:", error));
        }
    }, [loaderData.profile_id, profile.loaded]);

    useEffect(() => {
        if (loaderData.images && loaderData.images.length > 0) {
            try {
                fetchImage(storage, loaderData.images[0])
                    .then((imageUrl) => setHeroImage(imageUrl))
            } catch (error) {
                console.log(error)
            }
        }
    }, []);

    const toggleTicketInfo = (index) => {
        setExpandedTickets((prevState) => ({
            ...prevState,
            [index]: !prevState[index],
        }));
    };

    const handleQuantityChange = (index, operation) => {
        setQuantities((prevState) => {
            const newQuantity = operation === "add" ? prevState[index] + 1 : prevState[index] - 1;
            return { ...prevState, [index]: Math.max(0, newQuantity) };
        });
    };

    const isSaleEndingSoon = (saleEndTime) => {
        const now = dayjs();
        const diffInHours = dayjs(saleEndTime).diff(now, "hour");
        return diffInHours <= 24;
    };

    return (
        <>
            <TopNav enableScrollEffect={true}/>
            {dayjs(loaderData.end_time).isBefore(dayjs()) &&
                <div className={'ended-notify'}>
                    This event has ended
                </div>
            }
            <div className={'event-view'}>
                <div className={'event-view__hero'}>
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
                </div>
                <div className={'event-view__content'}>
                    <Stack className={'event-view__registration'} rowGap={2}>
                        {!dayjs(loaderData.end_time).isBefore(dayjs()) ?
                            dayjs(loaderData.end_time).isBefore(dayjs()) ?
                                <>
                                    {loaderData.tickets.map((ticket, index) => {
                                        const isExpanded = expandedTickets[index];
                                        const quantity = quantities[index];
                                        const saleEndingSoon = isSaleEndingSoon(ticket.sale_end_time);

                                        return (
                                            <Stack key={index} className={'event-view__registration-details'} rowGap={4}>
                                                <p className={'event-view__registration-text'}>
                                                    {ticket.name}
                                                </p>
                                                <Stack
                                                    className={'event-view__registration-controls'}
                                                    direction={'row'}
                                                    justifyContent={'space-between'}>
                                                    <div className={'event-view__registration-price'}>
                                                        {ticket.ticket_type === 'paid' ? `$${ticket.price}` : ticket.ticket_type}
                                                        <Tooltip title="Show more details">
                                                            <InfoOutlinedIcon
                                                                onClick={() => toggleTicketInfo(index)}
                                                                style={{ cursor: "pointer", marginLeft: 1 }}
                                                            />
                                                        </Tooltip>
                                                    </div>
                                                    <Stack
                                                        className={'event-view__quantity-controls'}
                                                        direction={'row'}
                                                        alignItems={'center'}
                                                        columnGap={1.5}>
                                                        <div
                                                            className={`event-view__quantity-button ${
                                                                quantity <= 0 ? "disabled" : ""
                                                            }`}
                                                            onClick={() =>
                                                                quantity > 0 && handleQuantityChange(index, "subtract")
                                                            }
                                                        >
                                                            -
                                                        </div>
                                                        <div className={"event-view__quantity-value"}>{quantity}</div>
                                                        <div
                                                            className={"event-view__quantity-button"}
                                                            onClick={() => handleQuantityChange(index, "add")}
                                                        >
                                                            +
                                                        </div>
                                                    </Stack>
                                                </Stack>
                                                {saleEndingSoon &&
                                                    <div className={'event-view__sale-ending'}>
                                                        <ErrorOutlineOutlinedIcon /> Sale ending soon
                                                    </div>
                                                }
                                                {isExpanded && (
                                                    <Stack rowGap={1}>
                                                        <Typography variant={"body2"} alignSelf={"end"}>
                                                            Sales end on{" "}
                                                            {dayjs(ticket.sale_end_time).format(
                                                                "HH:mm, DD MMMM YYYY"
                                                            )}
                                                        </Typography>
                                                        <Typography variant={"body2"}>{ticket.description}</Typography>
                                                    </Stack>
                                                )}
                                            </Stack>
                                        )
                                    })}
                                    <button className={'event-view__registration-button'}>
                                        Reserve a spot
                                    </button>
                                </>
                                :
                                <div>
                                    <Typography variant={'h6'} textAlign={'center'}>No tickets available</Typography>
                                </div>
                            :
                            <Stack rowGap={2}>
                                <Typography variant={'h6'} textAlign={'center'}>This event has ended</Typography>
                                <button className={'view-more-btn'}>
                                    View more events
                                </button>
                            </Stack>
                        }
                    </Stack>
                    <Stack style={{width: '60%'}} rowGap={4}>
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
                                    <Tooltip
                                        className={'event-view__action event-view__action--like'}
                                        title={'Like event'}>
                                        <FavoriteBorderIcon />
                                    </Tooltip>
                                    <ShareDialog  link={"foo"}/>
                                </Stack>
                            </Stack>
                            <Stack className={'event-view__description'} rowGap={3}>
                                <p className={'event-view__title'}>{loaderData.name}</p>
                                <p className={'event-view__summary'}>
                                    {loaderData.description}
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
                                                By <b>{profile.profile_name}</b> · 121.8k followers
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
                        {viewDetail ?
                            <>
                                <Stack className={'event-view__details'} rowGap={1}>
                                    <p className={'event-view__details-heading'}>Date and Time</p>
                                    <div className={'event-view__details-date'}>
                                        <EventIcon /> {dayjs(loaderData.start_time).format("dddd, DD MMMM")} · {dayjs(loaderData.start_time).format("HH:mm")} - {dayjs(loaderData.end_time).format("HH:mm")}
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
                                                {loaderData.location.location}
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
                                        <TimelapseIcon /> Event lasts {dayjs(loaderData.end_time).subtract(dayjs(loaderData.start_time)).hour()} hours
                                    </Stack>
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
                                                    <p className={'event-view__organizer-name'}>
                                                        <b>{profile.profile_name}</b>
                                                    </p>
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
                        <MoreRelatedByOrganizer id={loaderData.event_id} name={profile.profile_name}/>
                    </Stack>
                </div>
            </div>
        </>
    )
}

export default EventView