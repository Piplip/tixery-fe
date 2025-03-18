import "../../styles/account-verify.css";
import {Stack} from "@mui/material";
import FailedIcon from "../../assets/error-icon.png";
import {Link, useLocation} from "react-router-dom";
import accountAxios from "../../config/axiosConfig.js";
import {useState} from "react";
import {useTranslation} from "react-i18next";

function VerifyAccountFailed() {
    const [isLoading, setIsLoading] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const {t} = useTranslation()

    const errorRef = {
        "ACCOUNT_VERIFY_ALREADY": t('verifyAccountFailed.accountAlreadyVerified'),
        "ACCOUNT_VERIFY_EXPIRED": t('verifyAccountFailed.accountVerificationExpired'),
        "INVALID_OPERATION": t('verifyAccountFailed.invalidOperation')
    };

    function handleGenerateNewToken() {
        setIsLoading(true)
        accountAxios.put("/resend-activation?uid=" + searchParams.get("uid"))
            .then(res => {
                setIsLoading(false)
                setCountdown(60)
                setInterval(() => {
                    setCountdown(prev => prev - 1)
                }, 1000)
                alert(res.data.message)
            }).catch(err => {
                console.log(err)
            })
    }

    return (
        <div style={{width: '100%', height: '100dvh'}} className={'account-verify-container'}>
            <Stack
                className={`account-verify account-verify__${location.pathname.includes("/success") ? "success" : "failed"}`}
                rowGap={1}>
                <img src={FailedIcon} alt="shield" width={'125px'}/>
                <h1>{t('verifyAccountFailed.accountVerificationFailed')}</h1>
                <p>{errorRef[searchParams.get('error')]}</p>
                <Stack direction={'row'} columnGap={1}>
                    <Link to={'/help'}>
                        <button>{t('verifyAccountFailed.goToHelp')}</button>
                    </Link>
                    {searchParams.get('error') === "ACCOUNT_VERIFY_EXPIRED" &&
                        <button onClick={handleGenerateNewToken}>
                            {isLoading ?
                                <div className={'loader__02'}></div>
                                :
                                countdown > 0 ? `${countdown} s` : t('verifyAccountFailed.generateNewToken')}
                        </button>
                    }
                </Stack>
            </Stack>
        </div>
    );
}

export default VerifyAccountFailed;
