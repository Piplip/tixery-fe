import "../../styles/organizer-event-styles.css"
import {
    Alert,
    Avatar,
    Dialog,
    FormControlLabel,
    IconButton,
    InputAdornment,
    LinearProgress,
    OutlinedInput, Snackbar,
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
import {getUserData} from "../../common/Utilities.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

function OrganizerEvent() {
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const [open, setOpen] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [events, setEvents] = useState(useLoaderData().data)
    const refEvents = useRef()
    const [profiles, setProfiles] = useState(null)
    const [alert, setAlert] = useState("")
    const [currentSelectedEvent, setCurrentSelectedEvent] = useState(null)
    const [filters, setFilters] = useState({
        status: "all",
        keyword: "",
        profile: "all",
    });
    const navigate = useNavigate()

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

            setEvents(filteredEvents);
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

    function handleDelete(){
        eventAxiosWithToken.post(`delete?eid=${currentSelectedEvent}`)
            .then(r => {
                setAlert(r.data.message)
                const newEvents = [...events]
                const index = newEvents.findIndex(event => event.event_id === currentSelectedEvent)
                newEvents.splice(index, 1)
                setEvents(newEvents)
                setOpenModal(false)
            })
    }

    // TODO: Implement calendar view later

    return (
        <div className="event-list">
            <Snackbar
                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                open={alert !== ""} sx={{marginTop: '3rem'}}
                autoHideDuration={5000} onClose={() => setAlert("")}
            >
                <Alert severity={"success"} variant="filled" sx={{ width: '100%'}}>
                    {alert}
                </Alert>
            </Snackbar>
            <Modal open={openModal} onClose={() => setOpenModal(false)}>
                <ModalDialog variant="outlined" role="alertdialog">
                    <DialogTitle>
                        <ErrorOutlineRoundedIcon />
                        Confirmation
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        Are you sure you want to delete this event? This action cannot be undone.
                    </DialogContent>
                    <DialogActions>
                        <Button variant="solid" color="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                        <Button variant="plain" color="neutral" onClick={() => setOpenModal(false)}>
                            Cancel
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
            <Typography className={'title'}>
                Events
            </Typography>
            <div className="event-list__header">
                <Stack direction={'row'} alignItems={'center'} columnGap={4}>
                    <OutlinedInput placeholder={"Search events"} size={"small"} sx={{minWidth: '20rem'}}
                                   value={filters.keyword} onChange={filterEventsByName}
                                   endAdornment={
                                       <InputAdornment position="end">
                                           <IconButton>
                                               <SearchIcon/>
                                           </IconButton>
                                       </InputAdornment>
                                   }
                    />
                    <RadioGroup
                        style={{display: 'flex', flexDirection: 'row', columnGap: '1rem'}}
                        defaultValue="female"
                    >
                        <FormControlLabel value="female" control={<Radio sx={{marginRight: 1}}/>} label="List view" />
                        <FormControlLabel value="male" control={<Radio sx={{marginRight: 1}}/>} label="Calendar view" />
                    </RadioGroup>
                    <div className="event-list__filters">
                        <Select defaultValue="all" onChange={(_, val) => handleTypeChange(val, "status")}>
                            <Option value="draft">Draft</Option>
                            <Option value="scheduled">Upcoming events</Option>
                            <Option value="published">Published events</Option>
                            <Option value="past">Past events</Option>
                            <Option value="all">All events</Option>
                        </Select>
                        <Select value={filters.profile} onChange={(_, val) => handleTypeChange(val, "profile")}>
                            <Option value="all">All organizers</Option>
                            {profiles && profiles.map((profile, index) => {
                                return (
                                    <Option value={profile[0]} key={index} sx={{padding: '.5rem 1rem'}}>
                                        <Stack direction={'row'} columnGap={1} alignItems={'center'}>
                                            <Avatar src={profile[2]} />
                                            {profile[1]}
                                        </Stack>
                                    </Option>
                                )
                            })}
                        </Select>
                    </div>
                </Stack>
                <button className="event-list__create-button" onClick={() => setOpen(true)}>
                    Create Event
                </button>
            </div>

            <Stack className={'event-list__list'}>
                <div>
                    <p>Event</p>
                    <p>Sold</p>
                    <p>Gross</p>
                    <p>Status</p>
                </div>
                {events.length !== 0 ?
                    events.map((item, index) => {
                        return (
                            <div key={index}>
                                <Stack direction={'row'} columnGap={2} alignItems={'center'}>
                                    <Stack sx={{textAlign: 'center'}}>
                                        <p style={{fontSize: '.9rem', color: 'darkblue'}}>{item?.start_time && dayjs(item.start_time).format("MMM").toUpperCase()}</p>
                                        <p style={{fontSize: '1.5rem'}}>{item?.start_time && dayjs(item.start_time).format("DD").toUpperCase()}</p>
                                    </Stack>
                                    <img
                                        src={item?.images && item.images[0] || "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"}
                                        alt={''}/>
                                    <Stack justifyContent={'space-between'}>
                                        <p style={{color: 'black'}}>{item?.name}</p>
                                        <Stack marginTop={.5}>
                                            <Typography variant={'body2'} color={'gray'} style={{textTransform: 'capitalize'}}>
                                                {item?.location && item.location.locationType} event</Typography>
                                            <Typography variant={'body2'} color={'gray'}>
                                                {item?.start_date && dayjs(item.start_date).format('dddd, MMMM D, YYYY [at] HH:mm [GMT]Z')}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Stack rowGap={.5}>
                                    <p>0 / {item?.ticketCount}</p>
                                    <LinearProgress sx={{height: '.3rem', borderRadius: '.25rem'}}
                                                    variant={"determinate"}
                                                    value={50}
                                    />
                                </Stack>
                                <p>$0.00</p>
                                <p style={{textTransform: 'uppercase'}}>{item?.status}</p>
                                <CustomMenu
                                    options={['Promote on Tixery', 'View', 'Edit', 'Delete']}
                                    handlers={[null,
                                        () => navigate(`../../events/${item.event_id}`),
                                        () => {navigate(`edit/${item.event_id}`)},
                                        () => handlePreDelete(item.event_id)
                                    ]}
                                />
                            </div>
                        )})
                    :
                    <div className={'no-event'}>
                        <p>No events found</p>
                    </div>
                }
            </Stack>
            {events.length !== 0 &&
                <div className="event-list__footer">
                    <a href="#" className="event-list__export-link">
                        CSV Export
                    </a>
                </div>
            }
            <Dialog onClose={() => setOpen(false)} open={open} maxWidth={"md"}>
                <DialogTitle sx={{marginTop: 2, fontSize: '1.75rem', padding: '.5rem 1rem 0', textAlign: 'center'}}>
                    CREATE NEW EVENT
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={() => setOpen(false)}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon/>
                </IconButton>
                <DialogContent sx={{p: 2}}>
                    <CreateEventMenu />
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default OrganizerEvent