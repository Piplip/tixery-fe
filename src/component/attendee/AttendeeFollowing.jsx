import {useEffect, useState} from "react";
import {Avatar, Stack} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import Grid from "@mui/material/Grid2";
import FollowOrganizer from "../shared/FollowOrganizer.jsx";
import {Link} from "react-router-dom";

initializeApp(firebaseConfig);
const storage = getStorage()

function AttendeeFollowing(){
    const [followedOrganizer, setFollowedOrganizer] = useState([]);

    useEffect(() => {
        if(followedOrganizer?.length === 0 && sessionStorage.getItem('followed-organizer')?.length > 0){
            accountAxiosWithToken.post('/follow/detail', sessionStorage.getItem('followed-organizer'))
                .then(async response => {
                    const newData = await Promise.all(response.data.map(async organizer => {
                        if (organizer.profile_image_url.includes('profile-image')) {
                            const refImage = ref(storage, organizer.profile_image_url);
                            organizer.profile_image_url = await getDownloadURL(refImage);
                        }
                        return organizer;
                    }));
                    setFollowedOrganizer(newData);
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }, []);

    return (
        followedOrganizer?.length > 0 &&
        <Stack className="attendee-profile__section">
            <Stack className={'attendee-profile__section-header'} direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                <p className="attendee-profile__section-title">Following</p>
                <Stack direction={'row'} alignItems={'center'} columnGap={.5} className={'link'}>
                    <Link to={'following'}>
                        <p>See events</p>
                    </Link>
                    <ChevronRightIcon className="attendee-profile__section-icon" />
                </Stack>
            </Stack>
            <Grid container spacing={3} columns={{xs: 12}} sx={{paddingInline: 2}}>
                {followedOrganizer.map((organizer, index) => (
                    <Grid key={index} size={6} className={'attendee-profile__following'}>
                        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
                            <Link to={`/o/${organizer?.custom_url || organizer.profile_id}`} target={'_blank'}>
                                <Stack direction={'row'} alignItems={'center'} columnGap={2}>
                                    <Avatar src={organizer.profile_image_url} alt={organizer.profile_name}/>
                                    <p className={'attendee-profile__following-name'}>{organizer.profile_name}</p>
                                </Stack>
                            </Link>
                            <FollowOrganizer profileImage={organizer.profile_image_url} organizerName={organizer.profile_name} organizerID={organizer.profile_id} />
                        </Stack>
                    </Grid>
                ))}
            </Grid>
        </Stack>
    )
}

export default AttendeeFollowing