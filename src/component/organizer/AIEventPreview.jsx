import {Button, Collapse, IconButton, Stack, ToggleButton, ToggleButtonGroup} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TopNav from "../shared/TopNav.jsx";
import EventView from "../shared/EventView.jsx";
import {Link, useLoaderData, useLocation} from "react-router-dom";
import RootFooter from "../shared/RootFooter.jsx";
import "../../styles/ai-event-preview-styles.css"
import {checkLoggedIn} from "../../common/Utilities.js";
import {useState} from "react";
import {Card, CardContent} from "@mui/joy";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function AIEventPreview(){
    const data = useLoaderData()
    const [viewMode, setViewMode] = useState('pc')
    const [expanded, setExpanded] = useState(true)
    const location = useLocation()

    return (
        <Stack className={'ai-event-preview__wrapper'} sx={{width: '85%', marginInline: 'auto'}} rowGap={2}>
            <Stack>
                <Stack direction={'row'} justifyContent={'space-between'} borderBottom={'1px solid'} paddingBottom={1} paddingInline={'1rem'}>
                    <Stack direction={'row'} alignItems={'center'}>
                        <KeyboardArrowLeftIcon />
                        <Link to={'/organizer/events'} className={'link'}>
                            <p>Exit</p>
                        </Link>
                    </Stack>
                    <Stack direction={'row'} alignItems={'center'}>
                        <ToggleButtonGroup value={viewMode} exclusive onChange={(e, value) => setViewMode(value)}>
                            <ToggleButton value={'phone'}>
                                <PhoneAndroidIcon />
                            </ToggleButton>
                            <ToggleButton value={'pc'}>
                                <DesktopWindowsOutlinedIcon />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Stack>
                <p style={{backgroundColor: '#efefef', padding: '.75rem 1rem'}}>
                    Need to make some updates ? <Link className={'link'}
                                                      to={`/organizer/events/edit/${location.pathname.split('/')[3]}`}>Edit event</Link>
                </p>
            </Stack>
            <Stack className={'ai-event-preview'}>
                <TopNav isLoggedIn={checkLoggedIn()}/>
                <div>
                    <EventView data={data}/>
                </div>
                <RootFooter />
            </Stack>
            <Card className="event-ready-card" sx={{position: 'fixed', right: '1rem', bottom: '1rem', backgroundColor: '#f3f3f3'}}>
                <CardContent className="event-ready-card__content" sx={{padding: '0 1rem 1rem'}}>
                    <IconButton onClick={() => setExpanded(prev => !prev)} sx={{alignSelf: 'flex-end', backgroundColor: '#d7d7d7'}}>
                        {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                    </IconButton>
                    <Collapse in={expanded}>
                        <h2 className="event-ready-card__title">YOUR EVENT IS ALMOST READY!</h2>
                        <p className="event-ready-card__subtitle">
                            Review and edit your event to make sure it looks good. Or publish now and let attendees find it.
                        </p>

                        <div className="event-ready-card__sections">
                            <div className="event-ready-card__section">
                                <h4 className="event-ready-card__section-title">What we included:</h4>
                                <ul className="event-ready-card__list">
                                    <li>✔ Image, summary and description</li>
                                    <li>✔ Category and tags</li>
                                    <li>✔ General Admission Tickets</li>
                                </ul>
                            </div>

                            <div className="event-ready-card__section">
                                <h4 className="event-ready-card__section-title">Add more to your event:</h4>
                                <ul className="event-ready-card__list event-ready-card__list--add">
                                    <li>➕ Event images and video</li>
                                    <li>➕ FAQ or Agenda</li>
                                    <li>➕ Tickets or promo codes</li>
                                    <li>➕ Review your refund policy</li>
                                </ul>
                            </div>
                        </div>
                    </Collapse>
                    <div className="event-ready-card__buttons">
                        <Link to={`/organizer/events/edit/${location.pathname.split('/')[3]}/publish`}>
                            <Button variant="contained" className="event-ready-card__button event-ready-card__button--publish">
                                Publish now
                            </Button>
                        </Link>
                        <Link to={`/organizer/events/edit/${location.pathname.split('/')[3]}`}>
                            <Button variant="outlined" className="event-ready-card__button">
                                Edit event
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </Stack>
    )
}

export default AIEventPreview