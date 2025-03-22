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
import {useEffect, useRef, useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import {Link, Outlet, useLoaderData, useLocation, useNavigate} from "react-router-dom";
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PropTypes from "prop-types";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {EventContext} from "../../context.js";
import dayjs from "dayjs";
import SuccessAnimation from "../../animation/success-animation.json"
import {motion} from 'framer-motion';
import Lottie from 'react-lottie';
import {eventAxiosWithToken} from "../../config/axiosConfig.js";
import {useTranslation} from "react-i18next";
import ShareDialog from "../shared/ShareDialog.jsx";

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

const defaultOptions = {
    loop: false,
    autoplay: true,
    animationData: SuccessAnimation,
    rendererSettings: {
        preserveAspectRatio: 'xMidYMid slice'
    }
};

function CreateEvent() {
    const {t} = useTranslation()
    const loader = useLoaderData()
    const location = useLocation()
    const navigate = useNavigate()
    const [eventData, setEventData] = useState({})
    const [currentStep, setCurrentStep] = useState(0);
    const maxStep =  useRef(0)
    const [alert, setAlert] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccessDialog, setShowSuccessDialog] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const isLive = eventData.publishType === "now";
    const isEdit = location.pathname.includes("edit");

    const steps = [
        {to: ''},
        {to: 'online'},
        {to: 'recurring'},
        {to: 'tickets'},
        {to: 'publish'}
    ]

    useEffect(() => {
        let loaderData = loader ? loader.data : undefined
        let newEventData

        if(loaderData !== undefined){
            let processedTickets = [];

            if(loaderData.tickets && loaderData.reserveSeating) {
                const ticketGroups = new Map();

                loaderData.tickets.forEach(ticket => {
                    const ticketKey = `${ticket.name}_${ticket.sale_start_time}_${ticket.sale_end_time}_${ticket.ticket_type}`;

                    if (!ticketGroups.has(ticketKey)) {
                        ticketGroups.set(ticketKey, {
                            ticketID: [],
                            ticketType: ticket.ticket_type,
                            ticketName: ticket.name,
                            startDate: dayjs(ticket.sale_start_time).format("DD/MM/YYYY"),
                            endDate: dayjs(ticket.sale_end_time).format("DD/MM/YYYY"),
                            startTime: dayjs(ticket.sale_start_time).format("HH:mm"),
                            endTime: dayjs(ticket.sale_end_time).format("HH:mm"),
                            description: ticket.description,
                            visibility: ticket.status,
                            visibleStartDate: ticket.vis_start_time ? dayjs(ticket.vis_start_time).format("DD/MM/YYYY") : null,
                            visibleEndDate: ticket.vis_end_time ? dayjs(ticket.vis_end_time).format("DD/MM/YYYY") : null,
                            visibleStartTime: ticket.vis_start_time ? dayjs(ticket.vis_start_time).format("HH:mm") : null,
                            visibleEndTime: ticket.vis_end_time ? dayjs(ticket.vis_end_time).format("HH:mm") : null,
                            minPerOrder: ticket.min_per_order,
                            maxPerOrder: ticket.max_per_order,
                            currency: ticket?.currency?.currency || 'USD',
                            currencySymbol: ticket?.currency?.symbol || '$',
                            currencyFullForm: ticket?.currency?.fullForm || 'United States Dollar',
                            tierData: []
                        });
                    }

                    const group = ticketGroups.get(ticketKey);

                    group.ticketID.push(ticket.ticket_type_id);

                    if (ticket.seat_tier_id) {
                        group.tierData.push({
                            price: ticket.price.toString(),
                            tierID: ticket.seat_tier_id,
                            currency: ticket?.currency?.currency || 'USD',
                            currencySymbol: ticket?.currency?.symbol || '$',
                            currencyFullForm: ticket?.currency?.fullForm || 'United States Dollar'
                        });
                    }
                });

                processedTickets = Array.from(ticketGroups.values());
            }

            else{
                processedTickets = loaderData?.tickets?.map((ticket) => ({
                    ticketID: ticket.ticket_type_id,
                    ticketName: ticket.name,
                    ticketType: ticket.ticket_type,
                    quantity: ticket.quantity,
                    price: ticket.price,
                    absorbFee: ticket.absorbFee || false,
                    startDate: dayjs(ticket.sale_start_time).format("DD/MM/YYYY"),
                    startTime: dayjs(ticket.sale_start_time).format("HH:mm"),
                    endDate: dayjs(ticket.sale_end_time).format("DD/MM/YYYY"),
                    endTime: dayjs(ticket.sale_end_time).format("HH:mm"),
                    description: ticket.description,
                    visibility: ticket.status,
                    visibleStartDate: ticket.vis_start_time ? dayjs(ticket.vis_start_time).format("DD/MM/YYYY") : null,
                    visibleStartTime: ticket.vis_start_time ? dayjs(ticket.vis_start_time).format("HH:mm") : null,
                    visibleEndDate: ticket.vis_end_time ? dayjs(ticket.vis_end_time).format("DD/MM/YYYY") : null,
                    visibleEndTime: ticket.vis_end_time ? dayjs(ticket.vis_end_time).format("HH:mm") : null,
                    maxPerOrder: ticket.max_per_order,
                    minPerOrder: ticket.min_per_order,
                    currency: ticket?.currency?.currency || 'USD',
                    currencySymbol: ticket?.currency?.symbol || '$',
                    currencyFullForm: ticket?.currency?.fullForm || 'United States Dollar'
                }));
            }

            newEventData = {
                eventTitle: loaderData.name,
                summary: loaderData.short_description,
                eventType: loaderData.is_recurring ? 'recurring' : 'single',
                eventDate: dayjs(loaderData.start_time),
                eventStartTime: dayjs(loaderData.start_time),
                eventEndTime: dayjs(loaderData.end_time),
                displayEndTime: loaderData.show_end_time,
                timezone: loaderData.timezone || 7,
                language: loaderData.language,
                faqs: loaderData.faq,
                tickets: processedTickets,
                eventVisibility: 'public',
                allowRefund: loaderData?.refund_policy?.allowRefund || false,
                daysForRefund: loaderData?.refund_policy?.daysForRefund || 7,
                automatedRefund: loaderData?.refund_policy?.automateRefund || false,
                publishType: loaderData.status === 'scheduled' ? "schedule" : "now",
                type: loaderData.event_type,
                category: loaderData.category,
                subCategory: loaderData.sub_category,
                capacity: loaderData.capacity || 100,
                tags: loaderData.tags ? loaderData.tags.join(',') : '',
                additionalInfo: loaderData.full_description,
                reserveSeating: loaderData.reserveSeating || false
            }

            if (loaderData.is_recurring === true) {
                const events = {};
                const occurrenceTickets = {};

                loaderData.occurrences?.forEach(occurrence => {
                    const dateKey = dayjs(occurrence.start_date).format("YYYY-MM-DD");
                    const slot = {
                        occurrenceID: occurrence.occurrence_id,
                        startTime: dayjs(`${occurrence.start_date}T${occurrence.start_time}`),
                        endTime: dayjs(`${occurrence.start_date}T${occurrence.end_time}`)
                    };

                    if (!events[dateKey]) {
                        events[dateKey] = [];
                    }
                    events[dateKey].push(slot);
                });

                loaderData.occurrences?.forEach(occurrence => {
                    const dateKey = dayjs(occurrence.start_date).format("YYYY-MM-DD");
                    const slotKey = occurrence.occurrence_id;

                    if (!occurrenceTickets[dateKey]) {
                        occurrenceTickets[dateKey] = [];
                    }

                    const ticketsForOccurrence = loaderData.ticketOccurrences
                        .filter(ticketOccurrence => ticketOccurrence.occurrence_id === occurrence.occurrence_id)
                        .map(ticketOccurrence => {
                            const ticket = loaderData.tickets.find(t => t.ticket_type_id === ticketOccurrence.ticket_type_id);
                            return {
                                ticketID: ticket.ticket_type_id,
                                enabled: ticket.status === "visible",
                                price: ticket.price,
                                quantity: ticket.quantity
                            };
                        });

                    occurrenceTickets[dateKey].push({ [slotKey]: ticketsForOccurrence });
                });

                newEventData = {
                    ...newEventData,
                    events: events,
                    occurrenceTickets: occurrenceTickets,
                };
            }
            if(loaderData.location?.locationType === 'online'){
                newEventData = {...newEventData, locationData: loaderData.location.data,
                    locationType: 'online', access: loaderData?.location?.access, enabled: loaderData?.location?.enabled
                }
            }
            else{
                newEventData = {...newEventData,
                    location: loaderData?.location?.location,
                    lat: loaderData?.location?.lat,
                    lon: loaderData?.location?.lon,
                    locationType: 'venue',
                }
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
                capacity: 0,
                type: '',
                category: '',
                subCategory: '',
                reserveSeating: false
            }
        }

        setEventData(newEventData);

        let initialMaxStep = 0;
        if (newEventData.eventTitle && newEventData.summary && newEventData.eventType && newEventData.eventDate && newEventData.eventStartTime && newEventData.location) {
            initialMaxStep = 1;
        }
        if (newEventData.locationType === 'online' && newEventData.locationData) {
            initialMaxStep = 2;
        }
        if (newEventData.eventType === 'recurring') {
            initialMaxStep = 3;
        }
        if (newEventData.tickets && newEventData.tickets.length > 0 && newEventData.capacity > 0 || newEventData.reserveSeating) {
            initialMaxStep = 4;
        }
        if ((newEventData.publishType === 'now' || (newEventData.publishType === 'schedule' && newEventData.publishDate && newEventData.publishTime)) && newEventData.type) {
            initialMaxStep = 5;
        }
        maxStep.current = initialMaxStep;
    }, []);

    useEffect(() => {
        window.scrollTo(0,0)
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
        if(currentStep !== 2 && currentStep !== 1) handleSave()
        else {
            let increment = 1;
            if (eventData.locationType === 'online' && currentStep === 1) {
                if (eventData.eventType === 'single') {
                    increment = 2;
                }
            }
            const nextStep = currentStep + increment;
            setCurrentStep(nextStep);
            maxStep.current = Math.max(maxStep.current, nextStep);
            navigate(steps[nextStep].to);
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
                if(eventData.eventType === 'single'){
                    if (!eventData.eventDate) {
                        return "Event date is required.";
                    }
                    if (!eventData.eventStartTime) {
                        return "Event start time is required.";
                    }
                    if (eventData.eventStartTime.isAfter(eventData.eventEndTime)) {
                        return "Start time cannot be later than end time.";
                    }
                }
                if (eventData.locationType === 'venue' && eventData.location === undefined) {
                    return "Event location is required.";
                }
                break;
            }
            case 3: {
                if((!eventData.tickets || eventData.tickets.length === 0)){
                    return "Tickets are required to continue."
                }
                if (eventData.capacity === "" || eventData.capacity <= 0) {
                    return "Event capacity must be greater than zero.";
                }
                break;
            }
            case 4: {
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
                    latitude: eventData.lat,
                    longitude: eventData.lon,
                    locationName: eventData.locationName,
                    faqs: eventData.faqs,
                    additionalInfo: eventData.additionalInfo
                }
                break;
            }
            case 3: {
                payload = {
                    // tickets: eventData.tickets,
                    timezone: eventData.timezone,
                    capacity: eventData.capacity
                }
                break;
            }
            case 4: {
                payload = {
                    type: eventData.type, category: eventData.category, subCategory: eventData.subCategory,
                    tags: eventData?.tags ? eventData.tags.split(',') : null, eventVisibility: eventData.eventVisibility,
                    allowRefund: eventData.allowRefund, daysForRefund: eventData.daysForRefund, automatedRefund: eventData.automatedRefund,
                    publishType: eventData.publishType, publishDate: eventData.publishDate, publishTime: eventData.publishTime,
                    timezone: eventData.timezone, capacity: eventData.capacity
                }
                break;
            }
        }
        eventAxiosWithToken.post(`/create?step=${currentStep}&eid=${location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]}`, payload)
            .then(r => {
                if(r.data.status === 'OK'){
                    setIsLoading(false)
                    setHasUnsavedChanges(false)
                    if(currentStep < steps.length - 1){
                        const stepIncrement = eventData.locationType === 'venue' && currentStep <= 2
                            ? eventData.eventType !== 'recurring' ? 3 : 2
                            : 1
                        const nextStep = currentStep + stepIncrement;

                        setCurrentStep(nextStep);
                        maxStep.current = Math.max(maxStep.current, nextStep);
                        navigate(steps[nextStep].to);
                    }
                    else{
                        setShowSuccessDialog(true)
                    }
                }
            })
            .catch(err => console.log(err))
    }

    const formatPublishDate = (date, time) => {
        return `${dayjs(date, 'DD/MM/YYYY').format('MMMM D, YYYY')} at ${time}`;
    };

    const calculateProgress = (date, time) => {
        const publishDateTime = dayjs(`${date} ${time}`, 'DD/MM/YYYY HH:mm');
        const now = dayjs();
        if (publishDateTime.isBefore(now)) return 100;

        const startTime = now.subtract(1, 'day');
        const totalDuration = publishDateTime.diff(startTime);
        const elapsedDuration = now.diff(startTime);
        return (elapsedDuration / totalDuration) * 100;
    };

    return (
        <div className={'create-events-wrapper'}>
            {isLoading &&
                <LinearProgress color={'error'} sx={{ position: 'fixed', width: '100%', zIndex: 1, bottom: 0, height: '.75rem' }} />}
            <Dialog
                onClose={(e, reason) => {
                    if (reason !== "backdropClick") {
                        handleClose()
                    }
                }}
                disableEscapeKeyDown
                open={showSuccessDialog}
            >
                <DialogTitle sx={{ m: 0, p: 2, textAlign: 'center' }}>
                    {isEdit ? t('createEvent.editEvent') : t('createEvent.eventPublishing')}
                </DialogTitle>
                <DialogContent dividers sx={{ paddingInline: '5rem' }}>
                    <Stack direction="column" spacing={5} className="event-dialog-content">
                        {isLive && <Lottie options={defaultOptions} height={'10rem'} width={'10rem'} />}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2} justifyContent={'center'}>
                                <Typography variant="h6" className={`event-status ${isLive ? 'live' : 'scheduled'}`}>
                                    {isLive ? t('createEvent.eventLive') : t('createEvent.eventScheduled')}
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
                                            <Button variant="contained" color="primary">{t('createEvent.viewEvents')}</Button>
                                        </Link>
                                        <Button variant="contained" color="primary">{t('createEvent.dashboard')}</Button>
                                        <ShareDialog eventID={location.pathname.split('/')[location.pathname.includes('edit') ? 4 : 3]} />
                                    </>
                                ) : (
                                    <>
                                        <Button variant="contained" color="primary">{t('createEvent.editSchedule')}</Button>
                                        <Button variant="outlined" color="error">{t('createEvent.cancelEvent')}</Button>
                                    </>
                                )}
                            </Stack>
                        </motion.div>
                    </Stack>
                </DialogContent>
            </Dialog>
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={alert !== ""} sx={{ marginTop: '3rem' }}
                autoHideDuration={5000} onClose={() => setAlert("")}
            >
                <Alert severity={"error"} variant="filled" sx={{ width: '100%' }}>
                    {alert}
                </Alert>
            </Snackbar>
            <div className={'create-events__stepper'}>
                <Link to={'/organizer/events'}>
                    <Stack className={'link'} direction={'row'} alignItems={'center'}>
                        <ChevronLeftIcon /> {t('createEvent.backToEvents')}
                    </Stack>
                </Link>
                <div className={'create-events-stepper__main'}>
                    <Stack className={'create-events__summary'}>
                        <p>{eventData.eventTitle || t('createEvent.eventTitle')}</p>
                        <Stack direction={'row'} alignItems={'center'} columnGap={1}>
                            <CalendarTodayIcon /> {eventData.eventDate && eventData.eventStartTime
                            ? `${dayjs(eventData.eventDate, "DD/MM/YYYY").format('ddd, MMM D, YYYY')}
                            ${dayjs(eventData.eventStartTime, "HH:mm").format(" HH:mm")}` : t('createEvent.eventDate')}
                        </Stack>
                        <Stack sx={{ border: '1px solid grey', p: 1, textAlign: 'center', borderRadius: '.5rem' }}>
                            {eventData.publishType === 'schedule' ? t('createEvent.scheduled') : t('createEvent.draft')}
                        </Stack>
                    </Stack>
                    <Stack className={'create-events-stepper__wrapper'}>
                        <Stack className={'create-events-stepper__steps'} rowGap={1}>
                            {steps.map((step, index) => {
                                if (index === 1 && eventData.locationType !== 'online') return
                                if (index === 2 && eventData.eventType !== 'recurring') return
                                return (
                                    <div key={index}
                                         className={`create-events-stepper__step ${currentStep === index ? 'create-events__active-step' : ''}
                                     ${maxStep.current < index ? 'create-events__disabled-step' : ''}`}
                                         onClick={() => handleSetStep(index)}
                                    >
                                        <CustomCheckbox checked={currentStep === index} completed={maxStep.current > index} />
                                        <div>
                                            <p>{t(`createEvent.steps.step-${index+1}.title`)}</p>
                                            {currentStep === index &&
                                                <p>{t(`createEvent.steps.step-${index+1}.description`)}</p>
                                            }
                                        </div>
                                    </div>
                                )
                            })}
                        </Stack>
                    </Stack>
                </div>
            </div>
            <div className={'create-events__main'}>
                <EventContext.Provider value={{ data: eventData, setData: setEventData, setHasUnsavedChanges }}>
                    <Outlet context={{ validate: validateStep, setAlert: setAlert, setCurrentStep: setCurrentStep, maxStep }} />
                </EventContext.Provider>
            </div>
            <button className={'create-events-main__continue-btn'}
                    onClick={handleContinue}
            >
                {hasUnsavedChanges && location.pathname.includes("edit") ? t('createEvent.saveChanges') : (currentStep < steps.length - 1 ? t('createEvent.continue') : t('createEvent.finish'))}
            </button>
        </div>
    );
}

export default CreateEvent;