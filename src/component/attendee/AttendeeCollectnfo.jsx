import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    Container,
    Dialog,
    DialogContent,
    DialogContentText,
    FormControl,
    FormGroup,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Slide,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {DatePicker} from "@mui/x-date-pickers";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import {PhotoCamera} from "@mui/icons-material";
import {forwardRef, useState} from "react";
import {firebaseConfig} from "@/config/firebaseConfig.js";
import {initializeApp} from "firebase/app";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import accountAxios, {accountAxiosWithToken} from "../../config/axiosConfig.js";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {useLocation, useNavigate} from "react-router-dom";
import {countries} from "@/common/Data.js";
import {generateFileName, getUserData, hasSearchParam} from "@/common/Utilities.js";
import {useTranslation} from "react-i18next";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

initializeApp(firebaseConfig);
const storage = getStorage()

function AttendeeCollectnfo() {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState({
        firstName: '', lastName: '', nickname: '', dob: null, gender: '', phone: '', nationality: null,
        ppName: '', ppDescription: '', ppImage: '',
    })
    const [ppImagePreview, setPpImagePreview] = useState(null)
    const schema = Yup.object().shape({
        firstName: Yup.string().required(t('attendeeCollectInfo.firstNameRequired')),
        lastName: Yup.string().required(t('attendeeCollectInfo.lastNameRequired')),
        dob: Yup.date().required(t('attendeeCollectInfo.dobRequired')),
        gender: Yup.string().required(t('attendeeCollectInfo.genderRequired')),
        phone: Yup.string().required(t('attendeeCollectInfo.phoneRequired')),
        nationality: Yup.string().required(t('attendeeCollectInfo.nationalityRequired'))
    });
    const [open, setOpen] = useState(false);
    const location = useLocation()

    const fullName = (hasSearchParam("method") && getUserData("fullName"))
        ? getUserData("fullName").split(' ')
        : '';

    function handleImageUpload(event) {
        const file = event.target.files[0];
        setUserData(prev => ({...prev, ppImage: file}))
        if (!file) {
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert(t('attendeeCollectInfo.fileSizeLimit'));
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPpImagePreview(reader.result);
        reader.readAsDataURL(file);
    }

    async function uploadImage() {
        const fileName = generateFileName()
        const storageRef = ref(storage, `/profile-image/${fileName}`)
        uploadBytes(storageRef, userData.ppImage)
            .then(res => {
                setUserData({...userData, ppImage: res.metadata.fullPath})
            })
            .catch(err => console.log(err))
    }

    function handleSave() {
        uploadImage().then(() => {
            accountAxios.post('/profile/create?rid=' + location.search.split('=')[1] + '&type=attendee', {
                fullName: userData.lastName + " " + userData.firstName,
                nickname: userData.nickname ? userData.nickname : '',
                dob: userData.dob.format('DD/MM/YYYY'),
                gender: userData.gender,
                phone: userData.phone,
                nationality: userData.nationality,
                ppName: userData.ppName ? userData.ppName : userData.firstName + "'s profile",
                ppDescription: userData.ppDescription,
                ppImageURL: userData.ppImage
            }).then(() => {
                setOpen(true)
            }).catch(err => console.log(err))
        })
    }

    function handleOauth2Save() {
        uploadImage().then(() => {
            accountAxiosWithToken.post('/profile/oauth/create?email=' + getUserData('sub') + '&type=attendee', {
                fullName: userData.lastName + " " + userData.firstName,
                nickname: userData.nickname ? userData.nickname : '',
                dob: userData.dob.format('DD/MM/YYYY'),
                gender: userData.gender,
                phone: userData.phone,
                nationality: userData.nationality,
                ppName: userData.ppName ? userData.ppName : userData.firstName + "'s profile",
                ppDescription: userData.ppDescription,
                ppImageURL: userData.ppImage
            }).then(() => {
                setOpen(true)
            }).catch(err => console.log(err))
        })
    }

    function getUpdateToken() {
        accountAxiosWithToken.get('/profile/oauth/update?for=' + getUserData('sub'))
            .then(r => {
                if (r.data.status === 'OK') {
                    localStorage.setItem('tk', r.data.data)
                    window.location.href = '/'
                }
            })
            .catch(err => console.log(err))
    }

    function extractName(fullName) {
        if (fullName === '') return ['', '']
        let firstName = ''
        let lastName = ''
        if (fullName.length === 1) {
            firstName = fullName[0]
        } else if (fullName.length === 2) {
            firstName = fullName[0]
            lastName = fullName[1]
        } else if (fullName.length >= 3) {
            firstName = fullName[fullName.length - 1]
            lastName = fullName.slice(0, fullName.length - 1).join(' ')
        }

        return [firstName, lastName]
    }

    return (
        <>
            {step === 1 &&
                <Container maxWidth="md" sx={{mt: 4}}>
                    <Typography variant={'h3'} textAlign={'center'} gutterBottom>
                        {t('attendeeCollectInfo.provideInfo')}
                    </Typography>
                    <Box sx={{p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "#fafafa"}}>
                        <Typography variant="h5" gutterBottom>
                            {t('attendeeCollectInfo.profileInfo')}
                        </Typography>
                        <Formik
                            initialValues={{
                                firstName: extractName(fullName)[0] || '',
                                lastName: extractName(fullName)[1] || '',
                                nickname: '',
                                dob: null,
                                gender: '',
                                phone: '',
                                nationality: null
                            }}
                            enableReinitialize={true}
                            validationSchema={schema}
                            onSubmit={async (values) => {
                                setUserData(values);
                                setStep(2);
                            }}
                        >
                            {({
                                  values, errors, touched,
                                  handleChange, handleBlur, handleSubmit
                              }) => (
                                <Form style={{
                                    width: '100%', display: 'flex', flexDirection: 'column', height: 'fit-content'
                                }}
                                >
                                    <Stack direction={'row'} columnGap={1} sx={{mb: 2}}>
                                        <TextField label={t('attendeeCollectInfo.firstName')} name="firstName" fullWidth
                                                   value={values.firstName}
                                                   onBlur={handleBlur} onChange={handleChange}
                                                   error={touched.firstName && Boolean(errors.firstName)}
                                                   helperText={touched.firstName && errors.firstName}
                                        />

                                        <TextField label={t('attendeeCollectInfo.lastName')} name="lastName" fullWidth
                                                   value={values.lastName}
                                                   onBlur={handleBlur} onChange={handleChange}
                                                   error={touched.lastName && Boolean(errors.lastName)}
                                                   helperText={touched.lastName && errors.lastName}
                                        />
                                    </Stack>

                                    <Stack direction={'row'} columnGap={1} sx={{mb: 2}}>
                                        <TextField label={t('attendeeCollectInfo.nickname')} name="nickname"
                                                   value={values.nickname} fullWidth
                                                   onChange={handleChange} onBlur={handleBlur}
                                                   error={touched.nickname && Boolean(errors.nickname)}
                                                   helperText={touched.nickname && errors.nickname}
                                        />

                                        <FormControl sx={{width: '100%'}}
                                                     error={touched.gender && Boolean(errors.gender)}
                                        >
                                            <InputLabel
                                                id="demo-select-small-label">{t('attendeeCollectInfo.gender')}</InputLabel>
                                            <Select value={values.gender} label={t('attendeeCollectInfo.gender')}
                                                    name={'gender'}
                                                    onChange={handleChange}
                                                    onBlur={handleBlur}
                                            >
                                                <MenuItem
                                                    value=""><em>{t('attendeeCollectInfo.selectGender')}</em></MenuItem>
                                                <MenuItem value={'male'}>{t('attendeeCollectInfo.male')}</MenuItem>
                                                <MenuItem value={'female'}>{t('attendeeCollectInfo.female')}</MenuItem>
                                                <MenuItem value={'other'}>{t('attendeeCollectInfo.other')}</MenuItem>
                                                <MenuItem
                                                    value={'not'}>{t('attendeeCollectInfo.ratherNotSay')}</MenuItem>
                                            </Select>
                                            {touched.gender && Boolean(errors.gender) &&
                                                <FormHelperText>
                                                    {errors.gender}
                                                </FormHelperText>
                                            }
                                        </FormControl>

                                        <FormGroup sx={{width: '100%'}}>
                                            <DatePicker sx={{width: '100%'}}
                                                        label={t('attendeeCollectInfo.dob')} value={values.dob}
                                                        disableFuture format={'DD/MM/YYYY'}
                                                        onChange={val => values.dob = val}
                                            />
                                            {touched.dob && Boolean(errors.dob) &&
                                                <FormHelperText sx={{ml: 2}} error={true}>{errors.dob}</FormHelperText>
                                            }
                                        </FormGroup>
                                    </Stack>

                                    <Stack direction={'row'} columnGap={1}>
                                        <Autocomplete options={countries} id={"nationality"} sx={{width: '100%'}}
                                                      autoHighlight getOptionLabel={(option) => option.label}
                                                      onChange={(_, val) => values.nationality = val?.code}
                                                      renderOption={(props, option) => {
                                                          // eslint-disable-next-line react/prop-types
                                                          const {key, ...optionProps} = props;
                                                          return (
                                                              <Box
                                                                  key={key}
                                                                  component="li"
                                                                  sx={{'& > img': {mr: 2, flexShrink: 0}}}
                                                                  {...optionProps}
                                                              >
                                                                  <img loading="lazy" width="20" alt=""
                                                                       srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                                                       src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                                                  />
                                                                  {option.label} ({option.code}) +{option.phone}
                                                              </Box>
                                                          );
                                                      }}
                                                      renderInput={(params) => (
                                                          <TextField
                                                              {...params}
                                                              label={t('attendeeCollectInfo.nationality')}
                                                              name={"nationality"}
                                                              onBlur={handleBlur}
                                                              error={touched.nationality && Boolean(errors.nationality)}
                                                              helperText={touched.nationality && errors.nationality}
                                                              slotProps={{
                                                                  htmlInput: {
                                                                      ...params.inputProps,
                                                                      autoComplete: 'new-password',
                                                                  },
                                                              }}
                                                          />
                                                      )}
                                        />
                                        <TextField label={t('attendeeCollectInfo.phoneNumber')} name="phone"
                                                   value={values.phone} fullWidth
                                                   onChange={handleChange} onBlur={handleBlur}
                                                   error={touched.phone && Boolean(errors.phone)}
                                                   helperText={touched.phone && errors.phone}
                                        />
                                    </Stack>

                                    <Button type="submit" variant="contained" fullWidth
                                            onSubmit={handleSubmit}
                                            sx={{mt: 2, bgcolor: "#1976d2", color: "#fff"}}
                                    >
                                        {t('attendeeCollectInfo.saveProfile')}
                                    </Button>
                                </Form>
                            )}
                        </Formik>
                    </Box>
                </Container>
            }
            {step === 2 &&
                <Box sx={{
                    maxWidth: 600,
                    mx: 'auto', p: 3, mt: 5,
                    boxShadow: 3, borderRadius: 2,
                    backgroundColor: 'background.paper',
                }}
                >
                    <Typography variant="h5" align="center" gutterBottom>
                        {t('attendeeCollectInfo.shareWithOthers')}
                    </Typography>
                    <Box sx={{textAlign: 'center', mb: 3}}>
                        <Avatar
                            src={ppImagePreview}
                            sx={{width: 120, height: 120, mx: 'auto', fontSize: '4rem', bgcolor: 'gray'}}
                            alt={t('attendeeCollectInfo.profile')}
                        >
                            {userData.firstName.charAt(0).toUpperCase()}
                        </Avatar>
                        <IconButton color="primary" component="label" sx={{mt: 2}}>
                            <PhotoCamera/>
                            <input hidden accept="image/*" type="file" onChange={handleImageUpload}/>
                        </IconButton>
                    </Box>

                    <Stack spacing={2}>
                        <TextField label={t('attendeeCollectInfo.profileName')} fullWidth variant="outlined"
                                   placeholder={userData.firstName + "'s profile"}
                                   value={userData.ppName || ''}
                                   onChange={(e) => setUserData({...userData, ppName: e.target.value})}
                        />
                        <TextField label={t('attendeeCollectInfo.profileDescription')} fullWidth multiline rows={4}
                                   variant="outlined"
                                   value={userData.ppDescription}
                                   onChange={(e) => setUserData({...userData, ppDescription: e.target.value})}
                        />
                    </Stack>
                    <Box sx={{textAlign: 'center', mt: 3}}>
                        <Button variant="contained" color="primary" onClick={() => {
                            if (hasSearchParam("method")) {
                                handleOauth2Save();
                            } else handleSave();
                        }}>
                            {t('attendeeCollectInfo.completeAndEnjoy')}
                        </Button>
                    </Box>
                </Box>
            }
            <Dialog open={open} TransitionComponent={Transition}>
                <DialogContent sx={{textAlign: 'center', color: 'green', p: 4}}>
                    <CheckCircleOutlineIcon sx={{fontSize: '8rem'}}/>
                    <DialogContentText sx={{fontSize: '2rem', marginBottom: 3}}>
                        {t('attendeeCollectInfo.allSetEnjoy')} {userData.firstName}!
                    </DialogContentText>
                    <Button color={'success'} variant={'outlined'} fullWidth
                            onClick={() => hasSearchParam('method') ? getUpdateToken() : navigate('/login')}
                    >
                        {hasSearchParam('method') ? t('attendeeCollectInfo.goToHome') : t('attendeeCollectInfo.login')}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default AttendeeCollectnfo;