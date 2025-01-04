import "../../styles/create-event-styles.css"
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import {Checkbox, Stack} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import {useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import {Link} from "react-router-dom";
import Dropdown from '@mui/joy/Dropdown';
import Menu from '@mui/joy/Menu';
import MenuButton from '@mui/joy/MenuButton';
import MenuItem from '@mui/joy/MenuItem';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import PropTypes from "prop-types";
import MediaUploader from "../MediaUploader.jsx";

const checkboxStyle = {
    sx: {
        color: 'inherit',
        '&.Mui-checked': {
            color: '#0079c5'
        },
    }
}

const CustomCheckbox = ({checked}) => {
    return (
        <Checkbox disabled checked={checked}
            icon={<CircleOutlinedIcon />}
                  checkedIcon={<RadioButtonCheckedIcon />}
                  {...checkboxStyle}
        />
    )
}

CustomCheckbox.propTypes = {
    checked: PropTypes.bool
}

const steps = [
    {
        title: 'Build Event Page',
        description: 'Add all of your event details and let attendees know what to expect'
    },
    {
        title: 'Add Tickets',
        description: 'Create tickets and start selling'
    },
    {
        title: 'Promote Event',
        description: 'Share your event and track your progress'
    }
]

function CreateEvent(){
    const [currentStep, setCurrentStep] = useState(0);

    return (
        <div className={'create-events-wrapper'}>
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
                            <CalendarTodayIcon /> Thu, Feb 13, 2025, 10:00 AM
                        </Stack>
                        <Dropdown>
                            <MenuButton>
                                Draft <ArrowDropDownIcon />
                            </MenuButton>
                            <Menu>
                                <MenuItem className={'disabled'} disabled={currentStep !== 3}>Publish</MenuItem>
                            </Menu>
                        </Dropdown>
                    </Stack>
                    <Stack className={'create-events-stepper__wrapper'}>
                        <p>Steps</p>
                        <Stack className={'create-events-stepper__steps'} rowGap={1}>
                            {steps.map((step, index) => (
                                <div key={index} className={`create-events-stepper__step ${currentStep === index ? 'create-events-stepper__current-step' : ''}`}>
                                    <CustomCheckbox checked={currentStep === index}/>
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
                <MediaUploader />
            </div>
        </div>
    )
}

export default CreateEvent;