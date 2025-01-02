import "../../styles/organizer-view-styles.css"
import {Avatar, IconButton, Stack} from "@mui/material";
import LanguageIcon from '@mui/icons-material/Language';
import {useLoaderData} from "react-router-dom";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {useCallback, useEffect, useState} from "react";

function OrganizerView() {
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const data = useLoaderData()
    const [profileImage, setProfileImage] = useState(null)
    console.log(data)

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

    useEffect(() => {
        if(data){
            loadImage(data['profile_image_url']).then((url) => setProfileImage(url))
        }
    }, [])

    return (
        <div className={'organizer-view-wrapper'}>
            {data &&
                <div className={'organizer-view-hero'}>
                    <div className={'organizer-view-hero__img-wrapper'}>
                        <img className={'organizer-view-hero__img'}
                             src={profileImage || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZdM4Naw6g6mBZtWbsk8r4u0DEauhmvKrpFg&s'}
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
                            <IconButton className={'organizer-view-hero__social-btn'}>
                                <LanguageIcon fontSize="inherit"/>
                            </IconButton>
                        </Stack>
                    </Stack>
                </div>
            }
            <div className={'organizer-view__main'}>

            </div>
        </div>
    )
}

export default OrganizerView