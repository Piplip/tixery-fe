import "../../styles/organizer-view-styles.css"
import {Avatar, Stack} from "@mui/material";
import {Link, useLoaderData} from "react-router-dom";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {useCallback, useEffect, useState} from "react";
import LoadingFallback from "../shared/LoadingFallback.jsx";
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import XIcon from '@mui/icons-material/X';
import LanguageIcon from '@mui/icons-material/Language';

function OrganizerView() {
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const data = useLoaderData()
    const [profileImage, setProfileImage] = useState(null)

    const loadImage = useCallback(async (url) => {
        if (!url) return null;
        if(url.includes('googleusercontent')) return url;
        try {
            const storageRef = ref(storage, url);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error loading image:', error);
            return null;
        }
    }, [storage]);

    useEffect(() => {
        if(data['profile_image_url']){
            loadImage(data['profile_image_url']).then((url) => setProfileImage(url))
        }
        else {
            setProfileImage("#")
        }
    }, [])

    // TODO: Implement loading organizer events (bounds to the profile)

    return (
        profileImage ?
            <div className={'organizer-view-wrapper'}>
                {data &&
                    <div className={'organizer-view-hero'}>
                        <div className={'organizer-view-hero__img-wrapper'}>
                            <img className={'organizer-view-hero__img'}
                                 src={(profileImage || profileImage !== "#") || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZdM4Naw6g6mBZtWbsk8r4u0DEauhmvKrpFg&s'}
                                 alt={'hero image'}/>
                        </div>
                        <Stack className={'organizer-view-hero__main'} alignItems={'center'} rowGap={3}>
                            <Stack alignItems={'center'} rowGap={2}>
                                <Avatar sx={{width: '10rem', height: '10rem', fontSize: '5rem'}}
                                        src={profileImage}
                                        alt={'profile'}>
                                    {data['profile_name'].split(' ')[0][0]}
                                </Avatar>
                                <p className={'organizer-view-hero__profile-title'}>
                                    {data['profile_name']}
                                </p>
                            </Stack>
                            <Stack direction={'row'} columnGap={1}>
                                <button>Follow</button>
                                <button>Contact</button>
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
                                                    <FacebookRoundedIcon sx={{color: 'blue'}}/> :
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
                <div className={'organizer-view-main'}>
                    <div style={{borderBottom: '3px solid #c2c2c2', paddingBottom: '.5rem', marginBottom: '2rem'}}>
                        <p style={{borderBottom: '3px solid #ff2d2d', display: 'inline', paddingBottom: '.5rem', fontSize: '1.25rem'}}>
                            Events</p>
                    </div>
                    <p className={'organizer-view-main__title'}>Events</p>
                    <Stack className={'event-category-wrapper'} direction={'row'} columnGap={1}>
                        <p>Upcoming (0)</p>
                        <p>Past (0)</p>
                    </Stack>
                    <div>
                        <p>Sorry, there are no upcoming events</p>
                    </div>
                </div>
            </div>
            :
            <LoadingFallback />
    )
}

export default OrganizerView