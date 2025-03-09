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

    const {t, i18n} = useTranslation()

    const links = [
        { nameKey: 'loggedInUserNav.browseEvents', link: '/events/search', roles: ['attendee'] },
        { nameKey: 'loggedInUserNav.manageMyEvents', link: '/organizer/events', roles: ['host'] },
        { nameKey: 'loggedInUserNav.tickets', link: `/u/${getUserData('profileID')}`, roles: ['attendee'] },
        { nameKey: 'loggedInUserNav.likes', link: '/favorites', roles: ['attendee'] },
        { nameKey: 'loggedInUserNav.followings', link: `/u/${getUserData('profileID')}`, roles: ['attendee'] },
        { nameKey: 'loggedInUserNav.interests', link: '/interests', roles: ['attendee'] },
        { nameKey: 'loggedInUserNav.accountSettings', link: '/account', public: true },
        { nameKey: 'loggedInUserNav.profile', link: '/organizer/u', roles: ['host'] },
    ];

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
                <Avatar src={ppImage} alt={t('loggedInUserNav.profile')}>
                    {fullName && fullName.charAt(0)}
                </Avatar>
                {fullName && <p>{fullName}</p>}
                <KeyboardArrowDownIcon />
            </Stack>
            <Stack className={'user-sub-nav'} rowGap={1}>
                {links.map((item, index) => {
                    const cond = item.roles instanceof Array ? hasRole(item.roles) : [];
                    if (cond || item.public) {
                        return (
                            <Link to={item.link} key={index}>
                                <div>
                                    <p>{t(item.nameKey)}</p>
                                </div>
                            </Link>
                        )
                    }
                })}
                <div className={'language-select-wrapper'}>
                    <p>{t('loggedInUserNav.language')}</p>
                    <div className={'language-select'}>
                        {Languages.map((lang, index) => {
                            return (
                                <p key={index} onClick={() => {
                                    i18n.changeLanguage(lang);
                                    localStorage.setItem('locale', lang);
                                }}
                                   className={i18n.resolvedLanguage === lang ? 'selected' : ''}
                                >{t(`lang.${lang}`)}</p>
                            )
                        })}
                    </div>
                </div>
                <div onClick={logout}>
                    <p>{t('loggedInUserNav.logout')}</p>
                </div>
            </Stack>
        </div>
    );
}

export default LoggedInUserNav