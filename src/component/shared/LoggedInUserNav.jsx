import "../../styles/logged-in-user-nav-styles.css"
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {Avatar, Stack} from "@mui/material";
import {checkLoggedIn, getUserData, hasRole, logout} from "../../common/Utilities.js";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Languages} from "../../common/Data.js";
import {useTranslation} from "react-i18next";

initializeApp(firebaseConfig);
const storage = getStorage()

function LoggedInUserNav(){
    const [ppImage, setPpImage] = useState(null)
    const [fullName] = useState(getUserData('profileName'))

    const links = [
        { name: 'Browse Events', link: '/events', roles: ['attendee'] },
        { name: 'Manage my events', link: '/organizer/events', roles: ['host'] },
        { name: 'Tickets', link: `/u/${getUserData('profileID')}`, roles: ['attendee'] },
        { name: 'Likes', link: '/favorites' , roles: ['attendee']},
        { name: 'Followings', link: `/u/${getUserData('profileID')}`, roles: ['attendee'] },
        { name: 'Interests', link: '/interests', roles: ['attendee'] },
        { name: 'Account Settings', link: '/account', public: true},
        { name: 'Profile', link: '/organizer/u', roles: ['host']},
    ];

    const {t, i18n} = useTranslation()

    useEffect(() => {
        if(checkLoggedIn()){
            let url = getUserData('profileImageUrl')
            if(url === null || url === "") return
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
            <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                <Avatar src={ppImage} alt="profile">
                    {fullName.charAt(0)}
                </Avatar>
                {fullName && <p>{fullName}</p>}
                <KeyboardArrowDownIcon />
            </Stack>
            <Stack className={'user-sub-nav'} rowGap={1}>
                {links.map((item, index) => {
                    const cond = item.roles instanceof Array ? hasRole(item.roles) : []
                    if(cond || item.public){
                        return (
                            <Link to={item.link} key={index}>
                                <div>
                                    <p>{item.name}</p>
                                </div>
                            </Link>
                        )
                    }
                })}
                <div className={'language-select-wrapper'}>
                    <p>Language</p>
                    <div className={'language-select'}>
                        {Languages.map((lang, index) => {
                            return (
                                <p key={index} onClick={() => {
                                    i18n.changeLanguage(lang.code)
                                    localStorage.setItem('locale', lang.code)
                                }}
                                    className={i18n.resolvedLanguage === lang.code ? 'selected' : ''}
                                >{lang.label}</p>
                            )
                        })}
                    </div>
                </div>
                <div onClick={logout}>
                    <p>Logout</p>
                </div>
            </Stack>
        </div>
    )
}

export default LoggedInUserNav