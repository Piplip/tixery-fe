import "../../styles/organizer-view-styles.css"
import {Avatar, Stack} from "@mui/material";
import {Link, useLoaderData} from "react-router-dom";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {useCallback, useEffect, useState} from "react";
import LoadingFallback from "../LoadingFallback.jsx";
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import XIcon from '@mui/icons-material/X';

function OrganizerView() {
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const data = useLoaderData()
    const [profileImage, setProfileImage] = useState(null)

    const loadImage = useCallback(async (url) => {
        if (!url) return null;
        try {
            const storageRef = ref(storage, url);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error loading image:', error);
            return null;
        }
    }, [storage]);
    console.log(data)
    useEffect(() => {
        if(data['profile_image_url']){
            loadImage(data['profile_image_url']).then((url) => setProfileImage(url))
        }
        else {
            setProfileImage("#")
        }
    }, [])


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
                                    {data['social_media_links'].split(',').map((link, index) => {
                                        return (
                                            <Link to={link} key={index} target={'_blank'}>
                                                {link.includes('facebook') ?
                                                    <FacebookRoundedIcon sx={{color: 'blue'}}/> : <XIcon />
                                                }
                                            </Link>
                                        )
                                    })}
                                </Stack>
                            </Stack>
                        </Stack>
                    </div>
                }
            </div>
            :
            <LoadingFallback />
    )
}

export default OrganizerView