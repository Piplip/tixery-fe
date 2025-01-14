import "../../styles/create-event-styles.css"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {
    Alert,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    LinearProgress,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useEffect, useRef, useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import {Link, Outlet, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PropTypes from "prop-types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {EventContext} from "../../context.js";
import dayjs from "dayjs";
import SuccessAnimation from "../../animation/success-animation.json"
import {motion} from 'framer-motion';
import Lottie from 'react-lottie';
import {eventAxiosWithToken} from "../../config/axiosConfig.js";

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
    const loader = useLoaderData()
    const location = useLocation()
    const navigate = useNavigate()
    const [eventData, setEventData] = useState({})
    const [currentStep, setCurrentStep] = useState(0);
    const maxStep =  useRef(location.pathname.includes('edit') ? 2 : 0)
    const [alert, setAlert] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const isLive = eventData.publishType === "now";
    const isEdit = location.pathname.includes("edit");

    useEffect(() => {
        let loaderData = loader ? loader.data : undefined
        let newEventData
        if(loaderData !== undefined){
            newEventData = {
                eventTitle: loaderData.name,
                summary: loaderData.description,
                eventType: loaderData.is_recurring ? 'recurring' : 'single',
                eventDate: dayjs(loaderData.start_time),
                eventStartTime: dayjs(loaderData.start_time),
                eventEndTime: dayjs(loaderData.end_time),
                displayEndTime: loaderData.show_end_time,
                timezone: loaderData.timezone || 7,
                language: loaderData.language,
                locationType: loaderData.location.locationType,
                location: loaderData.location.location,
                reserveSeating: loaderData.location.reserveSeating || false,
                faqs: loaderData.faq,
                tickets: loaderData.tickets.map((ticket) => ({
                    ticketID: ticket.ticket_type_id,
                    type: ticket.ticket_type,
                    ticketName: ticket.name,
                    ticketType: ticket.ticket_type,
                    quantity: ticket.quantity,
                    price: ticket.price,
                    absorbFee: ticket.absorbFee || false,
                    startDate: dayjs(ticket.sale_start_time),
                    startTime: dayjs(ticket.sale_start_time),
                    endDate: dayjs(ticket.sale_end_time),
                    endTime: dayjs(ticket.sale_end_time),
                    description: ticket.description,
                    visibility: ticket.status,
                    visibleStartDate: ticket.vis_start_time ? dayjs(ticket.vis_start_time) : null,
                    visibleStartTime: ticket.vis_start_time ? dayjs(ticket.vis_start_time) : null,
                    visibleEndDate: ticket.vis_end_time ? dayjs(ticket.vis_end_time) : null,
                    visibleEndTime: ticket.vis_end_time ? dayjs(ticket.vis_end_time) : null,
                    maxPerOrder: ticket.max_per_order,
                    minPerOrder: ticket.min_per_order
                })),
                eventVisibility: 'public',
                allowRefund: loaderData.refundPolicy || false,
                daysForRefund: loaderData.daysForRefund || 7,
                automatedRefund: loaderData.automatedRefund || false,
                publishType: loaderData.status !== 'published' ? "schedule" :'now',
                type: loaderData.event_type,
                category: loaderData.category,
                subCategory: loaderData.sub_category,
                capacity: loaderData.capacity || 100,
                tags: loaderData.tags || ''
            }
        }
        else {
            newEventData = {
                eventType: 'single',
                locationType: 'venue',
                language: 'en-US',
                timezone: '7',
                displayEndTime: true,
                eventVisibility: 'public',
                allowRefund: false,
                daysForRefund: 7,
                automatedRefund: false,
                publishType: 'now',
                type: '',
                category: '',
                subCategory: '',
                capacity: 100,
                reserveSeating: false
            }
        }
        setEventData(newEventData)
    }, []);

    function handleClose(){
        setShowSuccessDialog(false)
    }

    function handleContinue(){
        const msg = validateStep()
        if(typeof msg === 'string'){
            setAlert(msg);
            return;
        }
        if(currentStep !== 1) handleSave()
        else {
            if(eventData.tickets !== undefined){
                setCurrentStep(currentStep + 1)
                maxStep.current = Math.max(maxStep.current, currentStep + 1)
                navigate(steps[currentStep + 1].to)
            }
        }
    }

    function validateStep(step){
        switch (step !== undefined ? step : currentStep){
            case 0: {
                if (!eventData.eventTitle) {
                    return "Event title is required.";
                }
                if (!eventData.summary) {
                    return "Event summary is required.";
                }
                if (!eventData.eventType) {
                    return "Event type is required.";
                }
                if (!eventData.eventDate) {
                    return "Event date is required.";
                }
                if (!eventData.eventStartTime) {
                    return "Event start time is required.";
                }
                if (eventData.location === "" || eventData.location === undefined) {
                    return "Event location is required.";
                }
                if (eventData.eventStartTime > eventData.eventEndTime) {
                    return "Start time cannot be later than end time.";
                }
                break;
            }
            case 1: {
                if((!eventData.tickets || eventData.tickets.length === 0)){
                    return "Tickets are required to continue."
                }
                if (eventData.capacity === "" || eventData.capacity <= 0) {
                    return "Event capacity must be greater than zero.";
                }
                break;
            }
            case 2: {
                if (eventData.publishType === 'schedule' && (!eventData.publishDate || !eventData.publishTime)) {
                    return "Publish date and time are required for scheduled publish type.";
                }
                if (eventData.publishType === 'schedule' && eventData.publishDate && eventData.publishTime &&
                    dayjs(`${eventData.eventDate} ${eventData.eventStartTime}`).isBefore(dayjs(`${eventData.publishDate} ${eventData.publishTime}`))) {
                    return "Publish date/time cannot be after the event start time.";
                }
                if (eventData.allowRefund && eventData.daysForRefund === "") {
                    return "Days for refund is required.";
                }
                if (!eventData.type) {
                    return "Event type is required.";
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

    function handleSave(){
        setIsLoading(true)
        let payload;
        switch (currentStep) {
            case 0: {
                const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/
                const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
                payload = {
                    images: eventData.images,
                    videos: eventData.videos,
                    title: eventData.eventTitle,
                    summary: eventData.summary,
                    eventType: eventData.eventType,
                    eventDate: dateRegex.test(eventData.eventDate) ? eventData.eventDate : dayjs(eventData.eventDate).format("DD/MM/YYYY"),
                    eventStartTime: timeRegex.test(eventData.eventStartTime) ? eventData.eventStartTime : dayjs(eventData.eventStartTime).format("HH:mm"),
                    eventEndTime: eventData.eventEndTime ? timeRegex.test(eventData.eventEndTime) ? eventData.eventEndTime : dayjs(eventData.eventEndTime).format("HH:mm")
                        : dayjs().startOf('day').format('HH:mm'),
                    displayEndTime: eventData.displayEndTime,
                    timezone: eventData.timezone,
                    language: eventData.language,
                    locationType: eventData.locationType,
                    location: eventData.location,
                    reserveSeating: eventData.reserveSeating,
                    faqs: eventData.faqs
                }
                break;
            }
            case 1: {
                payload = {
                    tickets: eventData.tickets, timezone: eventData.timezone
                }
                break;
            }
            case 2: {
                payload = {
                    type: eventData.type, category: eventData.category, subCategory: eventData.subCategory,
                    tags: location.pathname.includes("edit") ? eventData.tags : eventData.tags.split(','), eventVisibility: eventData.eventVisibility,
                    allowRefund: eventData.allowRefund,
                    daysForRefund: eventData.daysForRefund, automatedRefund: eventData.automatedRefund, publishType: eventData.publishType,
                    publishDate: eventData.publishDate, publishTime: eventData.publishTime, timezone: eventData.timezone, capacity: eventData.capacity
                }
                break;
            }
        }
        eventAxiosWithToken.post(`/create?step=${currentStep}&eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}`, payload)
            .then(r => {
                console.log(r.data)
                if(r.data.status === 'OK'){
                    setIsLoading(false)
                    if(currentStep < steps.length - 1){
                        setCurrentStep(currentStep + 1)
                        maxStep.current = Math.max(maxStep.current, currentStep + 1)
                        navigate(steps[currentStep + 1].to)
                    }
                    else{
                        setShowSuccessDialog(true)
                    }
                }
            })
            .catch(err => console.log(err.response.data))
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

    console.log(eventData)

    return (
        <div className={'create-events-wrapper'}>
            {isLoading &&
                <LinearProgress color={'error'} sx={{position: 'fixed', width: '100%', zIndex: 1, bottom: 0, height: '.75rem'}}/>}
            <Dialog
                onClose={(e, reason) => {
                    if(reason !== "backdropClick") {
                        handleClose()
                    }
                }}
                disableEscapeKeyDown
                open={showSuccessDialog}
            >
                <DialogTitle sx={{ m: 0, p: 2, textAlign: 'center'}}>
                    {isEdit ? "EDIT EVENT" : "EVENT PUBLISHING"}
                </DialogTitle>
                <DialogContent dividers sx={{ paddingInline: '7.5rem' }}>
                    <Stack direction="column" spacing={5} className="event-dialog-content">
                        {isLive && <Lottie options={defaultOptions} height={'10rem'} width={'10rem'}/>}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2} justifyContent={'center'}>
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
                                        <Link to={'../events'}>
                                            <Button variant="contained" color="primary">View Events</Button>
                                        </Link>
                                        <Button variant="contained" color="primary">Dashboard</Button>
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
                        <ChevronLeftIcon /> Back to events
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
                                    <CustomCheckbox checked={currentStep === index} completed={maxStep.current >= index}/>
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