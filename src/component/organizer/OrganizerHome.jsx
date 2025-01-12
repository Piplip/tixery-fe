import {Avatar, Checkbox, Stack, Tooltip, Typography} from "@mui/material";
import {getUserData} from "../../common/Utilities.js";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import EditIcon from '@mui/icons-material/Edit';
import {Link, useLoaderData, useNavigate} from "react-router-dom";
import '../../styles/organizer-home-styles.css'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {useCallback, useEffect, useState} from "react";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CircleOutlinedIcon from '@mui/icons-material/CircleOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {eventAxiosWithToken} from "../../config/axiosConfig.js";

const checkboxStyle = {
    sx: {
        color: '#dedede',
            '&.Mui-checked': {
            color: '#009900'
        },
    }
}

const CustomCheckbox = () => {
    return (
        <Checkbox disabled
            icon={<CircleOutlinedIcon />}
            checkedIcon={<CheckCircleIcon />}
            {...checkboxStyle}
        />
    )
}

function OrganizerHome(){
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState(useLoaderData().data.records)
    const [selectProfile, setSelectProfile] = useState(profiles.findIndex(profile => profile[0] === getUserData('profileID')))
    const [clicked, setClicked] = useState(false)
    const loadImage = useCallback(async (url) => {
        if (!url) return null;
        try {
            const storageRef = ref(storage, url);
            return await getDownloadURL(storageRef);
            // eslint-disable-next-line no-unused-vars
        } catch (err) {
            return null;
        }
    }, [storage]);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        async function loadAllImages() {
            const updatedProfiles = await Promise.all(
                profiles.map(async (profile) => {
                    if (profile[2] && !profile[2].includes('googleusercontent')) {
                        const loadedUrl = await loadImage(profile[2]);
                        profile[2] = loadedUrl || profile[2];
                    }
                    return profile;
                })
            );

            setProfiles(updatedProfiles)
        }

        if(profiles){
            loadAllImages();
        }
    }, [loadImage]);

    function handleCopyProfileURL(){
        let customURL = profiles[selectProfile][3]
        const url = `${window.location.origin}/o/${customURL ? customURL : profiles[selectProfile][0]}`
        navigator.clipboard.writeText(url);
    }

    function handleCreateEventRequest(){
        setIsLoading(true)
        eventAxiosWithToken.post(`/create/request?pid=${getUserData('profileID')}&u=${getUserData("sub")}`)
            .then(r => {
                navigate(`events/${r.data.data}`)
                setIsLoading(false)
            })
            .catch(err => console.log(err))
    }

    return (
        <div className={'organizer-home-container'}>
            <Stack direction={'row'} columnGap={'4rem'}>
                <Stack rowGap={3}>
                    <Typography variant={'h2'} fontWeight={'bold'}>
                        Hi there, {getUserData('fullName')}
                    </Typography>
                    <Stack direction={'row'} columnGap={'1rem'}>
                        <div className={'create-events-item'} onClick={handleCreateEventRequest}>
                            {isLoading ?
                                <Stack style={{height: '100%'}} alignItems={'center'} justifyContent={'center'}>
                                    <div className={'loader-02'}></div>
                                </Stack>
                                    :
                                    <>
                                        <EditIcon/>
                                        <Typography variant={'h5'}>Start from scratch</Typography>
                                        <Typography variant={'body2'}>Add all your event details, create new tickets,
                                            and set up
                                            recurring events</Typography>
                                        <button>Create event</button>
                                    </>
                                    }
                                </div>
                                <div className={'create-events-item'}>
                            <AutoFixHighIcon />
                            <Typography variant={'h5'}>Create with AI</Typography>
                            <Typography variant={'body2'}>Answer a few quick questions to generate an event that&#39;s ready to publish almost instantly</Typography>
                            <button>Create with AI</button>
                        </div>
                    </Stack>
                    <Stack rowGap={1} className={'checklist-wrapper'}>
                        <Typography variant={'h4'} fontWeight={'bold'}>Your checklist</Typography>
                        <Typography variant={'body1'}>
                            We make it easy to plan successful events. Here&#39;s how to start!
                        </Typography>
                        <Stack rowGap={1}>
                            <Stack direction={'row'} justifyContent={'space-between'} className={'checklist-steps'}>
                                <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                    <CustomCheckbox />
                                    <Stack>
                                        <p>Create event</p>
                                        <p>Publish an event to reach millions of people in
                                            Tixery</p>
                                    </Stack>
                                </Stack>
                                <Stack direction={'row'} alignItems={'center'} columnGap={1} className={'check-list-item-start'}>
                                    <AutoAwesomeIcon/>
                                    <p>Start here</p>
                                </Stack>
                            </Stack>
                            <div className={'checklist-steps'}>
                                <CustomCheckbox />
                                <Stack onClick={() => navigate(`profile/info/${getUserData('profileID')}`)}>
                                    <p>Set up your organizer profile</p>
                                    <p>Highlight your brand by adding your organizer a name,
                                        logo and bio</p>
                                </Stack>
                            </div>
                            <div className={'checklist-steps'}>
                                <CustomCheckbox />
                                <Stack>
                                    <p>Add your bank account</p>
                                    <p>Get paid for futuring ticket sales by adding your bank details</p>
                                </Stack>
                            </div>
                        </Stack>
                    </Stack>
                </Stack>
                {profiles ?
                    <Stack className={'organizer-setup-profile-cta'} rowGap={1}>
                        <Stack rowGap={2}>
                            <Typography variant={'h5'}>{profiles[selectProfile][1]}</Typography>
                            <Stack direction={'row'} columnGap={3}>
                                <Link to={`/o/${profiles[selectProfile][3] ? profiles[selectProfile][3] : profiles[selectProfile][0]} `} target={'_blank'}>
                                    <p className={'link'}>View</p>
                                </Link>
                                <Link to={`profile/info/${profiles[selectProfile][0]}`} target={'_blank'}>
                                    <p className={'link'}>Edit</p>
                                </Link>
                                <Tooltip title={'Click to copy'}>
                                    <p className={'link'}
                                       onClick={handleCopyProfileURL}
                                    >Copy Profile URL</p>
                                </Tooltip>
                            </Stack>
                            <Stack direction={'row'} columnGap={4}>
                                <Stack>
                                    <p>--</p>
                                    <p>Total events</p>
                                </Stack>
                                <Stack>
                                    <p>--</p>
                                    <p>Total followers</p>
                                </Stack>
                            </Stack>
                        </Stack>
                        <hr style={{marginBlock: '1rem'}}/>
                        <div style={{position: "relative"}}>
                            <div className={'organizer-setup-profile-cta__profile-select'}
                                 onClick={() => setClicked(prev => !prev)}
                            >
                                <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                    <Avatar src={profiles[selectProfile][2]} sx={{width: 30, height: 30}}/>
                                    <p>{profiles[selectProfile][1]}</p>
                                </Stack>
                                <KeyboardArrowDownIcon />
                            </div>
                            <Stack style={{position: 'absolute'}} className={'organizer-setup-profile-cta__profile-select-dropdown'}>
                                {profiles.map((profile, index) => (
                                    index !== selectProfile && clicked &&
                                    <Stack key={index} className={'organizer-setup-profile-cta__profile-select__item'} direction={'row'}
                                        onClick={() => {
                                            setSelectProfile(index)
                                            setClicked(false)
                                        }}
                                    >
                                        <Avatar src={profile[2]} sx={{width: 30, height: 30}}/>
                                        <p>{profile[1]}</p>
                                    </Stack>
                                ))}
                            </Stack>
                        </div>
                    </Stack>
                    :
                    <Link to={'u'}>
                        <Stack className={'organizer-setup-profile-cta'} rowGap={1}>
                            <Typography variant={'h6'} fontWeight={'bold'}>
                                Set up your organizer profile
                            </Typography>
                            <Typography variant={'body2'}>
                                A complete profile can increase discoverability, highlight your brand and trust among attendees
                            </Typography>
                            <p className={'link'}>Set up your profile →</p>
                        </Stack>
                    </Link>
                }
            </Stack>
        </div>
    )
}

export default OrganizerHome