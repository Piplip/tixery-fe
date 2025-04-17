import '../../styles/select-role-styles.css'
import Logo from "../../assets/logo.svg"
import {Stack} from "@mui/material";
import EventOrganizer from "../../assets/event-organizer.png"
import Attendee from "../../assets/event-attendee.png"
import Vendor from "../../assets/vendor-supplier.png"
import {Link, useLocation, useNavigate} from "react-router-dom";
import accountAxios from "../../config/axiosConfig.js";
import {getCookie} from "@/common/Utilities.js";
import {useTranslation} from "react-i18next";
import {useEffect} from "react";

function SelectRole(){
    const navigate = useNavigate()
    const location = useLocation()
    const { t } = useTranslation();

    useEffect(() => {
        const hashToken = window.location.hash.match(/#token=([^&]*)/);

        if (hashToken && hashToken[1]) {
            const token = hashToken[1];

            try {
                if (token.split('.').length === 3) {
                    localStorage.setItem('tk', token);

                    window.location.hash = '';
                } else {
                    console.error('Invalid token format received');
                }
            } catch (error) {
                console.error('Error storing token:', error);
            }
        }
        else {
            const rawSearch = window.location.search;
            const directParams = new URLSearchParams(rawSearch);
            const token = directParams.get('token');

            if (token) {
                try {
                    if (token.split('.').length === 3) {
                        localStorage.setItem('tk', token);

                        const newUrl = new URL(window.location.href);
                        newUrl.searchParams.delete('token');
                        window.history.replaceState({}, document.title, newUrl.toString());
                    } else {
                        console.error('Invalid token format received');
                    }
                } catch (error) {
                    console.error('Error storing token:', error);
                }
            } else {
                console.log('No token found in URL parameters');
            }
        }
    }, []);

    function handleAttendeeSetUpRequest(){
        if(!location.search.includes('method=external')){
            const uid = location.search.split('=')[1]
            if(uid === undefined){
                return
            }
            accountAxios.post('/profile/setup?uid=' + uid)
                .then(res => {
                    navigate('info?rid=' + res.data.data.requestID)
                })
                .catch(err => console.log(err))
        }
        else{
            const tk = getCookie('tk')
            localStorage.setItem('tk', tk)
            navigate('info?method=external')
        }
    }

    function handleOrganizerSetUp(){
        if(!location.search.includes('method=external')){
            const uid = location.search.split('=')[1]
            if(uid === undefined){
                return
            }
            accountAxios.post('/profile/setup?uid=' + uid)
                .then(res => {
                    navigate('organizer/info?rid=' + res.data.data.requestID)
                })
                .catch(err => console.log(err))
        }
        else navigate('organizer/info?method=external')

    }

    return (
        <div className={'select-role-container'}>
            <Link to={'/'} className={'select-role-container__logo'}>
                <img src={Logo} alt={t('selectRole.logoAlt')} width={'100px'} />
            </Link>
            <Stack>
                <p className={'select-role-title'}>{t('selectRole.welcome')}</p>
                <p className={'select-role-description'}>{t('selectRole.selectInterests')}</p>
            </Stack>
            <Stack direction={'row'} columnGap={'3rem'} className={'role-card-container'}>
                <div className={'role-card'} onClick={handleOrganizerSetUp}>
                    <img src={EventOrganizer} alt={t('selectRole.eventOrganizerAlt')} />
                    <p>{t('selectRole.organizeEvent')}</p>
                    <button>{t('selectRole.planBestEvent')}</button>
                </div>
                <div className={'role-card'} onClick={handleAttendeeSetUpRequest}>
                    <img src={Attendee} alt={t('selectRole.eventAttendeeAlt')} />
                    <p>{t('selectRole.findExperience')}</p>
                    <button>{t('selectRole.tellUsWhatYouLove')}</button>
                </div>
                <Link to={'/vendor'}>
                    <div className={'role-card'}>
                        <img src={Vendor} alt={t('selectRole.vendorSupplierAlt')} />
                        <p>{t('selectRole.sellServices')}</p>
                        <button>{t('selectRole.makeProfit')}</button>
                    </div>
                </Link>
            </Stack>
        </div>
    );
}

export default SelectRole