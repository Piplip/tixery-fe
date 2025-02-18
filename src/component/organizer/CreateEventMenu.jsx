import {Stack, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import {useState} from "react";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {useLocation, useNavigate} from "react-router-dom";
import "../../styles/create-event-menu-styles.css"
import {useTranslation} from "react-i18next";

function CreateEventMenu(){
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const location = useLocation()
    const { t } = useTranslation();

    function handleCreateEventRequest(){
        setIsLoading(true)
        eventAxiosWithToken.post(`/create/request?pid=${getUserData('profileID')}&u=${getUserData("sub")}`)
            .then(r => {
                if(location.pathname.includes("events")){
                    navigate(`${r.data.data}`)
                }
                else navigate(`events/${r.data.data}`)
            })
            .catch(err => console.log(err))
    }

    return (
        <Stack direction={'row'} columnGap={'1rem'}>
            <div className={'create-events-item'} onClick={handleCreateEventRequest}>
                {isLoading ?
                    <Stack style={{ height: '100%' }} alignItems={'center'} justifyContent={'center'}>
                        <div className={'loader-02'}></div>
                    </Stack>
                    :
                    <>
                        <EditIcon />
                        <Typography variant={'h5'}>{t('create_event_scratch')}</Typography>
                        <Typography variant={'body2'}>{t('create_event_scratch_description')}</Typography>
                        <button>{t('create_event_button')}</button>
                    </>
                }
            </div>
            <div className={'create-events-item'}>
                <AutoFixHighIcon />
                <Typography variant={'h5'}>{t('create_with_ai')}</Typography>
                <Typography variant={'body2'}>{t('create_with_ai_description')}</Typography>
                <button>{t('create_event_button')}</button>
            </div>
        </Stack>
    );
}

export default CreateEventMenu