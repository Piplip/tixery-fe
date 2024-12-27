import Shield from "../assets/shield.png"
import "../styles/account-verify.css"
import {Stack} from "@mui/material";
import {Link, useLocation, useNavigate} from "react-router-dom";

function VerifyAccountSuccess(){
    const location = useLocation()
    const navigate = useNavigate()

    return (
        <div style={{width: '100%', height: '100dvh'}} className={'account-verify-container'}>
            <Stack className={`account-verify account-verify__${location.pathname.includes("/success") ? "success" : "failed"}`} rowGap={1}>
                <img src={Shield} alt="shield" width={'125px'} />
                <h1>Account verification successfully</h1>
                <p>Just 1 more step to complete your account</p>
                <button onClick={
                    () => navigate('/u/interests?uid=' + location.search.split('=')[1])
                }
                >SET UP</button>
                <Link to={'/login'} style={{marginTop: '.5rem'}}>Later</Link>
            </Stack>
        </div>
    );
}

export default VerifyAccountSuccess;