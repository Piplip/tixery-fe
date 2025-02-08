import {Alert, Button, Stack, TextField, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {useFormik} from "formik";
import * as Yup from "yup";
import CheckIcon from '@mui/icons-material/Check';
import {CircularProgress} from "@mui/joy";

const validationSchema = Yup.object({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('New password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
        .required('Please confirm your password'),
});

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
                            open: true, msg: 'Password updated successfully', severity: 'success'
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
                    <Typography variant={'h5'} fontWeight={'bold'} style={{borderBottom: '1px solid gray', paddingBottom: '.5rem'}}>
                        Your password
                    </Typography>
                    <Typography fontSize={15} color={'gray'}>
                        Set a new password
                    </Typography>

                    {showResponse.open && <Alert severity={showResponse.severity}>{showResponse.msg}</Alert>}
                    <Stack spacing={2} width="100%" maxWidth="400px">
                        <form onSubmit={formik.handleSubmit}>
                            <Stack spacing={2}>
                                <TextField fullWidth
                                    label="Current Password"
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
                                    fullWidth label="New Password" name="newPassword" type="password" variant="outlined" required
                                    value={formik.values.newPassword}
                                    onChange={formik.handleChange} onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.newPassword && Boolean(formik.errors.newPassword)
                                    }
                                    helperText={formik.touched.newPassword && formik.errors.newPassword}
                                />

                                <TextField
                                    fullWidth label="Repeat Password" name="confirmPassword" type="password" variant="outlined" required
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
                                >
                                    {isLoading ? <CircularProgress color={'danger'} size={'sm'}/> : 'Update'}
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Stack>
                :
                <Stack rowGap={2}>
                    <Typography variant={'h5'} fontWeight={'bold'} style={{borderBottom: '1px solid gray', paddingBottom: '.5rem'}}>
                        Set password
                    </Typography>
                    <Stack rowGap={1}>
                        <Typography fontSize={15} color={'gray'}>
                            A password has not been set for your account.
                        </Typography>
                        <Button style={ButtonStyle} sx={{width: 'fit-content', padding: '.5rem 2rem'}}
                                onClick={handleRequestSetPassword}
                                disabled={isCounting}
                        >
                            {isLoading ?
                                <CircularProgress size={'sm'}/>
                                :
                                hasSendEmail ? 'Resend email' : 'Set Password'
                            }
                        </Button>
                        {isCounting && countdown !== 0 && (
                            <Typography fontSize={15} color={'gray'}>
                                Please wait {countdown} seconds to set your password.
                            </Typography>
                        )}
                        {hasSendEmail &&
                            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
                                We just sent you an email with a link to set your password. Please check your inbox.
                            </Alert>
                        }
                    </Stack>
                </Stack>
            }
        </Stack>
    )
}

export default AttendeePassword