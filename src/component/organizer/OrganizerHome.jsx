import {Avatar, Checkbox, Stack, Tooltip, Typography} from "@mui/material";
import {getUserData, transformNumber} from "../../common/Utilities.js";
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
import CreateEventMenu from "./CreateEventMenu.jsx";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import PropTypes from "prop-types";
import {useTranslation} from "react-i18next";

const checkboxStyle = {
    sx: {
        color: '#dedede',
            '&.Mui-checked': {
            color: '#009900'
        },
    }
}

const CustomCheckbox = ({check}) => {
    return (
        <Checkbox defaultChecked={check || false} disabled
            icon={<CircleOutlinedIcon />}
            checkedIcon={<CheckCircleIcon />}
            {...checkboxStyle}
        />
    )
}

CustomCheckbox.propTypes = {
    check: PropTypes.bool
}

initializeApp(firebaseConfig);
const storage = getStorage()

function OrganizerHome(){
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState(useLoaderData().data.records)
    const [selectProfile, setSelectProfile] = useState(profiles.findIndex(profile => profile[0] == getUserData('profileID')))
    const [clicked, setClicked] = useState(false)
    const [open, setOpen] = useState(false);

    const onClose = () => {
        setOpen(false)
        setSelectProfile(profiles.findIndex(profile => profile[0] == getUserData('profileID')))
    };

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

    useEffect(() => {
        try {
            console.log("Processing token from URL");
            const hash = window.location.hash.substring(1);

            if (hash.startsWith('token=')) {
                const token = hash.substring(6);
                console.log("Token found, processing...");

                if (token && token.split('.').length === 3) {
                    localStorage.setItem('tk', token);
                    console.log("Token stored successfully");

                    window.history.replaceState(null, null, window.location.pathname);

                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                } else {
                    console.error('Invalid token format received');
                }
            }
        } catch (error) {
            console.error('Error handling token:', error);
        }
    }, []);

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

    function handleSwitchProfile(){
        accountAxiosWithToken.get(`/profile/switch?u=${getUserData('sub')}&pid=${profiles[selectProfile][0]}`)
            .then(r => {
                localStorage.setItem('tk', r.data.data)
                window.location.reload()
            })
            .catch(err => console.log(err))
    }

    return (
        <div className={'organizer-home-container'}>
            <Dialog open={open} onClose={onClose} maxWidth={'sm'} fullWidth>
                <Stack sx={{ p: 1 }}>
                    <DialogTitle>
                        {t('switch_profile')}
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {t('switch_profile_confirmation')}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClose}>
                            {t('no_stay')}
                        </Button>
                        <Button onClick={handleSwitchProfile} variant="contained" color="primary">
                            {t('yes_switch', { profileName: profiles[selectProfile][1] })}
                        </Button>
                    </DialogActions>
                </Stack>
            </Dialog>
            <Stack direction={'row'} columnGap={'4rem'}>
                <Stack rowGap={3}>
                    <Typography variant={'h2'} fontWeight={'bold'} fontFamily={'Raleway'}>
                        {t('hi_there', { profileName: getUserData('profileName') })}
                    </Typography>
                    <CreateEventMenu />
                    <Stack rowGap={1} className={'checklist-wrapper'}>
                        <Typography variant={'h4'} fontWeight={'bold'}>{t('your_checklist')}</Typography>
                        <Typography variant={'body1'}>
                            {t('checklist_intro')}
                        </Typography>
                        <Stack rowGap={1}>
                            <Stack direction={'row'} justifyContent={'space-between'} className={'checklist-steps'}>
                                <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                    <CustomCheckbox check={profiles[selectProfile][4] > 0} />
                                    <Stack>
                                        <p>{t('create_event')}</p>
                                        <p>{t('publish_event')}</p>
                                    </Stack>
                                </Stack>
                                <Stack direction={'row'} alignItems={'center'} columnGap={1} className={'check-list-item-start'}>
                                    <AutoAwesomeIcon />
                                    <p>{t('start_here')}</p>
                                </Stack>
                            </Stack>
                            <div className={'checklist-steps'}>
                                <CustomCheckbox check={profiles.length > 0} />
                                <Stack onClick={() => navigate(`profile/info/${getUserData('profileID')}`)}>
                                    <p>{t('set_up_profile')}</p>
                                    <p>{t('highlight_brand')}</p>
                                </Stack>
                            </div>
                            <div className={'checklist-steps'}>
                                <CustomCheckbox />
                                <Stack>
                                    <p>{t('add_bank_account')}</p>
                                    <p>{t('get_paid')}</p>
                                </Stack>
                            </div>
                        </Stack>
                    </Stack>
                </Stack>
                {profiles ?
                    <Stack className={'organizer-setup-profile-cta'} rowGap={1}>
                        <Stack rowGap={2}>
                            <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                                <Typography variant={'h5'}>{profiles[selectProfile][1]}</Typography>
                                {profiles[selectProfile][0] == getUserData('profileID') &&
                                    <div className={'default-profile-banner'}>
                                        {t('default')}
                                    </div>
                                }
                            </Stack>
                            <Stack direction={'row'} columnGap={3}>
                                <Link to={`/o/${profiles[selectProfile][3] ? profiles[selectProfile][3] : profiles[selectProfile][0]} `} target={'_blank'}>
                                    <p className={'link'}>{t('view')}</p>
                                </Link>
                                <Link to={`profile/info/${profiles[selectProfile][0]}`} target={'_blank'}>
                                    <p className={'link'}>{t('edit')}</p>
                                </Link>
                                <Tooltip title={t('click_to_copy')}>
                                    <p className={'link'}
                                       onClick={handleCopyProfileURL}
                                    >{t('copy_profile_url')}</p>
                                </Tooltip>
                            </Stack>
                            <Stack direction={'row'} columnGap={4}>
                                <Stack>
                                    <Typography variant={'h6'}>{profiles[selectProfile][4]}</Typography>
                                    <p>{t('total_events')}</p>
                                </Stack>
                                <Stack>
                                    <Typography variant={'h6'}>{transformNumber(profiles[selectProfile][5])}</Typography>
                                    <p>{t('total_followers')}</p>
                                </Stack>
                            </Stack>
                        </Stack>
                        <hr style={{ marginBlock: '1rem' }} />
                        <div style={{ position: "relative" }}>
                            <div className={'organizer-setup-profile-cta__profile-select'}
                                 onClick={() => setClicked(prev => !prev)}
                            >
                                <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                    <Avatar src={profiles[selectProfile][2]} sx={{ width: 30, height: 30 }} />
                                    <p>{profiles[selectProfile][1]}</p>
                                </Stack>
                                <KeyboardArrowDownIcon />
                            </div>
                            <Stack style={{ position: 'absolute' }} className={'organizer-setup-profile-cta__profile-select-dropdown'}>
                                {profiles.map((profile, index) => (
                                    index !== selectProfile && clicked &&
                                    <Stack key={index} className={'organizer-setup-profile-cta__profile-select__item'} direction={'row'}
                                           onClick={() => {
                                               setSelectProfile(index)
                                               setOpen(true)
                                               setClicked(false)
                                           }}
                                    >
                                        <Avatar src={profile[2]} sx={{ width: 30, height: 30 }} />
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
                                {t('set_up_organizer_profile')}
                            </Typography>
                            <Typography variant={'body2'}>
                                {t('complete_profile')}
                            </Typography>
                            <p className={'link'}>{t('set_up_profile_link')}</p>
                        </Stack>
                    </Link>
                }
            </Stack>
        </div>
    )
}

export default OrganizerHome