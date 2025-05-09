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
import "../../styles/forgot-password-dialog-styles.css"
import accountAxios from "../../config/axiosConfig.js";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import {useTranslation} from "react-i18next";

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
    const {t} = useTranslation()

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
                ? Yup.string().email(t('forgotPassword.invalidEmail')).required(t('forgotPassword.emailRequired'))
                : null,
            password: step === 3
                ? Yup.string()
                    .min(6, t('forgotPassword.passwordMinLength'))
                    .required(t('forgotPassword.passwordRequired'))
                : null,
            confirmPassword: step === 3
                ? Yup.string()
                    .oneOf([Yup.ref('password'), null], t('forgotPassword.passwordsMustMatch'))
                    .required(t('forgotPassword.confirmPasswordRequired'))
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
                            <Typography variant="h6">{t('forgotPassword.forgotPassword')}</Typography>
                            <TextField
                                fullWidth
                                id="email"
                                name="email"
                                label={t('forgotPassword.registeredEmail')}
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
                                {t('forgotPassword.verificationSent')}
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
                                {resendDisabled ? t('forgotPassword.resendCodeIn', {seconds: resendTimeout}) : t('forgotPassword.resendCode')}
                            </Button>
                        </Stack>
                    )}

                    {step === 3 && (
                        <Stack spacing={2}>
                            <Typography variant="h6">{t('forgotPassword.resetPassword')}</Typography>
                            <TextField
                                fullWidth
                                id="password"
                                name="password"
                                label={t('forgotPassword.newPassword')}
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
                                label={t('forgotPassword.confirmNewPassword')}
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
                                {t('forgotPassword.passwordResetSuccess')}
                            </Typography>
                            <Typography variant="body1" className="success-description">
                                {t('forgotPassword.loginWithNewPassword')}
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
                            {t('forgotPassword.cancel')}
                        </Button>
                    )}
                    {step === 4 ? (
                        <Button color="primary"
                                onClick={() => {
                                    resetState()
                                    handleClose()
                                }}
                        >
                            {t('forgotPassword.close')}
                        </Button>
                    ) : (
                        <Button type="submit" color="primary" disabled={step === 2 && invalidCode}>
                            {step === 3 ? t('forgotPassword.resetPassword') : t('forgotPassword.next')}
                        </Button>
                    )}
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default ForgotPasswordDialog;
