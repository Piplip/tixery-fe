import "../../styles/organizer-event-styles.css";
import {
    Alert,
    Avatar,
    Checkbox,
    Dialog,
    FormControlLabel,
    IconButton,
    InputAdornment,
    LinearProgress,
    OutlinedInput,
    Snackbar,
    Stack,
    Typography
} from "@mui/material";
import Button from '@mui/joy/Button';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import SearchIcon from "@mui/icons-material/Search";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import CustomMenu from "../shared/CustomMenu.jsx";
import {Divider, Modal, ModalDialog, Radio, RadioGroup} from "@mui/joy";
import {useEffect, useRef, useState} from "react";
import CreateEventMenu from "./CreateEventMenu.jsx";
import CloseIcon from "@mui/icons-material/Close";
import {useLoaderData, useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {accountAxiosWithToken, eventAxiosWithToken} from "../../config/axiosConfig.js";
import {formatCurrency, getUserData} from "../../common/Utilities.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import PropTypes from "prop-types";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {useTranslation} from "react-i18next";

initializeApp(firebaseConfig);
const storage = getStorage();

moment.locales(localStorage.getItem('localce'))
const localizer = momentLocalizer(moment);

const eventStyleGetter = (event) => {
    const backgroundColor = {
        draft: '#e0e0e0',
        scheduled: '#2196f3',
        published: '#4caf50',
        past: '#f44336'
    }[event.resource.status];

    return {
        style: {
            backgroundColor,
            color: 'white',
            borderRadius: '4px',
            border: 'none',
            padding: '.25rem .5rem',
            fontSize: '0.9rem',
            margin: 5,
            textOverflow: 'ellipsis',
        }
    };
};

function OrganizerEvent() {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [events, setEvents] = useState(useLoaderData().data);
    const refEvents = useRef();
    const [profiles, setProfiles] = useState(null);
    const [alert, setAlert] = useState("");
    const [currentSelectedEvent, setCurrentSelectedEvent] = useState(null);
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [filters, setFilters] = useState({
        status: "all",
        keyword: "",
        profile: "all",
    });
    const [pastEvents, setPastEvents] = useState([]);
    const [view, setView] = useState('list');
    const navigate = useNavigate();
    const hasGetPast = useRef(false);

    useEffect(() => {
        if(!hasGetPast.current && showPastEvents){
            eventAxiosWithToken.get(`/get?uid=${getUserData("userID")}&past=true&tz=${(Math.round(new Date().getTimezoneOffset()) / -60)}`)
                .then(r => {
                    Promise.all(r.data.map(async (event) => {
                        try {
                            if (event.images && event.images[0]) {
                                const imgRef = ref(storage, event.images[0]);
                                const url = await getDownloadURL(imgRef);
                                return {...event, images: [url, ...event.images.slice(1)]};
                            } else {
                                return event;
                            }
                        } catch (err) {
                            console.log(err);
                            return event;
                        }
                    })).then(updatedEvents => {
                        setPastEvents(updatedEvents)
                        hasGetPast.current = true
                        refEvents.current = [...refEvents.current, ...updatedEvents]
                    });
                })
                .catch(err => console.log(err))
        }
    }, [showPastEvents]);

    useEffect(() => {
        if(profiles === null) {{
            accountAxiosWithToken.get(`/organizer/profile?u=${getUserData('sub')}`)
                .then(r => {
                    const data = r.data.records
                    Promise.all(data.map(async (profile) => {
                        try {
                            const imgRef = ref(storage, profile[2]);
                            profile[2] = await getDownloadURL(imgRef)
                        } catch (err) {
                            console.log(err);
                            return profile;
                        }
                    })).then(() => setProfiles(data));
                })
                .catch(err => console.log(err))
        }}
    }, [profiles]);

    useEffect(() => {
        Promise.all(events.map(async (event) => {
            try {
                if (event.images && event.images[0]) {
                    const imgRef = ref(storage, event.images[0]);
                    const url = await getDownloadURL(imgRef);
                    return {...event, images: [url, ...event.images.slice(1)]};
                } else {
                    return event;
                }
            } catch (err) {
                console.log(err);
                return event;
            }
        })).then(updatedEvents => {
            setEvents(updatedEvents)
            refEvents.current = updatedEvents
        });
    }, []);

    useEffect(() => {
        if (refEvents.current) {
            let filteredEvents = refEvents.current;

            if (filters.status !== "all") {
                filteredEvents = filteredEvents.filter(event =>
                    event.status.toLowerCase() === filters.status
                );
            }

            if (filters.keyword) {
                filteredEvents = filteredEvents.filter(event =>
                    event.name.toLowerCase().includes(filters.keyword)
                );
            }

            if (filters.profile !== "all") {
                filteredEvents = filteredEvents.filter(event =>
                    event.profile_id === filters.profile
                );
            }

            setEvents(filteredEvents.filter(event => !dayjs(event.start_time).isBefore(dayjs())));
            setPastEvents(filteredEvents.filter(event => dayjs(event.start_time).isBefore(dayjs())));
        }
    }, [filters]);

    function handleTypeChange(value, name) {
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    }

    function filterEventsByName(event) {
        const keyword = event.target.value.toLowerCase();
        setFilters(prevFilters => ({
            ...prevFilters,
            keyword: keyword
        }));
    }

    function handlePreDelete(id){
        setCurrentSelectedEvent(id)
        setOpenModal(true)
    }

    function handleDelete() {
        eventAxiosWithToken.post(`delete?eid=${currentSelectedEvent}`)
            .then(r => {
                setAlert(r.data.message);
                const newEvents = [...events];
                const newPastEvents = [...pastEvents];
                const index = newEvents.findIndex(event => event.event_id === currentSelectedEvent);
                const pastIndex = newPastEvents.findIndex(event => event.event_id === currentSelectedEvent);

                if (index !== -1) {
                    newEvents.splice(index, 1);
                    setEvents(newEvents);
                }

                if (pastIndex !== -1) {
                    newPastEvents.splice(pastIndex, 1);
                    setPastEvents(newPastEvents);
                }

                setOpenModal(false);
            })
            .catch(err => console.log(err));
    }

    const CustomEventWrapper = ({ event }) => {
        return (
            <Stack title={event.title} rowGap={.5}>
                <strong>{event.title}</strong>
                <div>
                    {moment(event.start).format('h:mm a')} - {moment(event.end).format('h:mm a')}
                </div>
                <div style={{ fontSize: '0.8rem' , textTransform: 'uppercase'}}>
                    {t(`event.status.${event.resource.status.toLowerCase()}`)}
                </div>
            </Stack>
        );
    };

    CustomEventWrapper.propTypes = {
        event: PropTypes.shape({
            title: PropTypes.string.isRequired,
            start: PropTypes.instanceOf(Date).isRequired,
            end: PropTypes.instanceOf(Date).isRequired,
            resource: PropTypes.object.isRequired
        })
    }

    const RenderEvents = ({data, type}) => {
        return (
            data.length !== 0 ?
                data.map((item, index) => {
                    return (
                        <div key={index} className={'event-list__item'}>
                            <Stack direction={'row'} columnGap={2} alignItems={'center'}>
                                <Stack sx={{ textAlign: 'center' }}>
                                    <p style={{ fontSize: '.9rem', color: 'darkblue' }}>{item?.start_time && dayjs(item.start_time).format("MMM").toUpperCase()}</p>
                                    <p style={{ fontSize: '1.5rem' }}>{item?.start_time && dayjs(item.start_time).format("DD").toUpperCase()}</p>
                                </Stack>
                                <img style={{ objectFit: 'cover' }}
                                     src={item?.images && item.images[0] || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
                                     alt={''} />
                                <Stack justifyContent={'space-between'}>
                                    <p style={{ color: 'black' }}>{item?.name}</p>
                                    <Stack marginTop={.5}>
                                        <Typography variant={'body2'} color={'gray'} style={{ textTransform: 'capitalize' }}>
                                            {item?.is_recurring ? t('event.recurring')
                                                : item.location.locationType === 'venue' ? t('event.venue') : t('event.online')}</Typography>
                                        <Typography variant={'body2'} color={'gray'}>
                                            {item?.start_date && dayjs(item.start_date).format('dddd, MMMM D, YYYY [at] HH:mm [GMT]Z')}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                            <Stack rowGap={.5}>
                                {item?.ticketCount ?
                                    <>
                                        <p>{Number(item?.ticketCount) - Number(item?.remainingTicket)} / {Number(item?.ticketCount)}</p>
                                        <LinearProgress
                                            sx={{ height: '.3rem', borderRadius: '.25rem' }}
                                            variant="determinate"
                                            value={(Number(item?.ticketCount) - Number(item?.remainingTicket)) / Number(item?.ticketCount) * 100}
                                        />
                                    </>
                                    :
                                    t('event.noTickets')
                                }
                            </Stack>
                            <p>
                                {item?.currency && item?.gross ? formatCurrency(item.gross / 100, item.currency) : "---"}
                            </p>
                            <p style={{ textTransform: 'uppercase' }}>{t(`event.status.${item?.status}`)}</p>
                            <CustomMenu
                                options={type === 'past' ? [t('event.view'), t('event.delete')]
                                    : [t('event.promote'), t('event.view'), ...(item?.location.locationType === 'online' ? [t('event.viewOnline')] : []), t('event.edit'), t('event.delete')]}
                                handlers={
                                    type === 'past' ?
                                        [() => window.open(`../../events/${item.event_id}`, '_blank'), () => handlePreDelete(item.event_id)]
                                        :
                                        [null, () => window.open(`../../events/${item.event_id}`, '_blank'),
                                            ...(item?.location.locationType === 'online' ? [() => window.open(`/online/${item.event_id}`, '_blank')] : []),
                                            () => { navigate(`edit/${item.event_id}`) }, () => handlePreDelete(item.event_id)]
                                }
                            />
                        </div>
                    )
                })
                :
                <div className={'no-event'}>
                    <p>{t('event.noEventsFound')}</p>
                </div>
        )
    }

    RenderEvents.propTypes = {
        data: PropTypes.array.isRequired,
        type: PropTypes.string
    }

    const calendarEvents = [
        ...events.map(event => ({
            title: event.name,
            start: new Date(dayjs(event.start_time).toDate()),
            end: new Date(dayjs(event.end_time).toDate()),
            allDay: false,
            resource: event,
        })),
        ...(showPastEvents ? pastEvents.map(event => {
            try {
                const start = dayjs(event.start_time);
                const end = dayjs(event.end_time);

                if (!start.isValid() || !end.isValid()) {
                    console.error("Invalid date:", event.start_time, event.end_time, event);
                    return null;
                }

                return {
                    title: event.name,
                    start: start.toDate(),
                    end: end.toDate(),
                    allDay: false,
                    resource: event,
                };
            } catch (error) {
                console.error("Error processing event:", event, error);
                return null;
            }
        }).filter(event => event !== null) : [])
    ];

    return (
        <div className="event-list">
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={alert !== ""} sx={{ marginTop: '3rem' }}
                autoHideDuration={5000} onClose={() => setAlert("")}
            >
                <Alert severity={"success"} variant="filled" sx={{ width: '100%' }}>
                    {alert}
                </Alert>
            </Snackbar>
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <ModalDialog variant="outlined" role="alertdialog">
                    <DialogTitle>
                        <ErrorOutlineRoundedIcon />
                        {t('modal.confirmation')}
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        {t('modal.deleteConfirmation')}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="solid" color="danger" onClick={handleDelete}>
                            {t('modal.delete')}
                        </Button>
                        <Button variant="plain" color="neutral" onClick={() => setOpenModal(false)}>
                            {t('modal.cancel')}
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
            <Typography className={'title'}>
                {t('eventList.title')}
            </Typography>
            <div className="event-list__header">
                <Stack direction={'row'} alignItems={'center'} columnGap={3}>
                    <OutlinedInput placeholder={t('eventList.searchEvents')} size={"small"} sx={{ minWidth: '20rem' }}
                                   value={filters.keyword} onChange={filterEventsByName}
                                   endAdornment={
                                       <InputAdornment position="end">
                                           <IconButton>
                                               <SearchIcon />
                                           </IconButton>
                                       </InputAdornment>
                                   }
                    />
                    <RadioGroup
                        style={{ display: 'flex', flexDirection: 'row', columnGap: '1rem' }}
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                    >
                        <FormControlLabel value="list" control={<Radio sx={{ marginRight: 1 }} />} label={t('eventList.listView')} />
                        <FormControlLabel value="calendar" control={<Radio sx={{ marginRight: 1 }} />} label={t('eventList.calendarView')} />
                    </RadioGroup>
                    <div className="event-list__filters">
                        <Select defaultValue="all" onChange={(_, val) => handleTypeChange(val, "status")}>
                            <Option value="draft">{t('eventList.draft')}</Option>
                            <Option value="scheduled">{t('eventList.upcomingEvents')}</Option>
                            <Option value="published">{t('eventList.publishedEvents')}</Option>
                            <Option value="past">{t('eventList.pastEvents')}</Option>
                            <Option value="all">{t('eventList.allEvents')}</Option>
                        </Select>
                        <Select value={filters.profile} onChange={(_, val) => handleTypeChange(val, "profile")}>
                            <Option value="all">{t('eventList.allOrganizers')}</Option>
                            {profiles && profiles.map((profile, index) => {
                                return (
                                    <Option value={profile[0]} key={index} sx={{ padding: '.5rem 1rem' }}>
                                        <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                            <Avatar src={profile[2]} />
                                            {profile[1]}
                                        </Stack>
                                    </Option>
                                )
                            })}
                        </Select>
                        <FormControlLabel control={<Checkbox checked={showPastEvents} onChange={() => setShowPastEvents(prev => !prev)} />}
                                          label={t('eventList.showPastEvents')} labelPlacement={'start'} />
                    </div>
                </Stack>
                <button className="event-list__create-button" onClick={() => setOpen(true)}>
                    {t('eventList.createEvent')}
                </button>
            </div>
            {view === 'list' ? (
                <>
                    <Stack className={'event-list__list'}>
                        <div>
                            <p>{t('eventList.event')}</p>
                            <p>{t('eventList.sold')}</p>
                            <p>{t('eventList.gross')}</p>
                            <p>{t('eventList.status')}</p>
                        </div>
                        <RenderEvents data={events} />
                    </Stack>
                    {showPastEvents &&
                        <>
                            <div className={'horizontal-text-line'} style={{ marginBottom: 2 }}>
                                <p>{t('eventList.pastEvents')}</p>
                            </div>
                            <Stack className={'event-list__list'}>
                                <RenderEvents data={pastEvents} type={'past'} />
                            </Stack>
                        </>
                    }
                </>
            ) : (
                <Calendar
                    localizer={localizer}
                    events={calendarEvents}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 1200, margin: '20px 0' }}
                    onSelectEvent={event => navigate(`../../events/${event.resource.event_id}`)}
                    messages={{
                        month: t('calendar.month'),
                        week: t('calendar.week'),
                        day: t('calendar.day'),
                        today: t('calendar.today'),
                        previous: t('calendar.previous'),
                        next: t('calendar.next'),
                    }}
                    eventPropGetter={eventStyleGetter}
                    components={{
                        event: CustomEventWrapper
                    }}
                    timeslots={2}
                    step={60}
                    defaultView="week"
                    views={['month', 'week', 'day']}
                />
            )}
            {(events.length > 0 || pastEvents.length > 0) &&
                <div className="event-list__footer">
                    <a href="#" className="event-list__export-link">
                        {t('eventList.csvExport')}
                    </a>
                </div>
            }
            <Dialog onClose={() => setOpen(false)} open={open} maxWidth={"md"}>
                <DialogTitle sx={{ marginTop: 2, fontSize: '1.75rem', padding: '.25rem 1.5rem 0', textAlign: 'center' }}>
                    {t('eventList.createNewEvent')}
                </DialogTitle>
                <IconButton
                    onClick={() => setOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ padding: '1.5rem' }}>
                    <CreateEventMenu />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default OrganizerEvent;