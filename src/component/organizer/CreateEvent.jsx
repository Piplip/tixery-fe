import "../../styles/create-event-styles.css"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {Alert, Checkbox, Snackbar, Stack,} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useRef, useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import {Link, Outlet, useNavigate} from "react-router-dom";
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PropTypes from "prop-types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {EventContext} from "../../context.js";

const checkboxStyle = {
    sx: {
        color: 'inherit',
        '&.Mui-checked': {
            color: '#0079c5'
        },
    }
}

const CustomCheckbox = ({checked, completed}) => {
    return (
        <Checkbox disabled checked={checked || completed}
          icon={<CircleOutlinedIcon />}
                  checkedIcon={completed ? <CheckCircleIcon /> : <RadioButtonCheckedIcon />}
                  {...checkboxStyle}
        />
    )
}

CustomCheckbox.propTypes = {
    checked: PropTypes.bool,
    completed: PropTypes.bool
}

const steps = [
    {
        title: 'Build Event Page',
        description: 'Add all of your event details and let attendees know what to expect',
        to: ''
    },
    {
        title: 'Add Tickets',
        description: 'Create tickets and start selling', to: 'tickets'
    },
    {
        title: 'Publish Event',
        description: 'Choose when to publish your event', to: 'publish'
    }
]

function CreateEvent() {
    const [eventData, setEventData] = useState({
        eventType: 'single',
        locationType: 'venue',
        language: 'en-US',
        timezone: 'GMT+7',
        displayEndTime: true,

    })
    const [currentStep, setCurrentStep] = useState(0);
    const maxStep =  useRef(0)
    const [alert, setAlert] = useState("")

    const navigate = useNavigate()

    function handleContinue(){
        if(!validateStep()){
            setAlert("Please fill in all required fields or correct any errors before continuing.")
            return
        }
        if(currentStep < steps.length - 1){
            setCurrentStep(currentStep + 1)
            maxStep.current = Math.max(maxStep.current, currentStep + 1)
            navigate(steps[currentStep + 1].to)
        }
    }

    function validateStep(){
        switch (currentStep){
            case 0: {
                return !(!eventData.eventTitle || !eventData.summary || !eventData.eventType || !eventData.eventStartTime || !eventData.eventDate ||
                    eventData.location === "" || (eventData.eventStartTime > eventData.eventEndTime));
            }
            default: {
                return true
            }
        }
    }

    function handleSetStep(index){
        if(maxStep.current < index) return
        setCurrentStep(index)
        navigate(steps[index].to)
    }

    console.log(eventData)

    return (
        <div className={'create-events-wrapper'}>
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={alert !== ""} sx={{marginTop: '3rem'}}
                autoHideDuration={5000} onClose={() => setAlert("")}
            >
                <Alert severity={"error"} variant="filled" sx={{ width: '100%'}}>
                    {alert}
                </Alert>
            </Snackbar>
            <div className={'create-events__stepper'}>
                <Link to={'/organizer/events'}>
                    <Stack className={'link'} direction={'row'} alignItems={'center'}>
                        <ChevronLeftIcon/> Back to events
                    </Stack>
                </Link>
                <div className={'create-events-stepper__main'}>
                    <Stack className={'create-events__summary'}>
                        <p>Event Title</p>
                        <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                            <CalendarTodayIcon/> Thu, Feb 13, 2025, 10:00 AM
                        </Stack>
                        <Dropdown>
                            <MenuButton>
                                Draft <ArrowDropDownIcon/>
                            </MenuButton>
                            <Menu>
                                <MenuItem disabled={currentStep !== 3}>Publish</MenuItem>
                            </Menu>
                        </Dropdown>
                    </Stack>
                    <Stack className={'create-events-stepper__wrapper'}>
                        <p>Steps</p>
                        <Stack className={'create-events-stepper__steps'} rowGap={1}>
                            {steps.map((step, index) => (
                                <div key={index}
                                     className={`create-events-stepper__step ${currentStep === index ? 'create-events__active-step' : ''}
                                     ${maxStep.current < index ? 'create-events__disabled-step' : ''}`}
                                     onClick={() => handleSetStep(index)}
                                >
                                    <CustomCheckbox checked={currentStep === index} completed={maxStep.current > index}/>
                                    <div>
                                        <p>{step.title}</p>
                                        {currentStep === index &&
                                            <p>{step.description}</p>
                                        }
                                    </div>
                                </div>
                            ))}
                        </Stack>
                    </Stack>
                </div>
            </div>
            <div className={'create-events__main'}>
                <EventContext.Provider value={{data: eventData, setData: setEventData}}>
                    <Outlet context={{validate: validateStep}}/>
                </EventContext.Provider>
            </div>
            <button className={'create-events-main__continue-btn'}
                onClick={handleContinue}
            >
                {currentStep < steps.length - 1 ? 'Continue' : 'Publish'}
            </button>
        </div>
    )
}

export default CreateEvent;