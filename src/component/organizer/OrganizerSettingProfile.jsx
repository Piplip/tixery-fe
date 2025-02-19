import {
    Alert,
    Avatar,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Snackbar,
    Typography
} from "@mui/material";
import {useCallback, useEffect, useState} from "react";
import CloseIcon from '@mui/icons-material/Close';
import '../../styles/organizer-setting-profile-styles.css'
import {Link, useLoaderData, useNavigate} from "react-router-dom";
import CustomMenu from "../shared/CustomMenu.jsx";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import DeleteDialog from "../shared/DeleteDialog.jsx";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {useTranslation} from "react-i18next";

function OrganizerSettingProfile() {
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const navigate = useNavigate()
    const [profiles, setProfiles] = useState(useLoaderData().data.records)
    const [alert, setAlert] = useState({
        open: false, message: ""
    })
    const handleDialogOpen = () => setDialogOpen(true);
    const handleDialogClose = () => setDialogOpen(false);
    const {t} = useTranslation()

    const loadImage = useCallback(async (url) => {
        if (!url) return null;
        try {
            const storageRef = ref(storage, url);
            return await getDownloadURL(storageRef);
        } catch (err) {
            return null;
        }
    }, [storage]);

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

            setProfiles(updatedProfiles);
        }

        if(profiles){
            loadAllImages();
        }
    }, [loadImage]);

    function handleDeleteProfile(){
        accountAxiosWithToken.delete(`/organizer/profile/delete?pid=${selectedProfile}&u=${getUserData("sub")}`)
            .then((r) => {
                localStorage.setItem('tk', r.data.data)
                setTimeout(() => window.location.reload(), 1000)
                setDeleteDialogOpen(false)
                setAlert({open: true, message: "Profile deleted successfully"})
            })
            .catch(err => console.log(err))
    }

    return (
        <section className="organizer-profile">
            <Snackbar sx={{ marginTop: '3rem' }} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} open={alert.open}
                      autoHideDuration={3000} onClose={() => setAlert({ open: false, message: "" })}
            >
                <Alert severity={"success"} variant="filled" sx={{ width: '100%', backgroundColor: '#21cc0f' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
            <h1 className="organizer-profile__title">{t('organizerSetting.organizerProfiles')}</h1>
            <div className="organizer-profile__description">
                {t('organizerSetting.profileDescription')}
                <Link to={'/help'}> <div style={{ display: 'inline', color: 'blue' }}>{t('organizerSetting.learnMore')}</div></Link>
            </div>

            <div className="organizer-profile__list">
                {profiles && profiles.map((profile, index) => (
                    <div key={index} className="organizer-profile__card">
                        <Avatar src={profile[2]}
                                alt={profile.name} className="organizer-profile__avatar" />
                        <p className="organizer-profile__name">{profile[1]}</p>
                        {
                            profile[0] == getUserData("profileID") &&
                            <div className={'default-profile-banner'}>{t('organizerSetting.default')}</div>
                        }
                        <CustomMenu options={[t('organizerSetting.view'), t('organizerSetting.edit'), t('organizerSetting.delete')]} handlersWithParams={true}
                                    handlers={[() => window.open(`/o/${profile[3] ? profile[3] : profile[0]}`),
                                        () => navigate(`/organizer/profile/info/${profile[0]}`),
                                        () => {
                                            setSelectedProfile(profile[0]);
                                            setDeleteDialogOpen(true)
                                        }]}
                        />
                    </div>
                ))}
                <button className="organizer-profile__add-button"
                        onClick={handleDialogOpen}
                >
                    {t('organizerSetting.addNewProfile')}
                </button>
            </div>

            <DeleteDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} handleDelete={handleDeleteProfile} />

            <Dialog open={dialogOpen} onClose={handleDialogClose} sx={{ textAlign: 'center' }}>
                <IconButton
                    onClick={handleDialogClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogTitle sx={{ m: 0, paddingTop: '3rem', paddingInline: '5rem' }}>
                    {t('organizerSetting.createProfileConfirmation')}
                </DialogTitle>
                <DialogContent sx={{ paddingInline: '3rem' }}>
                    <Typography variant={'body2'} color={'gray'}>
                        {t('organizerSetting.profileDescription2')}
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ alignSelf: 'center', marginBottom: '.5rem' }}>
                    <Link to={'/organizer/profile/info'}>
                        <Button variant="contained">
                            {t('organizerSetting.createNew')}
                        </Button>
                    </Link>
                </DialogActions>
            </Dialog>
        </section>
    );
}

export default OrganizerSettingProfile