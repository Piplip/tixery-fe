import {useOutletContext} from "react-router-dom";
import {
    Autocomplete,
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import DragAndDropZone from "../shared/DragAndDropZone.jsx";
import * as Yup from "yup";
import {Form, Formik} from "formik";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getStorage, ref, uploadBytes} from "firebase/storage";
import {generateFileName} from "../../common/Utilities.js";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {useState} from "react";
import dayjs from "dayjs";
import {CircularProgress} from "@mui/joy";
import {countries} from "../../common/Data.js";
import {DatePicker} from "@mui/x-date-pickers";
import {useTranslation} from "react-i18next";

initializeApp(firebaseConfig);
const storage = getStorage()

function AttendeeContactInfo() {
    const {t} = useTranslation()
    const {pid, data} = useOutletContext()
    const [isLoading, setIsLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const validationSchema = Yup.object({
        profile_name: Yup.string().required(t('attendeeContactInfo.profileNameRequired')),
        description: Yup.string().required(t('attendeeContactInfo.descriptionRequired')),
        full_name: Yup.string().required(t('attendeeContactInfo.fullNameRequired')),
        nickname: Yup.string().required(t('attendeeContactInfo.nicknameRequired')),
        date_of_birth: Yup.date()
            .required(t('attendeeContactInfo.dateOfBirthRequired'))
            .typeError(t('attendeeContactInfo.validDate')),
        phone_number: Yup.string().required(t('attendeeContactInfo.phoneNumberRequired')),
    });

    const initialValues = {
        profile_name: data?.profile_name || '',
        description: data?.description || '',
        full_name: data?.full_name || '',
        nickname: data?.nickname || '',
        date_of_birth: dayjs(data?.date_of_birth, 'YYYY/MM/DD') || '',
        gender: data?.gender || '',
        phone_number: data?.phone_number || '',
        nationality: data?.nationality || 'VN',
    };

    const handleSubmit = async (values, actions) => {
        setIsLoading(true)
        if (data.profile_image_url instanceof File) {
            const fileName = generateFileName()
            const imgRef = ref(storage, `/profile-images/${fileName}`)
            const uploadTask = await uploadBytes(imgRef, data.profile_image_url)
            data.profile_image_url = uploadTask.metadata.fullPath
        }

        accountAxiosWithToken.put(`/attendee/profile/update?pid=${pid}&udid=${data?.user_data_id}`, {
            fullName: values.full_name,
            nickname: values.nickname,
            dob: values.date_of_birth.format('DD/MM/YYYY'),
            gender: values.gender,
            phone: values.phone_number,
            ppName: values.profile_name,
            ppDescription: values.description,
            ppImageURL: data.profile_image_url,
            nationality: values.nationality
        })
            .then(r => {
                console.log(r.data)
                setIsLoading(false)
                setOpen(true)
            })
            .catch(err => console.log(err))
        actions.setSubmitting(false);
    };

    return (
        <Stack className={'attendee-contact-info'}>
            <Snackbar
                open={open}
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                autoHideDuration={5000}
                onClose={() => setOpen(false)}
                message={t('attendeeContactInfo.updatedSuccessfully')}
            />
            <Stack rowGap={3}>
                <Typography fontSize={'1.6rem'}
                            fontWeight={'bold'}>{t('attendeeContactInfo.profilePicture')}</Typography>
                {data?.profile_image_url &&
                    <DragAndDropZone image={data.profile_image_url}
                                     onFileSelect={(file) => data.profile_image_url = file}/>
                }
            </Stack>
            <Stack rowGap={3}>
                <Typography fontSize={'1.6rem'} fontWeight={'bold'}>{t('attendeeContactInfo.info')}</Typography>
                <Formik
                    initialValues={initialValues}
                    enableReinitialize={true}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {({
                          values,
                          errors,
                          touched,
                          handleChange,
                          handleBlur,
                          isSubmitting,
                      }) => (
                        <Form style={{width: '70%', alignSelf: 'center'}}>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth label={t('attendeeContactInfo.profileName')} name="profile_name"
                                    value={values.profile_name}
                                    onChange={handleChange} onBlur={handleBlur}
                                    error={touched.profile_name && Boolean(errors.profile_name)}
                                    helperText={touched.profile_name && errors.profile_name}
                                />

                                <TextField
                                    fullWidth label={t('attendeeContactInfo.description')} name="description"
                                    multiline rows={3}
                                    value={values.description}
                                    onChange={handleChange} onBlur={handleBlur}
                                    error={touched.description && Boolean(errors.description)}
                                    helperText={touched.description && errors.description}
                                />

                                <Stack direction={'row'} columnGap={1.5}>
                                    <TextField
                                        fullWidth label={t('attendeeContactInfo.fullName')} name="full_name"
                                        value={values.full_name}
                                        onChange={handleChange} onBlur={handleBlur}
                                        error={touched.full_name && Boolean(errors.full_name)}
                                        helperText={touched.full_name && errors.full_name}
                                    />

                                    <TextField
                                        fullWidth label={t('attendeeContactInfo.nickname')} name="nickname"
                                        value={values.nickname}
                                        onChange={handleChange} onBlur={handleBlur}
                                        error={touched.nickname && Boolean(errors.nickname)}
                                        helperText={touched.nickname && errors.nickname}
                                    />
                                </Stack>

                                <Stack direction={'row'} columnGap={1.5}>
                                    <FormControl sx={{width: '100%'}} error={touched.gender && Boolean(errors.gender)}
                                    >
                                        <InputLabel>{t('attendeeContactInfo.gender')}</InputLabel>
                                        <Select value={values.gender} label={t('attendeeContactInfo.gender')}
                                                name={'gender'}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                        >
                                            <MenuItem
                                                value=""><em>{t('attendeeContactInfo.selectGender')}</em></MenuItem>
                                            <MenuItem value={'male'}>{t('attendeeContactInfo.male')}</MenuItem>
                                            <MenuItem value={'female'}>{t('attendeeContactInfo.female')}</MenuItem>
                                            <MenuItem value={'other'}>{t('attendeeContactInfo.other')}</MenuItem>
                                            <MenuItem value={'not'}>{t('attendeeContactInfo.ratherNotSay')}</MenuItem>
                                        </Select>
                                        {touched.gender && Boolean(errors.gender) &&
                                            <FormHelperText>
                                                {errors.gender}
                                            </FormHelperText>
                                        }
                                    </FormControl>

                                    <DatePicker sx={{width: '100%'}} format={"DD/MM/YYYY"}
                                                label={t('attendeeContactInfo.dateOfBirth')}
                                                value={values.date_of_birth}
                                                onChange={(date) => {
                                                    values.date_of_birth = date;
                                                    data.date_of_birth = date;
                                                }}
                                    />

                                    <TextField
                                        fullWidth label={t('attendeeContactInfo.phoneNumber')} name="phone_number"
                                        value={values.phone_number}
                                        onChange={handleChange} onBlur={handleBlur}
                                        error={touched.phone_number && Boolean(errors.phone_number)}
                                        helperText={touched.phone_number && errors.phone_number}
                                    />
                                </Stack>

                                <Autocomplete options={countries} id={"nationality"} sx={{width: '100%'}}
                                              autoHighlight getOptionLabel={(option) => option.label}
                                              inputValue={countries.find(c => c.code === values.nationality)?.label}
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
                                                      label={t('attendeeContactInfo.nationality')} name={"nationality"}
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

                                <Button type="submit" variant="contained" color="primary"
                                        disabled={isSubmitting || Object.keys(errors).length > 0}>
                                    {isLoading ? <CircularProgress size={'sm'}/> : t('attendeeContactInfo.save')}
                                </Button>
                            </Stack>
                        </Form>
                    )}
                </Formik>
            </Stack>
        </Stack>
    );
}

export default AttendeeContactInfo;