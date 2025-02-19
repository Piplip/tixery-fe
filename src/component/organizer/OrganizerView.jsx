import "../../styles/organizer-view-styles.css"
import {Avatar, Stack, Typography} from "@mui/material";
import {Link, useLoaderData} from "react-router-dom";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {useCallback, useEffect, useRef, useState} from "react";
import LoadingFallback from "../shared/LoadingFallback.jsx";
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import XIcon from '@mui/icons-material/X';
import LanguageIcon from '@mui/icons-material/Language';
import {transformNumber} from "../../common/Utilities.js";
import {eventAxios} from "../../config/axiosConfig.js";
import dayjs from "dayjs";
import EventCard from "../shared/EventCard.jsx";
import Grid from '@mui/material/Grid2';
import FollowOrganizer from "../shared/FollowOrganizer.jsx";
import {useTranslation} from "react-i18next";

initializeApp(firebaseConfig);
const storage = getStorage()

function OrganizerView() {
    const {t} = useTranslation()
    const data = useLoaderData();
    const [profileImage, setProfileImage] = useState(null);
    const [profileEvents, setProfileEvents] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    const hasFetchedProfileEvents = useRef(false);

    const totalUpcoming = profileEvents?.reduce((acc, event) => {
        return dayjs(event.start_time).isAfter(dayjs()) ? acc + 1 : acc;
    }, 0)

    const loadImage = useCallback(async (url) => {
        if (!url) return null;
        if (url.includes('googleusercontent')) return url;
        try {
            const storageRef = ref(storage, url);
            return await getDownloadURL(storageRef);
        } catch (error) {
            return null;
        }
    }, [storage]);

    useEffect(() => {
        if (data['profile_image_url']) {
            loadImage(data['profile_image_url']).then((url) => {
                setProfileImage(url === null ? "https://img.evbuc.com/https%3A%2F%2Fcdn.evbuc.com%2Fimages%2F936315053%2F558993483103%2F1%2Foriginal.20250115-135317?crop=focalpoint&fit=crop&auto=format%2Ccompress&q=75&sharp=10&fp-x=0.5&fp-y=0.5&s=3a03308f50db1e157ca93403975dcc59" : url)
            });
        } else {
            setProfileImage("#");
        }
    }, [data, loadImage]);

    useEffect(() => {
        if (data.profile_id && profileEvents === null && !hasFetchedProfileEvents.current) {
            hasFetchedProfileEvents.current = true;
            eventAxios.get(`/get/profile?pid=${data.profile_id}`)
                .then(r => {
                    setProfileEvents(r.data);
                })
                .catch(err => console.log(err));
        }
    }, [data.profile_id, profileEvents]);

    return (
        profileImage ?
            <div className={'organizer-view-wrapper'}>
                {data &&
                    <div className={'organizer-view-hero'}>
                        <div className={'organizer-view-hero__img-wrapper'}>
                            <img className={'organizer-view-hero__img'}
                                 src={(profileImage || profileImage !== "#") || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZdM4Naw6g6mBZtWbsk8r4u0DEauhmvKrpFg&s'}
                                 alt={t('organizerView.heroImageAlt')} />
                        </div>
                        <Stack className={'organizer-view-hero__main'} alignItems={'center'} rowGap={3}>
                            <Stack alignItems={'center'} rowGap={2}>
                                <Avatar sx={{ width: '10rem', height: '10rem', fontSize: '5rem' }}
                                        src={profileImage}
                                        alt={t('organizerView.profileAlt')}>
                                    {data['profile_name'].split(' ')[0][0]}
                                </Avatar>
                                <p className={'organizer-view-hero__profile-title'}>
                                    {data['profile_name']}
                                </p>
                            </Stack>
                            <Stack direction={'row'} columnGap={1}>
                                <FollowOrganizer profileImage={profileImage} organizerID={data.profile_id} organizerName={data['profile_name']} />
                                <button>{t('organizerView.contact')}</button>
                            </Stack>
                            <Stack direction={'row'} textAlign={'center'}>
                                <Stack style={{ borderRight: '1px solid', paddingRight: '1rem', marginRight: '1rem' }}>
                                    <Typography variant={'h6'} fontWeight={'bold'}>
                                        {transformNumber(data['total_followers'])}
                                    </Typography>
                                    <Typography variant={'subtitle1'} color={'#3a3a3a'} fontSize={'.85rem'}>
                                        {t('organizerView.followers')}
                                    </Typography>
                                </Stack>
                                <Stack>
                                    <Typography variant={'h6'} fontWeight={'bold'}>
                                        {data['total_event_hosted']}
                                    </Typography>
                                    <Typography variant={'subtitle1'} color={'#3a3a3a'} fontSize={'.85rem'}>
                                        {t('organizerView.totalEvents')}
                                    </Typography>
                                </Stack>
                            </Stack>
                            <Stack rowGap={1}>
                                <p className={'organizer-view-hero__profile-description'}>
                                    {data['description']}
                                </p>
                                <Stack direction={'row'} alignSelf={'center'} flexGrow={1} marginTop={5} columnGap={2}>
                                    {data['social_media_links'] && data['social_media_links'].split(',').map((link, index) => {
                                        return (
                                            <Link to={link} key={index} target={'_blank'}>
                                                {link.includes('facebook') ?
                                                    <FacebookRoundedIcon sx={{ color: 'blue' }} /> :
                                                    link.includes('x') ? <XIcon /> : <LanguageIcon />
                                                }
                                            </Link>
                                        )
                                    })}
                                </Stack>
                            </Stack>
                        </Stack>
                    </div>
                }
                <Stack className={'organizer-view-main'}>
                    <div style={{ borderBottom: '3px solid #c2c2c2', paddingBottom: '.5rem', marginBottom: '2rem' }}>
                        <p style={{ borderBottom: '3px solid #ff2d2d', display: 'inline', paddingBottom: '.5rem', fontSize: '1.25rem' }}>
                            {t('organizerView.events')}</p>
                    </div>
                    <p className={'organizer-view-main__title'}>{t('organizerView.events')}</p>
                    <Stack className={'event-category-wrapper'} direction={'row'} columnGap={1}>
                        <p className={activeTab === 0 ? 'active' : ''} onClick={() => setActiveTab(0)}>{t('organizerView.upcoming')} ({totalUpcoming})</p>
                        <p className={activeTab === 1 ? 'active' : ''} onClick={() => setActiveTab(1)}>{t('organizerView.past')} ({profileEvents?.length - totalUpcoming})</p>
                    </Stack>
                    <div>
                        {profileEvents?.length > 0 &&
                            <Grid container spacing={5} columns={{ xs: 16 }} style={{ marginTop: '1rem' }}>
                                {
                                    profileEvents.map((event, index) => {
                                        const condition = dayjs(event.start_time).isAfter(dayjs());
                                        if (activeTab === 0) {
                                            return condition &&
                                                <Grid size={4} key={index}>
                                                    <EventCard event={event} organizer={data['profile_name']} customURL={data['custom_url']} id={data['profile_id']} />
                                                </Grid>
                                        }
                                        else {
                                            return !condition &&
                                                <Grid size={4} key={index}>
                                                    <EventCard event={event} organizer={data['profile_name']} customURL={data['custom_url']} id={data['profile_id']} />
                                                </Grid>
                                        }
                                    })
                                }
                            </Grid>
                        }
                    </div>
                </Stack>
            </div>
            :
            <LoadingFallback />
    );
}

export default OrganizerView