import {useRef, useState} from "react";
import {
    Alert,
    Button,
    IconButton,
    Snackbar,
    Stack,
    Switch,
    TextField,
    Tooltip
} from "@mui/material";
import {CopyAll, Edit} from "@mui/icons-material";
import "../../styles/organizer-edit-profile-styles.css"
import {Link, useLocation} from "react-router-dom";
import DragAndDropZone from "../DragAndDropZone.jsx";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import {generateFileName, getUserData} from "../../common/Utilities.js";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import SaveIcon from '@mui/icons-material/Save';
import PropTypes from "prop-types";
import TextAreaWithLimit from "../TextAreaWithLimit.jsx";

OrganizerProfileForm.propTypes = {
    profileData: PropTypes.object
}

function OrganizerProfileForm({profileData}){
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const [formData, setFormData] = useState({
        organizerName: profileData && profileData.profile_name !== null ? profileData.profile_name : "",
        organizerBio: profileData && profileData.description !== null ? profileData.description : "",
        socialMedia: profileData && profileData.social_media_links !== null ? profileData.social_media_links : "",
        emailOptIn: profileData && profileData.email_opt_in !== null ? profileData.email_opt_in == '1' : true,
        ppImageURL: profileData && profileData.profile_image_url !== null ? profileData.profile_image_url : "",
        customURL: profileData && profileData.custom_url !== null ? profileData.custom_url : ""
    });
    const ppImageURLRef = useRef(formData.ppImageURL);
    const [isLoading, setIsLoading] = useState(false)
    const [alert, setAlert] = useState({
        open: false, message: ""
    })
    const location = useLocation()
    const [errors, setErrors] = useState({});
    const [editCustomURL, setEditCustomURL] = useState(false);

    function handleInputChange(e){
        setErrors((prevErrors) => ({...prevErrors, [e.target.name]: ""}));
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === "checkbox" ? checked : value,
        }));
        if(name === 'customURL'){
            accountAxiosWithToken.get(`/organizer/profile/custom-url/check?url=${value}`)
                .then(r => {
                    if(r.data.message !== "Unique"){
                        setErrors((prevErrors) => ({...prevErrors, customURL: "This URL is already taken. Please choose another one."}))
                    }
                })
        }
    }

    function validateForm() {
        const newErrors = {};
        if (!formData.organizerName.trim()) newErrors.organizerName = "Organizer Name is required.";
        if(formData.socialMedia !== ""){
            const socialMediaLinks = formData.socialMedia.split(',').map(link => link.trim());
            for(const link of socialMediaLinks){
                if(!link.includes('facebook') && !link.includes('x.com') && !link.includes('instagram') && !link.includes('linkedin')){
                    newErrors.socialMedia = "Please enter a valid social media link";
                    break;
                }
            }
        }
        return newErrors;
    }

    function handleCopyUrl() {
        navigator.clipboard.writeText(formData.website);
    }

    async function uploadImage() {
        const fileName = generateFileName();
        const storageRef = ref(storage, `/profile-image/${fileName}`);
        const res = await uploadBytes(storageRef, formData.ppImageURL);
        const fullPath = res.metadata.fullPath;
        setFormData((prevData) => ({
            ...prevData,
            ppImageURL: fullPath,
        }));
        return fullPath;
    }

    async function saveProfile() {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        setIsLoading(true)
        let uploadedPath
        try {
            if(formData.ppImageURL !== ppImageURLRef.current){
                uploadedPath = await uploadImage();
            }
            else {
                uploadedPath = formData.ppImageURL
            }
        } catch (err) {
            console.error('Error saving profile:', err);
        } finally {
            console.log(uploadedPath)
            console.log(formData)
            const regex = /\/organizer\/profile\/info\/.+/g
            const url = regex.test(location.pathname)
                ? `/organizer/profile/update?pid=${profileData.profile_id}&u=${getUserData("sub")}`
                : `/organizer/profile/create?u=${getUserData("sub")}`
            accountAxiosWithToken.post(url, {
                ppName: formData.organizerName, ppImageURL: uploadedPath, ppDescription: formData.organizerBio,
                emailOptIn: formData.emailOptIn ? '1' : '0', socialMediaLinks: formData.socialMedia, customURL: formData.customURL
            })
                .then((r) => {
                    setIsLoading(false)
                    if(r.data.message === "Profile created"){
                        setAlert({open: true, message: "New profile added successfully!"})
                    }
                    else if(r.data.message === "Profile updated"){
                        if(r.data.data !== null){
                            localStorage.setItem('tk', r.data.data)
                        }
                        setAlert({open: true, message: "Profile updated successfully!"})
                    }
                    setTimeout(() => {
                        window.location.href = '/organizer/u'
                    }, 2000)
                })
                .catch(err => console.log(err))
        }
    }

    return (
        <div className="edit-organizer-profile">
            <Snackbar sx={{marginTop: '3rem'}}
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={alert.open} onClose={() => setAlert({open: false, message: ""})}
            >
                <Alert severity={"success"} variant="filled" sx={{ width: '100%', backgroundColor: '#21cc0f'}}>
                    {alert.message}
                </Alert>
            </Snackbar>
            <Link to={'/organizer/u'}>
                <div className={'go-back-link'}>← Organization Settings</div>
            </Link>
            <h1 className="edit-organizer-profile__title">Edit Organizer Profile</h1>
            <form className="edit-organizer-profile__form" onSubmit={(e) => e.preventDefault()}>
                <div className="edit-organizer-profile__field">
                    <h2>Organizer Profile Image</h2>
                    <p>
                        This is the first image attendees will see at the top of your profile. Use a high quality square image.
                    </p>
                    <DragAndDropZone image={formData.ppImageURL}
                        onFileSelect={(file) => setFormData({...formData, ppImageURL: file})}
                    />

                </div>
                <Stack rowGap={3}>
                    <Stack rowGap={1}>
                        <h2>About the Organizer</h2>
                        <div>Let attendees know who is hosting events.
                            <Link to={'/help'}>
                                <div className={'help-link'}>Learn More</div>
                            </Link>
                        </div>
                        <TextField name="organizerName" variant="outlined" fullWidth placeholder="Organizer Name (Required)"
                                   label={'Organizer Name'} sx={{marginTop: 2}}
                                   value={formData.organizerName}
                                   onChange={handleInputChange}
                                   error={!!errors.organizerName}
                                   helperText={errors.organizerName}
                        />
                    </Stack>
                    <Stack rowGap={1}>
                        <h3>Organizer Page URL</h3>
                        <p>
                            Customizing your URL can help attendees find you when searching for your events. The URL can
                            only contain letters, numbers, dashes, and underscores.
                        </p>
                        <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                            <div className={'link'}>
                                {formData.website ||
                                    <div>
                                        {editCustomURL ?
                                            <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                                https://example.com/
                                                <TextField name={"customURL"} value={formData.customURL}
                                                           onChange={handleInputChange}
                                                           size={"small"} type={'text'} autoFocus
                                                           error={!!errors.customURL}
                                                           helperText={errors.customURL}
                                                />
                                            </Stack>
                                            :
                                            <Link to={`${formData.customURL ? `/o/${formData.customURL}` : '#'}`}>
                                                {`https://example.com/${formData.customURL ? formData.customURL : 'your-organizer-name'}`}
                                            </Link>
                                        }
                                    </div>
                                }
                            </div>
                            <Tooltip title="Copy URL">
                                <IconButton onClick={handleCopyUrl}>
                                    <CopyAll/>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={`${editCustomURL ? 'Save' : 'Edit'} URL`} onClick={() => {setEditCustomURL(prev => !prev)}}>
                                <IconButton>
                                    {editCustomURL ? <SaveIcon/> : <Edit />}
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                    <div className="edit-organizer-profile__field">
                        <h3>Organizer Bio</h3>
                        <p>
                            Describe who you are, the types of events you host, or your mission. The bio is displayed on
                            your organizer profile.
                        </p>
                        <TextAreaWithLimit name="organizerBio"
                            value={formData.organizerBio} handleChange={handleInputChange}
                            maxChars={500} placeholder={"Write about the organizer..."} />
                    </div>
                </Stack>
                <Stack rowGap={2}>
                    <Stack rowGap={1}>
                        <h2>Social Media and Marketing</h2>
                        <p>Enter the URLs for your social media accounts.</p>
                    </Stack>
                    <div className="edit-organizer-profile__field">
                        <TextField name="socialMedia" variant="outlined" fullWidth
                                   label="Social Media Link"
                                   placeholder={"Put your social media links here, separated by commas (accepted links: facebook, twitter, instagram, linkedin)"}
                                   value={formData.socialMedia} onChange={handleInputChange}
                                   error={!!errors.socialMedia}
                                   helperText={errors.socialMedia}
                        />
                    </div>
                    <Stack direction={'row'} columnGap={1}>
                        <Switch name="emailOptIn" checked={formData.emailOptIn}
                            onChange={handleInputChange}
                        />
                        <Stack rowGap={1}>
                            <p>Email Opt-In</p>
                            <p>{formData.emailOptIn ? "Email notifications are enabled." : "Email notifications are disabled."}</p>
                        </Stack>
                    </Stack>
                </Stack>
                <div className="edit-organizer-profile__bottom-pane">
                    <Link to={'/organizer/u'}>
                        <Button variant="outlined" color="error">
                            Cancel
                        </Button>
                    </Link>
                    <Button variant="contained" color="primary" onClick={saveProfile}>
                        {isLoading ? <div className={'loader'}></div> : "Save"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default OrganizerProfileForm