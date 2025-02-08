import '../../styles/attendee-profile-styles.css'
import {Avatar, IconButton, Stack} from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AttendeeFavoriteEvents from "./AttendeeFavoriteEvents.jsx";
import AttendeeFollowing from "./AttendeeFollowing.jsx";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {useEffect, useRef, useState} from "react";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {checkLoggedIn, getUserData} from "../../common/Utilities.js";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import {Link} from "react-router-dom";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import AttendeeOrders from "./AttendeeOrders.jsx";

initializeApp(firebaseConfig);
const storage = getStorage()

function AttendeeProfile(){
    const [stats, setStats] = useState({});
    const isCallApi = useRef(false)
    const [ppImage, setPpImage] = useState('')

    useEffect(() => {
        if(!isCallApi.current){
            isCallApi.current = true
            accountAxiosWithToken.get(`/attendee/stats?pid=${getUserData('profileID')}`)
                .then(r => {
                    setStats(r.data)
                })
                .catch(err => console.log(err))
        }
    }, []);

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
        <Stack className="attendee-profile">
            <Stack direction={'row'} className="attendee-profile__header">
                <Avatar className="attendee-profile__avatar" sx={{width: '7.5rem', height: '7.5rem'}} src={ppImage} alt={getUserData('fullName')}/>
                <Stack className="attendee-profile__info">
                    <Stack direction={'row'} className="attendee-profile__name">
                        <p>{getUserData('fullName')}</p>
                        <Link to={'/account'}>
                            <IconButton>
                                <EditOutlinedIcon className="attendee-profile__edit-icon" />
                            </IconButton>
                        </Link>
                    </Stack>
                    <p className="attendee-profile__stats">
                        <Link to={'#'}>0 orders</Link> • <Link to={'/favorites'}>{stats.total_saved} likes</Link> • <Link to={'#'}>{stats.total_followed} following</Link>
                    </p>
                </Stack>
            </Stack>
            <Stack className="attendee-profile__content">
                <Stack className="attendee-profile__section">
                    <Stack direction={'row'} alignItems={'center'} columnGap={.5} className="attendee-profile__section-header">
                        <p className="attendee-profile__section-title">Orders</p>
                    </Stack>
                    <AttendeeOrders />
                </Stack>
                <Stack className="attendee-profile__section">
                    <Stack direction={'row'} alignItems={'center'} columnGap={.5} className="attendee-profile__section-header">
                        <p className="attendee-profile__section-title">Interests</p>
                        <ChevronRightIcon className="attendee-profile__section-icon" />
                    </Stack>
                </Stack>
                <Stack className="attendee-profile__section">
                    <Stack direction={'row'} alignItems={'center'} columnGap={.5} className="attendee-profile__section-header">
                        <Link to={'/favoriteS'}>
                            <p className="attendee-profile__section-title">Likes</p>
                        </Link>
                        <ChevronRightIcon className="attendee-profile__section-icon" />
                    </Stack>
                    <AttendeeFavoriteEvents isSubComponent={true}/>
                </Stack>
                <AttendeeFollowing />
                <Stack direction={'row'} className="attendee-profile__ticket-info" columnGap={1.5}>
                    <InfoOutlinedIcon className="attendee-profile__ticket-icon"
                                      sx={{color: 'black', backgroundColor: '#fff760', width: 40, height: 40, p: 1, borderRadius: '50%'}}/>
                    <Stack className="attendee-profile__ticket-content" rowGap={.5}>
                        <p className="attendee-profile__ticket-title">Ticket missing ?</p>
                        <p className="link">Find my tickets</p>
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    );
}

export default AttendeeProfile;