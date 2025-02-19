import {forwardRef, useState} from "react";
import {
    Autocomplete, Avatar,
    Box, Button,
    Container, Dialog, DialogContent, DialogContentText,
    IconButton,
    Slide,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import * as Yup from "yup";
import {generateFileName, getUserData, hasSearchParam} from "../../common/Utilities.js";
import accountAxios, {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {Form, Formik} from "formik";
import {countries} from "../../common/Data.js";
import {PhotoCamera} from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

initializeApp(firebaseConfig);
const storage = getStorage()

function OrganizerCollectInfo(){
    const {t} = useTranslation()
    const [ppImage, setPpImage] = useState(null)
    const [ppImagePreview, setPpImagePreview] = useState(null)
    const schema = Yup.object().shape({
        organization: Yup.string().required(t('organizerCollectInfo.organizationRequired')),
        phone: Yup.string().required(t('organizerCollectInfo.phoneRequired')),
        nationality: Yup.string().required(t('organizerCollectInfo.nationalityRequired')),
        ...(
            hasSearchParam("rid") && { name: Yup.string().required(t('organizerCollectInfo.nameRequired')) }
        )
    });
    const [open, setOpen] = useState(false);
    const navigate = useNavigate()

    function handleImageUpload (event) {
        const file = event.target.files[0];
        setPpImage(file)
        if (!file) {
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert('File size exceeds the maximum limit (3MB).');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPpImagePreview(reader.result);
        reader.readAsDataURL(file);
    }

    async function uploadImage(){
        const fileName = generateFileName()
        const storageRef = ref(storage, `/profile-image/${fileName}`)
        uploadBytes(storageRef, ppImage)
            .then(res => {
                setPpImage(res.metadata.fullPath)
            })
            .catch(err => console.log(err))
    }

    function handleSave(values) {
        uploadImage().then(() => {
            if(hasSearchParam("method")){
                accountAxiosWithToken.post('/profile/oauth/create?email=' + getUserData('sub') + '&type=organizer', {
                    ppName: values.organization,
                    phone: values.phone,
                    nationality: values.nationality,
                    ppImageURL: ppImage
                }).then(() => {
                    setOpen(true)
                }).catch(err => console.log(err))
            }
            else{
                accountAxios.post('/profile/create?rid=' + location.search.split('=')[1] + '&type=organizer', {
                    fullName: values.name,
                    ppName: values.organization,
                    phone: values.phone,
                    nationality: values.nationality,
                    ppImageURL: ppImage
                }).then(() => {
                    setOpen(true)
                }).catch(err => console.log(err))
            }
        })
    }

    function getUpdateToken(){
        accountAxiosWithToken.get('/profile/oauth/update?for=' + getUserData('sub'))
            .then(r => {
                if(r.data.status === 'OK'){
                    localStorage.setItem('tk', r.data.data)
                    navigate('/organizer')
                }
            })
            .catch(err => console.log(err))
    }

    return (
        <>
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant={'h3'} textAlign={'center'} gutterBottom>
                    {t('organizerCollectInfo.provideOrgInfo')}
                </Typography>
                <Box sx={{ p: 3, boxShadow: 3, borderRadius: 2, bgcolor: "#fafafa" }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Avatar src={ppImagePreview} alt={t('organizerCollectInfo.profile')}
                                sx={{ width: 120, height: 120, mx: 'auto', fontSize: '4rem', bgcolor: 'gray' }}
                        />
                        <IconButton color="primary" component="label" sx={{ mt: 2 }}>
                            <PhotoCamera />
                            <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                        </IconButton>
                    </Box>
                    <Formik
                        initialValues={{ name: '', organization: '', phone: '', nationality: null }}
                        validationSchema={schema}
                        onSubmit={async (values) => {
                            handleSave(values);
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
                                {hasSearchParam("rid") &&
                                    <TextField label={t('organizerCollectInfo.yourName')} name="name" value={values.name} fullWidth sx={{ marginBottom: 2 }}
                                               onBlur={handleBlur} onChange={handleChange}
                                               error={touched.name && Boolean(errors.name)}
                                               helperText={touched.name && errors.name}
                                    />
                                }

                                <TextField label={t('organizerCollectInfo.orgName')} name="organization" value={values.organization} fullWidth sx={{ marginBottom: 2 }}
                                           onBlur={handleBlur} onChange={handleChange}
                                           error={touched.organization && Boolean(errors.organization)}
                                           helperText={touched.organization && errors.organization}
                                />

                                <Stack direction={'row'} columnGap={1}>
                                    <Autocomplete options={countries} id={"nationality"} sx={{ width: '100%' }}
                                                  autoHighlight getOptionLabel={(option) => option.label}
                                                  onChange={(_, val) => values.nationality = val?.code}
                                                  renderOption={(props, option) => {
                                                      // eslint-disable-next-line react/prop-types
                                                      const { key, ...optionProps } = props;
                                                      return (
                                                          <Box
                                                              key={key}
                                                              component="li"
                                                              sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
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
                                                          label={t('organizerCollectInfo.nationality')} name={"nationality"}
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
                                    <TextField label={t('organizerCollectInfo.phoneNumber')} name="phone" value={values.phone} fullWidth
                                               onChange={handleChange} onBlur={handleBlur}
                                               error={touched.phone && Boolean(errors.phone)}
                                               helperText={touched.phone && errors.phone}
                                    />
                                </Stack>

                                <Button type="submit" variant="contained" fullWidth
                                        onSubmit={handleSubmit}
                                        sx={{ mt: 2, bgcolor: "#1976d2", color: "#fff" }}
                                >
                                    {t('organizerCollectInfo.saveProfile')}
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Box>
            </Container>
            <Dialog open={open} TransitionComponent={Transition}>
                <DialogContent sx={{ textAlign: 'center', color: 'green', p: 4 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: '8rem' }} />
                    <DialogContentText sx={{ fontSize: '2rem', marginBottom: 3 }}>
                        {t('organizerCollectInfo.allSet')}
                    </DialogContentText>
                    <Button color={'success'} variant={'outlined'} fullWidth
                            onClick={() => hasSearchParam('method') ? getUpdateToken() : navigate('/login')}
                    >
                        {hasSearchParam('method') ? t('organizerCollectInfo.goToHome') : t('organizerCollectInfo.login')}
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default OrganizerCollectInfo