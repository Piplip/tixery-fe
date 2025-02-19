import {Alert, Button, Stack, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {useFormik} from "formik";
import * as Yup from "yup";
import CheckIcon from '@mui/icons-material/Check';
import {CircularProgress} from "@mui/joy";

const ButtonStyle = {
    backgroundColor: '#e82727', marginBlock: '1rem', fontFamily: 'Raleway',
    color: 'white',
    '&:hover': {
        backgroundColor: '#d50000'
    }
}

function AttendeePassword(){
    const [hasSetPassword, setHasSetPassword] = useState(false);
    const [hasSendEmail, setHasSendEmail] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [isCounting, setIsCounting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showResponse, setShowResponse] = useState({
        open: false, msg: '', severity: null
    });

    const validationSchema = Yup.object({
        currentPassword: Yup.string().required(t('attendeePassword.currentPasswordRequired')),
        newPassword: Yup.string()
            .min(8, t('attendeePassword.passwordMinLength'))
            .required(t('attendeePassword.newPasswordRequired')),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], t('attendeePassword.passwordsMustMatch'))
            .required(t('attendeePassword.confirmPasswordRequired')),
    });

    const formik = useFormik({
        initialValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        },
        validationSchema,
        onSubmit: (values) => {
            setIsLoading(true)
            accountAxiosWithToken.post(`/update-password`, {
                email: getUserData('sub'),
                password: values.currentPassword,
                newPassword: values.newPassword,
            })
                .then(r => {
                    console.log(r.data)
                    setIsLoading(false)
                    if(r.data.status === 'OK'){
                        setShowResponse({
                            open: true, msg: t('attendeePassword.passwordUpdatedSuccessfully'), severity: 'success'
                        })
                    }
                    else{
                        setShowResponse({
                            open: true, msg: r.data.message, severity: 'error'
                        })
                    }
                })
                .catch(err => console.log(err))
        },
    });

    useEffect(() => {
        accountAxiosWithToken.get(`/check-password?u=${getUserData('sub')}`)
            .then(r => {
                setHasSetPassword(r.data)
            })
            .catch(err => console.log(err))
    }, []);

    useEffect(() => {
        if (isCounting && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown, isCounting]);

    function handleRequestSetPassword(){
        setIsLoading(true)
        accountAxiosWithToken.get(`/oauth2/set-password?u=${getUserData('sub')}`)
            .then(r => {
                setIsLoading(false)
                setHasSendEmail(true)
                setCountdown(60);
                setIsCounting(true);
            })
            .catch(err => console.log(err))
    }

    return (
        <Stack className={"attendee-password"} marginTop={3}>
            {hasSetPassword ?
                <Stack rowGap={2}>
                    <Typography variant={'h5'} fontWeight={'bold'} style={{ borderBottom: '1px solid gray', paddingBottom: '.5rem' }}>
                        {t('attendeePassword.yourPassword')}
                    </Typography>
                    <Typography fontSize={15} color={'gray'}>
                        {t('attendeePassword.setNewPassword')}
                    </Typography>

                    {showResponse.open && <Alert severity={showResponse.severity}>{showResponse.msg}</Alert>}
                    <Stack spacing={2} width="100%" maxWidth="400px">
                        <form onSubmit={formik.handleSubmit}>
                            <Stack spacing={2}>
                                <TextField fullWidth
                                           label={t('attendeePassword.currentPassword')}
                                           name="currentPassword" type="password" variant="outlined" required
                                           value={formik.values.currentPassword}
                                           onChange={formik.handleChange} onBlur={formik.handleBlur}
                                           error={
                                               formik.touched.currentPassword &&
                                               Boolean(formik.errors.currentPassword)
                                           }
                                           helperText={
                                               formik.touched.currentPassword && formik.errors.currentPassword
                                           }
                                />
                                <TextField
                                    fullWidth label={t('attendeePassword.newPassword')} name="newPassword" type="password" variant="outlined" required
                                    value={formik.values.newPassword}
                                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.newPassword && Boolean(formik.errors.newPassword)
                                    }
                                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                                />

                                <TextField
                                    fullWidth label={t('attendeePassword.repeatPassword')} name="confirmPassword" type="password" variant="outlined" required
                                    value={formik.values.confirmPassword}
                                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.confirmPassword &&
                                        Boolean(formik.errors.confirmPassword)
                                    }
                                    helperText={
                                        formik.touched.confirmPassword && formik.errors.confirmPassword
                                    }
                                />

                                <Button type="submit" variant="contained"
                                        sx={ButtonStyle}
                                        disabled={isLoading}
                                >
                                    {isLoading ? <CircularProgress color={'danger'} size={'sm'} /> : t('attendeePassword.update')}
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Stack>
                :
                <Stack rowGap={2}>
                    <Typography variant={'h5'} fontWeight={'bold'} style={{ borderBottom: '1px solid gray', paddingBottom: '.5rem' }}>
                        {t('attendeePassword.setPassword')}
                    </Typography>
                    <Stack rowGap={1}>
                        <Typography fontSize={15} color={'gray'}>
                            {t('attendeePassword.noPasswordSet')}
                        </Typography>
                        <Button style={ButtonStyle} sx={{ width: 'fit-content', padding: '.5rem 2rem' }}
                                onClick={handleRequestSetPassword}
                                disabled={isCounting || isLoading}
                        >
                            {isLoading ?
                                <CircularProgress size={'sm'} />
                                :
                                hasSendEmail ? t('attendeePassword.resendEmail') : t('attendeePassword.setPassword')}
                        </Button>
                        {isCounting && countdown !== 0 && (
                            <Typography fontSize={15} color={'gray'}>
                                {t('attendeePassword.waitToSetPassword', {countdown})}
                            </Typography>
                        )}
                        {hasSendEmail && (
                            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
                                {t('attendeePassword.emailSentToSetPassword')}
                            </Alert>
                        )}
                    </Stack>
                </Stack>
            }
        </Stack>
    );
}

export default AttendeePassword