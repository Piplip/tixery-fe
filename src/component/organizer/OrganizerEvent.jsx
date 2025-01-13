import "../../styles/organizer-event-styles.css"
import {
    Avatar,
    Dialog,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    LinearProgress,
    OutlinedInput,
    Stack,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import CustomMenu from "../CustomMenu.jsx";
import {Radio, RadioGroup} from "@mui/joy";
import {useEffect, useRef, useState} from "react";
import CreateEventMenu from "./CreateEventMenu.jsx";
import CloseIcon from "@mui/icons-material/Close";
import {useLoaderData} from "react-router-dom";
import dayjs from "dayjs";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {getUserData} from "../../common/Utilities.js";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";

function OrganizerEvent() {
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const [open, setOpen] = useState(false);
    const [events, setEvents] = useState(useLoaderData().data)
    const refEvents = useRef()
    const [profiles, setProfiles] = useState(null)
    const [filters, setFilters] = useState({
        status: "all",
        keyword: "",
        profile: "all",
    });

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
                const imgRef = ref(storage, event.images[0]);
                const url = await getDownloadURL(imgRef);
                return {...event, images: [url, ...event.images.slice(1)]};
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

    // TODO: Implement calendar view later

    console.log(events)

    return (
        <div className="event-list">
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
                {events && events.map((item, index) => {
                    return (
                        <div key={index}>
                            <Stack direction={'row'} columnGap={2} alignItems={'center'}>
                                <Stack textAlign={'center'}>
                                    <p style={{fontSize: '.9rem', color: 'darkblue'}}>{dayjs(item.start_date).format("MMM").toUpperCase()}</p>
                                    <p style={{fontSize: '1.5rem'}}>{dayjs(item.start_date).format("DD").toUpperCase()}</p>
                                </Stack>
                                <img
                                    src={item.images[0]}
                                    alt={''}/>
                                <Stack justifyContent={'space-between'}>
                                    <p style={{color: 'black'}}>{item.name}</p>
                                    <Stack marginTop={.5}>
                                        <Typography variant={'body2'} color={'gray'} style={{textTransform: 'capitalize'}}>
                                            {item.location.locationType} event</Typography>
                                        <Typography variant={'body2'} color={'gray'}>
                                            {dayjs(item.start_date).format('dddd, MMMM D, YYYY [at] HH:mm [GMT]Z')}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Stack>
                            <Stack rowGap={.5}>
                                <p>0 / {item.ticketCount}</p>
                                <LinearProgress sx={{height: '.3rem', borderRadius: '.25rem'}}
                                                variant={"determinate"}
                                                value={50}
                                />
                            </Stack>
                            <p>$0.00</p>
                            <p style={{textTransform: 'uppercase'}}>{item.status}</p>
                            <CustomMenu
                                options={['Promote on Tixery', 'View', 'Edit', 'Copy Link', 'Copy Event', 'Delete']}/>
                        </div>
                    )
                })}
            </Stack>
            <div className="event-list__footer">
                <a href="#" className="event-list__export-link">
                    CSV Export
                </a>
            </div>
            <Dialog onClose={() => setOpen(false)} open={open} maxWidth={"md"}>
                <DialogTitle textAlign={'center'} sx={{marginTop: 2, fontSize: '1.75rem'}}>CREATE NEW
                    EVENT</DialogTitle>
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

                <DialogContent>
                    <CreateEventMenu/>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default OrganizerEvent