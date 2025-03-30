import '../../styles/login-page-styles.css'
import Logo from "../../assets/logo.svg"
import {Form, Formik} from "formik";
import {
    Alert,
    Button,
    FormGroup,
    FormHelperText,
    IconButton,
    InputAdornment,
    Snackbar,
    Stack,
    TextField
} from "@mui/material";
import {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import * as Yup from "yup";
import FacebookIcon from "../../assets/facebook.png"
import GoogleIcon from "../../assets/google.png"
import accountAxios from "../../config/axiosConfig.js";
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {getUserData} from "../../common/Utilities.js";
import ForgotPasswordDialog from "./ForgotPasswordDialog.jsx";
import {useTranslation} from "react-i18next";

function LoginSignUp() {
    const {t} = useTranslation()
    const alertRef = {
        'already-used': t('loginPage.emailAlreadyUsed'),
        'exp': t('loginPage.sessionExpired'),
        'user-cancel': t('loginPage.loginCancelled')
    };

    const isSignUpPage = useLocation().pathname.includes('sign-up')
    const location = useLocation()
    const [openForgotPassword, setOpenForgotPassword] = useState(false)
    const [awaitResponse, setAwaitResponse] = useState(false)
    const [disabledSend, setDisabledSend] = useState(false)
    const [emailExist, setEmailExist] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showSuccessLogin, setShowSuccessLogin] = useState(false)
    const [alertMsg, setAlertMsg] = useState(alertRef[location.search.split('=')[1]])
    const navigate = useNavigate()

    const schema = Yup.object().shape({
        email: Yup.string()
            .email(t('loginPage.invalidEmailFormat'))
            .required(t('loginPage.emailRequired')),

        password: isSignUpPage ? Yup.string()
                .min(8, t('loginPage.passwordTooShort'))
                .max(30, t('loginPage.passwordTooLong'))
                .required(t('loginPage.passwordRequired'))
            : Yup.string().required(t('loginPage.passwordRequired')),

        ...(isSignUpPage ? {
            confirm: Yup.string()
                .oneOf([Yup.ref('password'), null], t('loginPage.passwordsDontMatch'))
                .required(t('loginPage.confirmPasswordRequired'))
        } : {})
    });

    function sendSignUpRequest(data, resetForm) {
        accountAxios.post('/sign-up', {
            email: data.email,
            password: data.password
        }).then(res => {
            setAwaitResponse(false)
            resetForm()
            alert(t('loginPage.signUpSuccess'))

        }).catch((err) => {
            console.log(err)
            resetForm()
            setAwaitResponse(false)
        })
    }

    function sendLoginRequest(data, resetForm) {
        accountAxios.post('/login', {
            email: data.email,
            password: data.password
        }).then(async res => {
            setAwaitResponse(false)
            if (res.data.status === 'OK') {
                setShowSuccessLogin(true)
                setAlertMsg(t(`response-code.${res.data.message}`))
                resetForm()
                localStorage.setItem("tk", res.data.data)
                const role = getUserData("role")
                let redirectLink
                if (role.toLowerCase() === "attendee")
                    redirectLink = '/'
                else if (role.toLowerCase() === "host")
                    redirectLink = '/organizer'
                setTimeout(() => navigate(redirectLink), 2000)
            } else {
                setAlertMsg(t(`response-code.${res.data.message}`))
            }
        }).catch((err) => {
            setAwaitResponse(false);
            resetForm();

            sessionStorage.setItem("serverError", JSON.stringify({
                type: "server-down",
                message: "Service is unavailable. Please try again later."
            }));

            navigate('/error');
        })
    }

    function checkEmailExist(email) {
        setEmailExist(false)
        const regex = new RegExp("[a-zA-Z0-9]+@[a-zA-Z0-9]+.[a-zA-Z0-9]+")
        if (email && regex.test(email)) {
            accountAxios.get(`/check-email?email=${email}`)
                .then(res => {
                    if (res.data.message) {
                        setEmailExist(true)
                    }
                }).catch(err => {
                console.log(err)
            })
        }
    }

    function handleGoogleLogin() {
        window.location.href = 'http://localhost:10001/accounts/oauth2/authorization/google'
    }

    function handleFacebookLogin() {
        window.location.href = 'http://localhost:10001/accounts/oauth2/authorization/facebook'
    }

    return (
        <div className={'login-page'}>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={alertMsg !== "" && alertMsg !== null && alertMsg !== undefined}
                autoHideDuration={6000} onClose={() => setAlertMsg("")}
            >
                <Alert severity={showSuccessLogin ? "success" : "error"} variant="filled" sx={{width: '100%'}}>
                    {alertMsg ? alertMsg : ""}
                </Alert>
            </Snackbar>
            <ForgotPasswordDialog open={openForgotPassword} handleClose={() => setOpenForgotPassword(false)}/>
            <div className={'login-page__img-wrapper'}>
                <img className={'login-page__img'}
                     src={'https://static.vecteezy.com/system/resources/previews/001/437/104/non_2x/people-celebrating-a-festivity-party-event-at-outdoor-roof-illustration-free-vector.jpg'}
                     alt={'login-page-img'}/>
            </div>
            <div className={'login-page__form-wrapper'}>
                <img src={Logo} alt="logo" width={'100px'}/>
                <p className={'login-page__form-title'}>
                    {isSignUpPage ? t('loginPage.signUp') : t('loginPage.login')}
                </p>
                <Formik
                    initialValues={{email: '', password: '', confirm: ''}}
                    validationSchema={schema}
                    onSubmit={async (values, {resetForm}) => {
                        setAwaitResponse(true);
                        await (isSignUpPage ? sendSignUpRequest(values, resetForm) : sendLoginRequest(values, resetForm));
                        setDisabledSend(true);
                        setTimeout(() => setDisabledSend(false), 5000);
                    }}
                >
                    {({
                          values, errors, touched,
                          handleChange, handleBlur,
                          handleSubmit, resetForm
                      }) => (
                        <Form style={{
                            width: '100%', display: 'flex', rowGap: '0.5rem',
                            flexDirection: 'column', height: 'fit-content'
                        }}
                        >
                            <FormGroup>
                                <TextField placeholder={t('loginPage.enterEmail')} name={'email'}
                                           onChange={e => {
                                               handleChange(e);
                                               if (isSignUpPage)
                                                   checkEmailExist(e.target.value);
                                           }}
                                           onBlur={handleBlur}
                                           value={values.email}
                                           error={(touched.email && Boolean(errors.email)) || (isSignUpPage && emailExist)}
                                           helperText={touched.email && errors.email} size={"small"}
                                           variant="outlined"/>
                                {isSignUpPage && emailExist &&
                                    <FormHelperText error style={{marginLeft: '1rem', marginBlock: 0}}>
                                        {t('loginPage.emailExist')}
                                    </FormHelperText>}
                            </FormGroup>
                            <TextField placeholder={t('loginPage.enterPassword')} size={"small"}
                                       type={showPassword ? "text" : "password"}
                                       name={'password'} onChange={handleChange} onBlur={handleBlur}
                                       value={values.password}
                                       error={touched.password && Boolean(errors.password)}
                                       helperText={touched.password && errors.password}
                                       variant="outlined"
                                       slotProps={{
                                           input: {
                                               endAdornment: <InputAdornment position="start">
                                                   {showPassword ?
                                                       <IconButton onClick={() => setShowPassword(false)}
                                                                   sx={{padding: 0}}>
                                                           <VisibilityIcon/>
                                                       </IconButton>
                                                       :
                                                       <IconButton onClick={() => setShowPassword(true)}
                                                                   sx={{padding: 0}}>
                                                           <VisibilityOffIcon/>
                                                       </IconButton>
                                                   }
                                               </InputAdornment>,
                                           },
                                       }}
                            />
                            {isSignUpPage &&
                                <>
                                    <TextField placeholder={t('loginPage.enterConfirmPassword')} name={'confirm'}
                                               onChange={handleChange} type={showPassword ? "text" : "password"}
                                               onBlur={handleBlur} value={values.confirm}
                                               error={(touched.confirm && Boolean(errors.confirm))}
                                               helperText={touched.confirm && errors.confirm}
                                               size={"small"} variant="outlined" autoComplete={"one-time-code"}
                                               slotProps={{
                                                   input: {
                                                       endAdornment: <InputAdornment position="start">
                                                           {showPassword ?
                                                               <IconButton onClick={() => setShowPassword(false)}
                                                                           sx={{padding: 0}}>
                                                                   <VisibilityIcon/>
                                                               </IconButton>
                                                               :
                                                               <IconButton onClick={() => setShowPassword(true)}
                                                                           sx={{padding: 0}}>
                                                                   <VisibilityOffIcon/>
                                                               </IconButton>
                                                           }
                                                       </InputAdornment>,
                                                   },
                                               }}
                                    />
                                </>
                            }
                            {!isSignUpPage && <FormHelperText>
                                <span className={'link'}
                                      onClick={() => setOpenForgotPassword(true)}
                                >{t('loginPage.forgotPassword')}</span>
                            </FormHelperText>}
                            <Button variant={'contained'} type={'submit'} disabled={disabledSend || emailExist}
                                    onSubmit={handleSubmit}
                                    sx={{
                                        backgroundColor: '#e82727', marginBlock: '1rem', fontFamily: 'inherit',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#d50000'
                                        }
                                    }}
                            >
                                {awaitResponse ? <div
                                    className={'loader'}></div> : isSignUpPage ? t('loginPage.signUp') : t('loginPage.login')}
                            </Button>
                            <div className={'login-page__form-divider'}>
                                <div>{t('loginPage.or')}</div>
                            </div>
                            <Stack rowGap={2}>
                                <div className={'login-page__login-external'} onClick={handleGoogleLogin}>
                                    <img width={'20px'} src={GoogleIcon} alt={'google-icon'}/>
                                    <p>{t('loginPage.signInWithGoogle', {action: isSignUpPage ? t('loginPage.up') : t('loginPage.in')})}</p>
                                </div>
                                <div className={'login-page__login-external'} onClick={handleFacebookLogin}>
                                    <img width={'20px'} src={FacebookIcon} alt={'facebook-icon'}/>
                                    <p>{t('loginPage.signInWithFacebook', {action: isSignUpPage ? t('loginPage.up') : t('loginPage.in')})}</p>
                                </div>
                            </Stack>
                            <Link onClick={() => {
                                setEmailExist(false);
                                resetForm();
                            }} to={isSignUpPage ? '/login' : '/sign-up'} className={'login-page__form-toggle'}>
                                {isSignUpPage ? t('loginPage.alreadyHaveAccount') : t('loginPage.dontHaveAccount')}
                            </Link>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default LoginSignUp