import {Stack, Typography} from "@mui/material";
import {getUserData} from "../../common/Utilities.js";
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import EditIcon from '@mui/icons-material/Edit';
import {Link} from "react-router-dom";
import '../../styles/organizer-home-styles.css'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function OrganizerHome(){
    return (
        <div className={'organizer-home-container'}>
            <Stack direction={'row'} columnGap={'4rem'}>
                <Stack rowGap={3}>
                    <Typography variant={'h2'} fontWeight={'bold'}>
                        Hi there, {getUserData('fullName')}
                    </Typography>
                    <Stack direction={'row'} columnGap={'1rem'}>
                        <div className={'create-events-item'}>
                            <EditIcon />
                            <Typography variant={'h5'}>Start from scratch</Typography>
                            <Typography variant={'body2'}>Add all your event details, create new tickets, and set up
                                recurring events</Typography>
                            <button>Create event</button>
                        </div>
                        <div className={'create-events-item'}>
                            <AutoFixHighIcon />
                            <Typography variant={'h5'}>Create with AI</Typography>
                            <Typography variant={'body2'}>Answer a few quick questions to generate an event that&#39;s ready to publish almost instantly</Typography>
                            <button>Create with AI</button>
                        </div>
                    </Stack>
                    <Stack rowGap={1} className={'checklist-wrapper'}>
                        <Typography variant={'h4'} fontWeight={'bold'}>Your checklist</Typography>
                        <Typography variant={'body1'}>
                            We make it easy to plan successful events. Here&#39;s how to start!
                        </Typography>
                        <Stack rowGap={1}>
                            <Stack direction={'row'} justifyContent={'space-between'} className={'checklist-steps'}>
                                <Stack>
                                    <p>Create event</p>
                                    <p>Publish an event to reach millions of people in
                                        Tixery</p>
                                </Stack>
                                <Stack direction={'row'} alignItems={'center'} columnGap={1} className={'check-list-item-start'}>
                                    <AutoAwesomeIcon/>
                                    <p>Start here</p>
                                </Stack>
                            </Stack>
                            <div className={'checklist-steps'}>
                                <Stack>
                                    <p>Set up your organizer profile</p>
                                    <p>Highlight your brand by adding your organizer a name,
                                        logo and bio</p>
                                </Stack>
                            </div>
                            <div className={'checklist-steps'}>
                                <Stack>
                                    <p>Add your bank account</p>
                                    <p>Get paid for futuring ticket sales by adding your bank details</p>
                                </Stack>
                            </div>
                        </Stack>
                    </Stack>
                </Stack>
                <Stack className={'organizer-setup-profile-cta'} rowGap={1}>
                    <Typography variant={'h6'} fontWeight={'bold'}>
                        Set up your organizer profile
                    </Typography>
                    <Typography variant={'body2'}>
                        A complete profile can increase discoverability, highlight your brand and trust among attendees
                    </Typography>
                    <Link to={'/organizer/info'}>Set up your profile →</Link>
                </Stack>
            </Stack>
        </div>
    )
}

export default OrganizerHome