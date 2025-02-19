import Shield from "../../../public/assets/shield.png"
import "../../styles/account-verify.css"
import {Stack} from "@mui/material";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useTranslation} from "react-i18next";

function VerifyAccountSuccess(){
    const location = useLocation()
    const navigate = useNavigate()
    const {t} = useTranslation()

    return (
        <div style={{ width: '100%', height: '100dvh' }} className={'account-verify-container'}>
            <Stack className={`account-verify account-verify__${location.pathname.includes("/success") ? "success" : "failed"}`} rowGap={1}>
                <img src={Shield} alt="shield" width={'125px'} />
                <h1>{t('verifyAccountSuccess.accountVerificationSuccess')}</h1>
                <p>{t('verifyAccountSuccess.oneMoreStep')}</p>
                <button onClick={
                    () => navigate('/u/interests?uid=' + location.search.split('=')[1])
                }
                >{t('verifyAccountSuccess.setUp')}</button>
                <Link to={'/login'} style={{ marginTop: '.5rem' }}>{t('verifyAccountSuccess.later')}</Link>
            </Stack>
        </div>
    );
}

export default VerifyAccountSuccess;