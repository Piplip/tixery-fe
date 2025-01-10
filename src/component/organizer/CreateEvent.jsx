import "../../styles/create-event-styles.css"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
    Alert, Button,
    Checkbox, Dialog,
    DialogContent,
    DialogTitle,
    IconButton, LinearProgress,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
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
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import SuccessAnimation from "../../animation/success-animation.json"
import { motion } from 'framer-motion';
import Lottie from 'react-lottie';

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
        eventVisibility: 'public',
        allowRefund: false,
        daysForRefund: 7,
        automatedRefund: false,
        publishType: 'now',
        type: '',
        category: '',
        subCategory: '',
        capacity: 100
    })
    const [currentStep, setCurrentStep] = useState(0);
    const maxStep =  useRef(0)
    const [alert, setAlert] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const isLive = eventData.publishType === "now";

    const navigate = useNavigate()

    function handleClose(){
        setShowSuccessDialog(false)
    }

    function handleContinue(){
        const msg = validateStep()
        if(typeof msg === 'string'){
            setAlert(msg);
            return;
        }
        if(currentStep < steps.length - 1){
            setCurrentStep(currentStep + 1)
            maxStep.current = Math.max(maxStep.current, currentStep + 1)
            navigate(steps[currentStep + 1].to)
        }
        else{
            handleSave()
        }
    }

    function validateStep(step){
        switch (step !== undefined ? step : currentStep){
            case 0: {
                if((!eventData.eventTitle || !eventData.summary || !eventData.eventType || !eventData.eventStartTime || !eventData.eventDate ||
                    eventData.location === "" || (eventData.eventStartTime > eventData.eventEndTime))){
                    return "Please fill in all required fields or correct any errors before continuing."
                }
                break;
            }
            case 1: {
                if((!eventData.tickets || eventData.tickets.length === 0)){
                    return "Tickets are required to continue."
                }
                break;
            }
            case 2: {
                if((!eventData.publishType || (eventData.publishType === 'schedule' && !eventData.publishDate && !eventData.publishTime)
                    || eventData.daysForRefund === "")){
                    return "Please fill in all required fields or correct any errors before continuing."
                }
                break;
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

    // TODO: Enhanced the checking of the fields

    function handleSave(){
        switch (currentStep) {
            case 2: {
                setIsLoading(true)
                // mimic api call
                setTimeout(() => {
                    setIsLoading(false)
                    setShowSuccessDialog(true)
                }, 2000)
                break;
            }
        }
    }

    const formatPublishDate = (date, time) => {
        return `${dayjs(date, 'DD/MM/YYYY').format('MMMM D, YYYY')} at ${time}`;
    };

    const calculateProgress = (date, time) => {
        const publishDateTime = dayjs(`${date} ${time}`, 'DD/MM/YYYY HH:mm');
        const now = dayjs();
        if (publishDateTime.isBefore(now)) return 100;

        const startTime = now.subtract(1, 'day'); // Assuming a 24-hour window
        const totalDuration = publishDateTime.diff(startTime);
        const elapsedDuration = now.diff(startTime);
        return (elapsedDuration / totalDuration) * 100;
    };

    const defaultOptions = {
        loop: false,
        autoplay: true,
        animationData: SuccessAnimation,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    };

    return (
        <div className={'create-events-wrapper'}>
            {isLoading &&
                <LinearProgress color={'error'} sx={{position: 'fixed', width: '100%', zIndex: 1, bottom: 0, height: '.75rem'}}/>}
            <Dialog
                onClose={handleClose}
                open={showSuccessDialog}
            >
                <DialogTitle sx={{ m: 0, p: 2 }}>
                    EVENT PUBLISHING
                </DialogTitle>
                <IconButton
                    onClick={handleClose}
                    sx={(theme) => ({
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: theme.palette.grey[500],
                    })}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent dividers sx={{ paddingInline: '7.5rem' }}>
                    <Stack direction="column" spacing={5} className="event-dialog-content">
                        {isLive && <Lottie options={defaultOptions} height={'10rem'} width={'10rem'}/>}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography variant="h6" className={`event-status ${isLive ? 'live' : 'scheduled'}`}>
                                    {isLive ? "Your event is now live!" : "Your event is scheduled to be published on"}
                                </Typography>
                                {!isLive && (
                                    <Typography variant="h6" className="event-date-time">
                                        {formatPublishDate(eventData.publishDate, eventData.publishTime)}
                                    </Typography>
                                )}
                            </Stack>
                        </motion.div>
                        {!isLive && (
                            <LinearProgress
                                variant="determinate" color={'secondary'}
                                value={calculateProgress(eventData.publishDate, eventData.publishTime)}
                                className="event-progress"
                            />
                        )}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            <Stack direction="row" spacing={2} justifyContent="center">
                                {isLive ? (
                                    <>
                                        <Button variant="contained" color="primary">View Event</Button>
                                        <Button variant="outlined" color="secondary">Share</Button>
                                    </>
                                ) : (
                                    <>
                                        <Button variant="contained" color="primary">Edit Schedule</Button>
                                        <Button variant="outlined" color="error">Cancel Event</Button>
                                    </>
                                )}
                            </Stack>
                        </motion.div>
                    </Stack>
                </DialogContent>
            </Dialog>
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
                {currentStep < steps.length - 1 ? 'Continue' : 'Finish'}
            </button>
        </div>
    )
}

export default CreateEvent;