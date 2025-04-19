import {Button, Collapse, IconButton, Stack, ToggleButton, ToggleButtonGroup} from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DesktopWindowsOutlinedIcon from '@mui/icons-material/DesktopWindowsOutlined';
import TopNav from "../shared/TopNav.jsx";
import EventView from "../shared/EventView.jsx";
import {Link, useLoaderData, useLocation} from "react-router-dom";
import RootFooter from "../shared/RootFooter.jsx";
import "../../styles/ai-event-preview-styles.css"
import {checkLoggedIn} from "@/common/Utilities.js";
import {useState} from "react";
import {Card, CardContent} from "@mui/joy";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import {useTranslation} from "react-i18next";

function AIEventPreview(){
    const data = useLoaderData()
    const [viewMode, setViewMode] = useState('pc')
    const [expanded, setExpanded] = useState(true)
    const location = useLocation()
    const {t} = useTranslation()

    return (
        <Stack className={'ai-event-preview__wrapper'} sx={{ width: viewMode === 'pc' ? '85%' : '35%', marginInline: 'auto' }} rowGap={2}>
            <Stack>
                <Stack direction={'row'} justifyContent={'space-between'} borderBottom={'1px solid'} paddingBottom={1} paddingInline={'1rem'}>
                    <Stack direction={'row'} alignItems={'center'}>
                        <KeyboardArrowLeftIcon />
                        <Link to={'/organizer/events'} className={'link'}>
                            <p>{t('aiEventPreview.exit')}</p>
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
                <p style={{ backgroundColor: '#efefef', padding: '.75rem 1rem' }}>
                    {t('aiEventPreview.needUpdates')} <Link className={'link'}
                                                            to={`/organizer/events/edit/${location.pathname.split('/')[3]}`}>{t('aiEventPreview.editEvent')}</Link>
                </p>
            </Stack>
            <Stack className={'ai-event-preview'}>
                <TopNav isLoggedIn={checkLoggedIn()} />
                <div>
                    <EventView data={data} />
                </div>
                <RootFooter />
            </Stack>
            <Card className="event-ready-card" sx={{ position: 'fixed', right: '1rem', bottom: '1rem', backgroundColor: '#f3f3f3' }}>
                <CardContent className="event-ready-card__content" sx={{ padding: '0 1rem 1rem' }}>
                    <IconButton onClick={() => setExpanded(prev => !prev)} sx={{ alignSelf: 'flex-end', backgroundColor: '#d7d7d7' }}>
                        {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                    </IconButton>
                    <Collapse in={expanded}>
                        <h2 className="event-ready-card__title">{t('aiEventPreview.almostReady')}</h2>
                        <p className="event-ready-card__subtitle">
                            {t('aiEventPreview.reviewEdit')}
                        </p>

                        <div className="event-ready-card__sections">
                            <div className="event-ready-card__section">
                                <h4 className="event-ready-card__section-title">{t('aiEventPreview.weIncluded')}</h4>
                                <ul className="event-ready-card__list">
                                    <li>✔ {t('aiEventPreview.imageSummary')}</li>
                                    <li>✔ {t('aiEventPreview.categoryTags')}</li>
                                    <li>✔ {t('aiEventPreview.generalAdmission')}</li>
                                </ul>
                            </div>

                            <div className="event-ready-card__section">
                                <h4 className="event-ready-card__section-title">{t('aiEventPreview.addMore')}</h4>
                                <ul className="event-ready-card__list event-ready-card__list--add">
                                    <li>➕ {t('aiEventPreview.eventImagesVideo')}</li>
                                    <li>➕ {t('aiEventPreview.faqAgenda')}</li>
                                    <li>➕ {t('aiEventPreview.ticketsPromo')}</li>
                                    <li>➕ {t('aiEventPreview.refundPolicy')}</li>
                                </ul>
                            </div>
                        </div>
                    </Collapse>
                    <div className="event-ready-card__buttons">
                        <Link to={`/organizer/events/edit/${location.pathname.split('/')[3]}?ref=preview`}>
                            <Button variant="contained" className="event-ready-card__button event-ready-card__button--publish">
                                {t('aiEventPreview.publishNow')}
                            </Button>
                        </Link>
                        <Link to={`/organizer/events/edit/${location.pathname.split('/')[3]}`}>
                            <Button variant="outlined" className="event-ready-card__button">
                                {t('aiEventPreview.editEvent')}
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </Stack>
    )
}

export default AIEventPreview