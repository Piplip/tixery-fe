import {Avatar, Stack} from "@mui/material";
import {Link, useLoaderData} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import accountAxios from "../../config/axiosConfig.js";
import {fetchImage, transformNumber} from "../../common/Utilities.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage} from "firebase/storage";
import "../../styles/online-event-page-styles.css"
import {CalendarIcon} from "@mui/x-date-pickers";
import dayjs from "dayjs";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FollowOrganizer from "../shared/FollowOrganizer.jsx";
import PropTypes from "prop-types";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import XIcon from "@mui/icons-material/X";
import LanguageIcon from "@mui/icons-material/Language";
import relativeTime from 'dayjs/plugin/relativeTime'
import {useTranslation} from "react-i18next";

dayjs.extend(relativeTime)

initializeApp(firebaseConfig);
const storage = getStorage()

OnlineEventPage.propTypes = {
    preview: PropTypes.bool
}

function OnlineEventPage({preview}){
    const loaderData = useLoaderData();
    const [profile, setProfile] = useState({})
    const isProfileLoaded = useRef(false)
    const [heroImage, setHeroImage] = useState()
    const {t} = useTranslation()

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

    const renderOnlineContent = () => {
        const content = loaderData.location?.data;
	if(!!content) return
        return content.map((item, index) => {
            switch (item.type) {
                case 'text':
                    return (
                        <div key={index} dangerouslySetInnerHTML={{ __html: item.content.val }}
                             className="online-event__content-text">
                        </div>
                    );
                case 'image':
                    return (
                        <img className="online-event__content-image"
                             key={index} src={item.content.link} alt="content image" />
                    );
                case 'video':
                    return (
                        <div dangerouslySetInnerHTML={{ __html: item.content.url }}
                             className="online-event__content-video" key={index}>
                        </div>
                    );
                case 'link':
                    return (
                        <Link to={item.content.url} target="_blank" key={index}
                              className="online-event__content-link">
                            <p>{item.content.title}</p>
                        </Link>
                    );
                case 'live':
                    return (
                        <Stack direction={'row'} columnGap={2} key={index}>
                            <div className="online-event__live">
                                <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                                    <h3>{item.content.title}</h3>
                                    <div style={{
                                        backgroundColor: 'black', color: 'white', padding: '.1rem .5rem', borderRadius: '1rem'
                                        , fontFamily: 'Nunito', fontSize: 14
                                    }}>
                                        {t('onlineEventElementLive.starts')} {dayjs(loaderData.start_time).fromNow()}
                                    </div>
                                </Stack>
                                <Stack rowGap={1} className="online-event__live-details">
                                    <Stack direction={'row'} alignItems={'center'} columnGap={.5}>
                                        <CalendarIcon /> {dayjs(loaderData.start_time).format('DD/MM/YYYY')}
                                    </Stack>
                                    <Stack direction={'row'} alignItems={'center'} columnGap={.5}>
                                        <AccessTimeIcon /> {dayjs(loaderData.start_time).format('HH:mm')} - {dayjs(loaderData.end_time).format('HH:mm')}
                                    </Stack>
                                </Stack>
                                <p dangerouslySetInnerHTML={{ __html: item.content.description }}></p>
                                <Link to={item.content.url} className="online-event__live-link">
                                    {t('onlineEventElementLive.openIn')} <OpenInNewIcon sx={{ fontSize: 16 }} />
                                </Link>
                            </div>
                            <Stack rowGap={2} sx={{ minWidth: '25%', padding: '1rem', backgroundColor: 'rgba(239,239,239,0.46)' }}>
                                <Avatar src={profile.profile_image_url} sx={{ width: '4rem', height: '4rem' }}
                                        alt={t('onlineEventElementLive.avatar')} />
                                <p className={'event-view__organizer-name'}>
                                    {t('onlineEventElementLive.organizedBy')} <Link to={`/o/${profile.custom_url || profile.profile_id}`} target={'_blank'}>
                                    <b>{profile.profile_name}</b>
                                </Link>  <br />
                                    {transformNumber(profile.total_followers)} {t('onlineEventElementLive.followers')}
                                </p>
                                <Stack columnGap={1.25} color={'#797979'}
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
                                <Stack alignItems={'center'} columnGap={1}
                                       className={'event-view__organizer-buttons'}
                                       direction={'row'}>
                                    <button className={'event-view__contact-button'}>
                                        {t('onlineEventElementLive.contact')}
                                    </button>
                                    <FollowOrganizer profileImage={profile.profile_image_url} organizerID={loaderData.profile_id} organizerName={profile.profile_name} />
                                </Stack>
                            </Stack>
                        </Stack>
                    );
                default:
                    return null;
            }
        });
    };

    return (
        <Stack className={`online-event ${preview ? 'online-event--preview' : ''}`}>
            {preview && (
                <div className="online-event__preview-banner">{t('onlineEvent.previewMode')}</div>
            )}
            <div className="online-event__hero" style={{ height: '60dvh' }}>
                <img src={heroImage} alt={t('onlineEvent.eventImage')} className="online-event__hero-image" />
                <div className="online-event__hero-text">
                    <h1>{loaderData.name}</h1>
                    <p>{loaderData.short_description}</p>
                    <p>{t('onlineEvent.eventType')}: {loaderData.event_type}</p>
                    <p>{t('onlineEvent.startTime')}: {dayjs(loaderData.start_time).format('DD/MM/YYYY HH:mm')}</p>
                    {loaderData.show_end_time && (
                        <p>{t('onlineEvent.endTime')}: {dayjs(loaderData.end_time).format('DD/MM/YYYY HH:mm')}</p>
                    )}
                </div>
            </div>
            <div className="online-event__content">
                {renderOnlineContent()}
            </div>
        </Stack>
    );
}

export default OnlineEventPage;
