import {Avatar, IconButton, Skeleton, Stack, Typography} from "@mui/material";
import '../../styles/attendee-account-management-styles.css'
import {useEffect, useState} from "react";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import AttendeeProfileSettings from "../template/AttendeeProfileSettings.jsx";
import AddIcon from '@mui/icons-material/Add';
import {useLocation} from "react-router-dom";
import {useTranslation} from "react-i18next";

initializeApp(firebaseConfig);
const storage = getStorage()

function AttendeeAccountManagement() {
    const location = useLocation()
    const [step, setStep] = useState(location.pathname.includes('/password/set') ? 1 : 0);
    const [profiles, setProfiles] = useState([]);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [profileInfo, setProfileInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [ppImageList, setPpImageList] = useState([]);
    const {t} = useTranslation()

    useEffect(() => {
        if(profileInfo === null && selectedProfile !== null) {
            accountAxiosWithToken.get(`/attendee/profile?pid=${selectedProfile}`)
                .then(r => {
                    setProfileInfo(r.data)
                })
                .catch(err => console.log(err))
        }
    }, [selectedProfile]);

    useEffect(() => {
        if (profiles.length === 0) {
            accountAxiosWithToken.get(`/attendee/profiles?u=${getUserData('sub')}`)
                .then(async r => {
                    let data = r.data.records;
                    const imagePromises = data.map(async profile => {
                        if (profile[2]) {
                            if (profile[2].includes('googleusercontent')) {
                                return profile[2];
                            } else {
                                const imgRef = ref(storage, profile[2]);
                                return await getDownloadURL(imgRef);
                            }
                        }
                        return null;
                    });

                    const images = await Promise.all(imagePromises);
                    setPpImageList(images);
                    setIsLoading(false);
                    setProfiles(data);
                })
                .catch(err => console.log(err));
        }
    }, []);

    return (
        <div className={'attendee-account-management'}>
            {step === 0 &&
                <Stack rowGap={5} alignItems={'center'}>
                    <Typography variant={'h3'}>{t('select-profile')}</Typography>
                    <Stack direction={'row'} columnGap={3} alignItems={'center'}>
                        {isLoading ?
                            <>
                                {Array.from({length: 3}).map((_, index) => (
                                    <Stack key={index} rowGap={2} alignItems={'center'}>
                                        <Skeleton variant={'circular'} width={110} height={110} />
                                        <Skeleton variant={'text'} width={125} />
                                    </Stack>
                                ))}
                            </>
                            :
                            profiles.map((profile,index) => {
                                return (
                                    <Stack key={index} rowGap={2} alignItems={'center'} className={'profile-card'}
                                           onClick={() => {
                                               setSelectedProfile(profile[0])
                                               setStep(1)
                                           }}
                                    >
                                        <Avatar sx={{width: '7.5rem', height: '7.5rem'}} src={ppImageList[index]} />
                                        <Typography variant={'h6'}>{profile[1]}</Typography>
                                    </Stack>
                                )
                            })
                        }
                        <Stack alignItems={'center'}>
                            <IconButton sx={{border: '1px solid darkblue'}}>
                                <AddIcon sx={{fontSize: '6rem', color: 'darkblue'}}/>
                            </IconButton>
                        </Stack>
                    </Stack>
                </Stack>
            }
            {step === 1 && <AttendeeProfileSettings pid={selectedProfile} data={profileInfo}/>}
        </div>
    );
}

export default AttendeeAccountManagement;