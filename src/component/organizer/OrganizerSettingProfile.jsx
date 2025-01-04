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
import CustomMenu from "../CustomMenu.jsx";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import DeleteDialog from "../DeleteDialog.jsx";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";

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
            <Snackbar sx={{marginTop: '3rem'}} anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={alert.open}
                      autoHideDuration={3000} onClose={() => setAlert({open: false, message: ""})}
            >
                <Alert severity={"success"} variant="filled" sx={{ width: '100%', backgroundColor: '#21cc0f'}}>
                    {alert.message}
                </Alert>
            </Snackbar>
            <h1 className="organizer-profile__title">Organizer Profiles</h1>
            <div className="organizer-profile__description">
                Each profile describes a unique organizer and shows all of their events on one page. Having a complete profile can encourage attendees to follow you.
                <Link to={'/help'}> <div style={{display: 'inline', color: 'blue'}}>Learn more</div></Link>
            </div>

            <div className="organizer-profile__list">
                {profiles && profiles.map((profile, index) => (
                    <div key={index} className="organizer-profile__card">
                        <Avatar src={profile[2]}
                                alt={profile.name} className="organizer-profile__avatar"/>
                        <p className="organizer-profile__name">{profile[1]}</p>
                        <CustomMenu options={['View', 'Edit', 'Delete']}
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
                    Add New Profile
                </button>
            </div>

            <DeleteDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} handleDelete={handleDeleteProfile}/>

            <Dialog open={dialogOpen} onClose={handleDialogClose} sx={{textAlign: 'center'}}>
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
                <DialogTitle sx={{m: 0, paddingTop: '3rem', paddingInline: '5rem'}}>
                    Are you sure you want to create a new <br/>organizer profile?</DialogTitle>
                <DialogContent sx={{paddingInline: '3rem'}}>
                    <Typography variant={'body2'} color={'gray'}>
                        You can create a new profile for a different organizer
                    </Typography>
                </DialogContent>
                <DialogActions sx={{alignSelf: 'center', marginBottom: '.5rem'}}>
                    <Link to={'/organizer/profile/info'}>
                        <Button variant="contained">
                            Create New
                        </Button>
                    </Link>
                </DialogActions>
            </Dialog>
        </section>
    );
}

export default OrganizerSettingProfile