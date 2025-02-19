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
import DragAndDropZone from "../shared/DragAndDropZone.jsx";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import {generateFileName, getUserData} from "../../common/Utilities.js";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import SaveIcon from '@mui/icons-material/Save';
import PropTypes from "prop-types";
import TextAreaWithLimit from "../shared/TextAreaWithLimit.jsx";
import {useTranslation} from "react-i18next";

OrganizerProfileForm.propTypes = {
    profileData: PropTypes.object
}

initializeApp(firebaseConfig);
const storage = getStorage()

function OrganizerProfileForm({profileData}){
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
    const formRef = useRef(formData)
    const [alert, setAlert] = useState({
        open: false, message: ""
    })
    const location = useLocation()
    const [errors, setErrors] = useState({});
    const [editCustomURL, setEditCustomURL] = useState(false);
    const {t} = useTranslation()

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
                        setErrors((prevErrors) => ({ ...prevErrors, customURL: t('organizerProfileForm.urlTaken') }));
                    }
                })
        }
    }

    function validateForm() {
        const newErrors = {};
        if (!formData.organizerName.trim()) newErrors.organizerName = t('organizerProfileForm.orgNameRequired');
        if (formData.socialMedia !== "") {
            const socialMediaLinks = formData.socialMedia.split(',').map(link => link.trim());
            for (const link of socialMediaLinks) {
                if (!link.includes('facebook') && !link.includes('x.com') && !link.includes('instagram') && !link.includes('linkedin')) {
                    newErrors.socialMedia = t('organizerProfileForm.validSocialMedia');
                    break;
                }
            }
        }
        return newErrors;
    }

    function handleCopyUrl() {
        const url = `http://localhost:5173/o/${formData.customURL}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setAlert({ open: true, message: t('organizerProfileForm.urlCopied') });
            })
            .catch(err => console.log(err))
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

    function isChanged(){
        return formRef.current.organizerName !== formData.organizerName ||
            formRef.current.organizerBio !== formData.organizerBio ||
            formRef.current.socialMedia !== formData.socialMedia ||
            formRef.current.emailOptIn !== formData.emailOptIn ||
            formRef.current.ppImageURL !== formData.ppImageURL ||
            formRef.current.customURL !== formData.customURL
    }

    async function saveProfile() {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        if(isChanged()){
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
                            setAlert({ open: true, message: t('organizerProfileForm.profileCreated') });
                        }
                        else if(r.data.message === "Profile updated"){
                            if(r.data.data !== null){
                                localStorage.setItem('tk', r.data.data)
                            }
                            setAlert({ open: true, message: t('organizerProfileForm.profileUpdated') });
                        }
                        setTimeout(() => {
                            window.location.href = '/organizer/u'
                        }, 2000)
                    })
                    .catch(err => console.log(err))
            }
        }
    }

    return (
        <div className="edit-organizer-profile">
            <Snackbar sx={{ marginTop: '3rem' }} autoHideDuration={3000}
                      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                      open={alert.open} onClose={() => setAlert({ open: false, message: "" })}
            >
                <Alert severity={"success"} variant="filled" sx={{ width: '100%', backgroundColor: '#21cc0f' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
            <Link to={'/organizer/u'}>
                <div className={'go-back-link'}>← {t('organizerProfileForm.orgSettings')}</div>
            </Link>
            <h1 className="edit-organizer-profile__title">{t('organizerProfileForm.editOrgProfile')}</h1>
            <form className="edit-organizer-profile__form" onSubmit={(e) => e.preventDefault()}>
                <div className="edit-organizer-profile__field">
                    <h2>{t('organizerProfileForm.orgProfileImage')}</h2>
                    <p>
                        {t('organizerProfileForm.orgImageDescription')}
                    </p>
                    <DragAndDropZone image={formData.ppImageURL}
                                     onFileSelect={(file) => setFormData({ ...formData, ppImageURL: file })}
                    />

                </div>
                <Stack rowGap={3}>
                    <Stack rowGap={1}>
                        <h2>{t('organizerProfileForm.aboutOrg')}</h2>
                        <div>{t('organizerProfileForm.aboutOrgDescription')}
                            <Link to={'/help'}>
                                <div className={'help-link'}>{t('organizerProfileForm.learnMore')}</div>
                            </Link>
                        </div>
                        <TextField name="organizerName" variant="outlined" fullWidth placeholder={t('organizerProfileForm.orgNameRequired')}
                                   label={t('organizerProfileForm.orgName')} sx={{ marginTop: 2 }}
                                   value={formData.organizerName}
                                   onChange={handleInputChange}
                                   error={!!errors.organizerName}
                                   helperText={errors.organizerName}
                        />
                    </Stack>
                    <Stack rowGap={1}>
                        <h3>{t('organizerProfileForm.orgPageURL')}</h3>
                        <p>
                            {t('organizerProfileForm.orgURLDescription')}
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
                                            <Link to={`${formData.customURL ? `/o/${formData.customURL}` : '#'}`} target={'_blank'}>
                                                {`https://example.com/${formData.customURL ? formData.customURL : t('organizerProfileForm.yourOrgName')}`}
                                            </Link>
                                        }
                                    </div>
                                }
                            </div>
                            <Tooltip title={t('organizerProfileForm.copyURL')}>
                                <IconButton onClick={handleCopyUrl}>
                                    <CopyAll />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={t('organizerProfileForm.editURL')} onClick={() => { setEditCustomURL(prev => !prev) }}>
                                <IconButton>
                                    {editCustomURL ? <SaveIcon /> : <Edit />}
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>
                    <div className="edit-organizer-profile__field">
                        <h3>{t('organizerProfileForm.orgBio')}</h3>
                        <p>
                            {t('organizerProfileForm.orgBioDescription')}
                        </p>
                        <TextAreaWithLimit name="organizerBio"
                                           value={formData.organizerBio} handleChange={handleInputChange}
                                           maxChars={500} placeholder={t('organizerProfileForm.writeAboutOrg')} />
                    </div>
                </Stack>
                <Stack rowGap={2}>
                    <Stack rowGap={1}>
                        <h2>{t('organizerProfileForm.socialMediaMarketing')}</h2>
                        <p>{t('organizerProfileForm.socialMediaDescription')}</p>
                    </Stack>
                    <div className="edit-organizer-profile__field">
                        <TextField name="socialMedia" variant="outlined" fullWidth
                                   label={t('organizerProfileForm.socialMediaLink')}
                                   placeholder={t('organizerProfileForm.socialMediaPlaceholder')}
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
                            <p>{t('organizerProfileForm.emailOptIn')}</p>
                            <p>{formData.emailOptIn ? t('organizerProfileForm.emailEnabled') : t('organizerProfileForm.emailDisabled')}</p>
                        </Stack>
                    </Stack>
                </Stack>
                <div className="edit-organizer-profile__bottom-pane">
                    <Link to={'/organizer/u'}>
                        <Button variant="outlined" color="error">
                            {t('organizerProfileForm.cancel')}
                        </Button>
                    </Link>
                    <Button variant="contained" color="primary" onClick={saveProfile}>
                        {isLoading ? <div className={'loader'}></div> : t('organizerProfileForm.save')}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default OrganizerProfileForm