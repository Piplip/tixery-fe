import {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Alert, Button, Stack, TextField, Typography} from "@mui/material";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

function AttendeeSetPassword(){
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate()
    const {t} = useTranslation()

    const validationSchema = Yup.object({
        password: Yup.string()
            .min(8, t('attendeeSetPassword.passwordMinLength'))
            .required(t('attendeeSetPassword.passwordRequired')),
    });

    const formik = useFormik({
        initialValues: { password: '' },
        validationSchema: validationSchema,
        onSubmit: (values) => {
            accountAxiosWithToken.post(`/oauth2/set-password?u=${getUserData('sub')}`, values.password)
                .then(() => {
                    setSuccess(true)
                    setTimeout(() => navigate(-1), 1000)
                })
                .catch(err => console.log(err))
            setSuccess(true);
        },
    });

    return (
        <Stack spacing={2} width="100%" maxWidth="400px">
            <Typography variant="h5" fontWeight="bold">
                {t('attendeeSetPassword.setPassword')}
            </Typography>

            {success && <Alert severity="success">{t('attendeeSetPassword.passwordSetSuccessfully')}</Alert>}

            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth label={t('attendeeSetPassword.newPassword')} name="password" type="password" variant="outlined" required
                        value={formik.values.password}
                        onChange={formik.handleChange} onBlur={formik.handleBlur}
                        error={formik.touched.password && Boolean(formik.errors.password)}
                        helperText={formik.touched.password && formik.errors.password}
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            backgroundColor: '#e82727', marginBlock: '1rem', fontFamily: 'Raleway',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#d50000'
                            }
                        }}
                        fullWidth
                    >
                        {t('attendeeSetPassword.setPassword')}
                    </Button>
                </Stack>
            </form>
        </Stack>
    );
}

export default AttendeeSetPassword