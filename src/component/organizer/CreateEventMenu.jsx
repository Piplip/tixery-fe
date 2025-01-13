import {Stack, Typography} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import {useState} from "react";
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {useLocation, useNavigate} from "react-router-dom";
import "../../styles/create-event-menu-styles.css"

function CreateEventMenu(){
    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const location = useLocation()

    function handleCreateEventRequest(){
        setIsLoading(true)
        eventAxiosWithToken.post(`/create/request?pid=${getUserData('profileID')}&u=${getUserData("sub")}`)
            .then(r => {
                if(location.pathname.includes("events")){
                    navigate(`${r.data.data}`)
                }
                else navigate(`events/${r.data.data}`)
                setIsLoading(false)
            })
            .catch(err => console.log(err))
    }

    return (
        <Stack direction={'row'} columnGap={'1rem'}>
            <div className={'create-events-item'} onClick={handleCreateEventRequest}>
                {isLoading ?
                    <Stack style={{height: '100%'}} alignItems={'center'} justifyContent={'center'}>
                        <div className={'loader-02'}></div>
                    </Stack>
                    :
                    <>
                        <EditIcon/>
                        <Typography variant={'h5'}>Start from scratch</Typography>
                        <Typography variant={'body2'}>Add all your event details, create new tickets,
                            and set up
                            recurring events</Typography>
                        <button>Create event</button>
                    </>
                }
            </div>
            <div className={'create-events-item'}>
                <AutoFixHighIcon />
                <Typography variant={'h5'}>Create with AI</Typography>
                <Typography variant={'body2'}>Answer a few quick questions to generate an event that&#39;s ready to publish almost instantly</Typography>
                <button>Create with AI</button>
            </div>
        </Stack>
    )
}

export default CreateEventMenu