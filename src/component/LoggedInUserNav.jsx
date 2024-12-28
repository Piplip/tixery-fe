import "../styles/logged-in-user-nav-styles.css"
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../config/firebaseConfig.js";
import {Avatar, Stack} from "@mui/material";
import {checkLoggedIn, getUserData, logout} from "../common/Utilities.js";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";

function LoggedInUserNav(){
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const [ppImage, setPpImage] = useState(null)
    const attendeeOptions = [
        { name: 'Browse Events', link: '/events' },
        { name: 'Manage my events', link: '/manage-events' },
        { name: 'Tickets', link: '/tickets' },
        { name: 'Likes', link: '/likes' },
        { name: 'Followings', link: '/followings' },
        { name: 'Interests', link: '/interests' },
        { name: 'Account Settings', link: '/account-settings' },
        { name: 'Profile', link: '/profile' },
    ];
    const [fullName, setFullName] = useState(getUserData('fullName'))

    useEffect(() => {
        if(checkLoggedIn()){
            let url = getUserData('profileImageUrl')
            if(url === null) return
            if(url.includes('https://lh3.googleusercontent.com')){
                setPpImage(url)
                return
            }
            let storageRef = ref(storage, url)
            getDownloadURL(storageRef)
                .then(url => {
                    setPpImage(url)
                })
                .catch(() => {
                    console.log('error')
                })
        }
    }, []);

    return (
        <div className={'logged-in-user-nav'}>
            {fullName &&
                <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                    <Avatar src={ppImage} alt="profile">
                        {fullName.charAt(0)}
                    </Avatar>
                    <p>{fullName}</p>
                    <KeyboardArrowDownIcon />
                </Stack>
            }
            <Stack className={'user-sub-nav'} rowGap={1}>
                {attendeeOptions.map((item, index) => {
                    return (
                        <Link to={item.link} key={index}>
                            <div>
                                <p>{item.name}</p>
                            </div>
                        </Link>
                    )
                })}
                <div onClick={logout}>
                    <p>Logout</p>
                </div>
            </Stack>
        </div>
    )
}

export default LoggedInUserNav