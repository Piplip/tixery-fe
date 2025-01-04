import {useState, useEffect, useRef} from 'react';
import {
    Dialog,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Stack,
    Typography,
    LinearProgress, Box
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import PropTypes from "prop-types";
import "../styles/forgot-password-dialog-styles.css"
import accountAxios from "../config/axiosConfig.js";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

ForgotPasswordDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
}

function ForgotPasswordDialog ({ open, handleClose }) {
    const [step, setStep] = useState(1);
    const [resendTimeout, setResendTimeout] = useState(30);
    const [resendDisabled, setResendDisabled] = useState(true);
    const [code, setCode] = useState(new Array(6).fill(''));
    const codeRefs = useRef([]);
    const [isLoading, setIsLoading] = useState(false);
    const [invalidCode, _] = useState(true);

    useEffect(() => {
        if (step === 2 && resendDisabled) {
            const timer = setInterval(() => {
                setResendTimeout((prev) => {
                    if (prev <= 1) {
                        setResendDisabled(false);
                        clearInterval(timer);
                        return 30;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
    }, [step, resendDisabled]);

    const formik = useFormik({
        initialValues: {
            email: '',
            code: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: Yup.object({
            email: step === 1
                ? Yup.string().email('Invalid email format').required('Email is required')
                : null,
            password: step === 3
                ? Yup.string()
                    .min(6, 'Password must be at least 6 characters')
                    .required('Password is required')
                : null,
            confirmPassword: step === 3
                ? Yup.string()
                    .oneOf([Yup.ref('password'), null], 'Passwords must match')
                    .required('Confirm password is required')
                : null,
        }),
        onSubmit: (values) => {
            if(step === 1){
                setIsLoading(true)
                accountAxios.post(`/forgot-password?u=${values.email}`)
                    .then(r => {
                        if(r.data.status === "OK"){
                            setIsLoading(false)
                            setStep(2);
                        }
                        else {
                            alert(r.data.message);
                        }
                    })
            }
            else if (step < 4) {
                setStep((prev) => prev + 1);
                if (step === 2) {
                    setResendDisabled(true);
                }
                else if(step === 3){
                    accountAxios.post(`/forgot-password/reset?u=${formik.values.email}&password=${formik.values.password}`)
                        .then(r => {
                            if(r.data.status === "OK"){
                                setStep(4);
                            }
                            else {
                                alert(r.data.message);
                            }
                        })
                }
            }
        },
    })

    function handleCodeChange (e, index) {
        const value = e.target.value;
        if (!/^[0-9]*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        if (value && index < 5) {
            codeRefs.current[index + 1].focus();
        }

        if (newCode.every((digit) => digit !== '')) {
            validateCode(newCode.join(''));
        }
    }

    async function validateCode (enteredCode) {
        setIsLoading(true);
        accountAxios.post(`/forgot-password/verify?u=${formik.values.email}&code=${enteredCode}`)
           .then(r => {
                if(r.data.status === "OK"){
                    setIsLoading(false);
                    setStep(3);
                }
                else {
                    alert('Invalid code');
                    setCode(new Array(6).fill(''));
                    codeRefs.current[0].focus();
                }
           })
    }

    function handleKeyDown(e, index){
        if (e.key === 'Backspace') {
            const newCode = [...code];
            newCode[index] = '';
            setCode(newCode);

            if (index > 0) {
                codeRefs.current[index - 1].focus();
            }
        }
    }

    function handleResend () {
        setIsLoading(true)
        accountAxios.post(`/forgot-password?u=${formik.values.email}`)
            .then(r => {
                if(r.data.status === "OK"){
                    setIsLoading(false)
                }
                else {
                    alert(r.data.message);
                }
            })
        setResendDisabled(true);
        setResendTimeout(30);
    }

    function resetState(){
        setStep(1);
        setResendTimeout(30);
        setResendDisabled(true);
        setCode(new Array(6).fill(''));
        formik.resetForm();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            {isLoading && <LinearProgress />}
            <form onSubmit={formik.handleSubmit}>
                <DialogContent>
                    {step === 1 && (
                        <Stack spacing={2}>
                            <Typography variant="h6">Forgot Password</Typography>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label="Registered Email"
                                variant="outlined"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                        </Stack>
                    )}

                    {step === 2 && (
                        <Stack spacing={2} alignItems="center">
                            <Typography variant="h6" textAlign={'center'}>
                                A verification code has been sent to your email<br/>Please enter the code
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                className={`code-input-container ${
                                    isLoading ? 'verifying' : ''
                                }`}
                            >
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <TextField
                                        key={index} autoFocus={index === 0}
                                        inputRef={(el) => (codeRefs.current[index] = el)}
                                        inputProps={{
                                            maxLength: 1,
                                            style: { textAlign: 'center' },
                                        }}
                                        className="code-input"
                                        value={code[index] || ''}
                                        onChange={(e) => handleCodeChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        variant="outlined"
                                        disabled={isLoading}
                                    />
                                ))}
                            </Stack>
                            <Button
                                onClick={handleResend}
                                disabled={resendDisabled || isLoading}
                                className="resend-btn"
                            >
                                {resendDisabled ? `Resend Code in ${resendTimeout}s` : 'Resend Code'}
                            </Button>
                        </Stack>
                    )}

                    {step === 3 && (
                        <Stack spacing={2}>
                            <Typography variant="h6">Reset Password</Typography>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label="New Password"
                                type="password"
                                variant="outlined"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm New Password"
                                type="password"
                                variant="outlined"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                error={
                                    formik.touched.confirmPassword &&
                                    Boolean(formik.errors.confirmPassword)
                                }
                                helperText={
                                    formik.touched.confirmPassword &&
                                    formik.errors.confirmPassword
                                }
                            />
                        </Stack>
                    )}

                    {step === 4 && (
                        <Stack spacing={3} alignItems="center" className="success-screen">
                            <Box className="success-animation">
                                <CheckCircleOutlineIcon
                                    style={{
                                        fontSize: '5rem',
                                        color: '#4caf50',
                                    }}
                                />
                            </Box>
                            <Typography variant="h4" className="success-message">
                                Password Reset Successfully!
                            </Typography>
                            <Typography variant="body1" className="success-description">
                                You can now use your new password to log in to your account.
                            </Typography>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    {step < 4 && (
                        <Button color="secondary"
                            onClick={() => {
                                resetState()
                                handleClose()
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                    {step === 4 ? (
                        <Button color="primary"
                            onClick={() => {
                                resetState()
                                handleClose()
                            }}
                        >
                            Close
                        </Button>
                    ) : (
                        <Button type="submit" color="primary" disabled={step === 2 && invalidCode}>
                            {step === 3 ? 'Reset Password' : 'Next'}
                        </Button>
                    )}
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default ForgotPasswordDialog;
