import {useState} from "react";
import {useFormik} from "formik";
import * as Yup from "yup";
import {Alert, Button, Stack, TextField, Typography} from "@mui/material";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {useNavigate} from "react-router-dom";

function AttendeeSetPassword(){
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate()

    const formik = useFormik({
        initialValues: { password: '' },
        validationSchema: Yup.object({
            password: Yup.string()
                .min(8, 'Password must be at least 8 characters')
                .required('Password is required'),
        }),
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
                Attendee Set Password
            </Typography>

            {success && <Alert severity="success">Password set successfully!</Alert>}

            <form onSubmit={formik.handleSubmit}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth label="New Password" name="password" type="password" variant="outlined" required
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
                        Set Password
                    </Button>
                </Stack>
            </form>
        </Stack>
    )
}

export default AttendeeSetPassword