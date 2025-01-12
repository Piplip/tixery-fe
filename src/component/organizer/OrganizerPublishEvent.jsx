import {Box, Checkbox, FormControlLabel, Stack, TextField, Typography} from "@mui/material";
import {Link, NavLink} from "react-router-dom";
import ImageIcon from '@mui/icons-material/Image';
import "../../styles/organizer-publish-event-styles.css"
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Radio, RadioGroup} from "@mui/joy";
import {useContext, useEffect, useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import PropTypes from "prop-types";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import {EventContext} from "../../context.js";
import dayjs from "dayjs";
import {capitalizeFirstLetter, getUserData} from "../../common/Utilities.js";
import {DatePicker, TimePicker} from "@mui/x-date-pickers";
import {initializeApp} from "firebase/app";
import {firebaseConfig} from "../../config/firebaseConfig.js";
import {getDownloadURL, getStorage, ref} from "firebase/storage";

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
    checked: PropTypes.bool,
}

const eventData = {
    sports: {
        categories: {
            football: ["Premier League", "La Liga", "Serie A"],
            basketball: ["NBA", "EuroLeague"],
        },
    },
    music: {
        categories: {
            rock: ["Classic Rock", "Alternative Rock"],
            pop: ["K-Pop", "Synth Pop"],
        },
    },
};


function OrganizerPublishEvent(){
    initializeApp(firebaseConfig);
    const storage = getStorage()
    const {data, setData} = useContext(EventContext)
    const [eventImg, setEventImg] = useState(null)

    const availableCategories =
        data.type && eventData[data.type]?.categories
            ? Object.keys(eventData[data.type].categories)
            : [];

    const availableSubCategories =
        data.category && eventData[data.type]?.categories[data.category]
            ? eventData[data.type].categories[data.category]
            : [];

    useEffect(() => {
        if(eventImg === null){
            const imageRef = ref(storage, data.images[0])
            getDownloadURL(imageRef)
                .then((url) => {
                    setEventImg(url)
                })
                .catch(err => console.log(err))
        }
    }, []);

    // TODO: Should add a check if the publish date and time is after the event date and time

    return (
        <div className="event-publish">
            <div>
                <h2 className="event-publish__heading">
                    Your event is almost ready to publish
                </h2>
                <p className="event-publish__subheading">
                    Review your settings and let everyone find your event.
                </p>

                <div className="event-publish__container">
                    <Stack sx={{margin: '1rem 0 1rem 1rem'}}>
                        <Box className="event-publish__details-card">
                            {eventImg ?
                                <img src={eventImg} alt="event" className="event-publish__image"/>
                                :
                                <div className="event-publish__image">
                                    <ImageIcon className="event-publish__image-icon" sx={{fontSize: '3rem'}}/>
                                </div>
                            }
                            <div className="event-publish__details">
                                <p className="event-publish__title">{data.eventTitle}</p>
                                <p className="event-publish__datetime">
                                    {dayjs(data.eventDate, 'DD/MM/YYYY').format('dddd, DD MMMM')} • {data.eventStartTime} - {data.eventEndTime} GMT+{data.timezone}
                                </p>
                                <p className="event-publish__online">
                                    {data.locationType === 'venue' ? 'Offline event' : 'Online event'}
                                </p>
                                <Stack direction={'row'} justifyContent={'space-between'}>
                                    <div className="event-publish__info">
                                        <span><BookOnlineIcon/> {data.tickets[0].price.toUpperCase()}</span>
                                        <span><PersonIcon/>{data.capacity}</span>
                                    </div>
                                    <Link to="/preview" className="event-publish__preview">
                                        Preview <OpenInNewIcon/>
                                    </Link>
                                </Stack>
                            </div>
                        </Box>
                        <Box className="event-publish__form-section">
                            <h3>Organized by</h3>
                            <Select
                                color="neutral"
                                disabled
                                placeholder={getUserData('profileName')}
                                size="md"
                                variant="soft"
                            >
                            </Select>
                            <p className="event-publish__organizer-info">
                                Your event will appear on this organizer&#39;s profile page.
                            </p>
                            <Link to="/organizer/u" target={'_blank'} className="event-publish__organizer-link">
                                View organizer info
                            </Link>
                        </Box>
                    </Stack>
                    <Stack className="event-publish__form">
                        <Box className="event-publish__form-section">
                            <h3>Event type and category</h3>
                            <p>Your type and category help your event appear in more searches.</p>
                            <Stack rowGap={'1rem'}>
                                <Select
                                    color="neutral"
                                    disabled={false}
                                    placeholder="Type"
                                    size="md"
                                    variant="soft"
                                    value={data.type}
                                    onChange={(_, val) => setData(prev => ({...prev, type: val}))}
                                >
                                    <Option value={''}>Select a type</Option>
                                    {Object.keys(eventData).map((type) => (
                                        <Option key={type} value={type}>
                                            {capitalizeFirstLetter(type)}
                                        </Option>
                                    ))}
                                </Select>
                                <Stack direction={'row'} columnGap={2}>
                                    <Select sx={{width: '100%'}}
                                        color="neutral"
                                        placeholder="Catergory"
                                        size="md"
                                        variant="soft"
                                        value={data.category} disabled={!data.type}
                                            onChange={(_, val) => setData(prev => ({...prev, category: val}))}
                                    >
                                        <Option value={''}>Select a category</Option>
                                        {availableCategories.map((category) => (
                                            <Option key={category} value={category}>
                                                {capitalizeFirstLetter(category)}
                                            </Option>
                                        ))}
                                    </Select>
                                    <Select sx={{width: '100%'}}
                                        color="neutral"
                                        placeholder="Sub category"
                                        size="md"
                                        variant="soft"  disabled={!data.category}
                                        value={data.subCategory}
                                            onChange={(_, val) => setData(prev => ({...prev, subCategory: val}))}
                                    >
                                        <Option value={''}>Select sub category</Option>
                                        {availableSubCategories.map((subCategory) => (
                                            <Option key={subCategory} value={subCategory}>
                                                {capitalizeFirstLetter(subCategory)}
                                            </Option>
                                        ))}
                                    </Select>
                                </Stack>
                            </Stack>
                        </Box>

                        <Box className="event-publish__form-section">
                            <h3>Tags</h3>
                            <Typography variant={'caption'}>
                                Help people discover your event by adding tags related to your
                                event’s theme, topic, vibe, location, and more.
                            </Typography>
                            <TextField
                                value={data.tags}
                                onChange={(e) => setData(prev => ({...prev, tags: e.target.value}))}
                                multiline
                                rows={4}
                                placeholder="Add search keywords to your event"
                                variant="outlined"
                                helperText={data.tags ? `${data.tags.split(',').length}/12 tags` : 'Separate tags with commas'}
                            />
                        </Box>
                    </Stack>
                </div>
            </div>
            <div className="publish-settings">
                <h2 className="publish-settings__heading">Publish settings</h2>
                <Stack className="publish-settings__container" direction="row" spacing={4}>
                    <Box className="publish-settings__form">
                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>Is your event public or private?</h3>
                            <RadioGroup name="eventPrivacy" defaultValue="public" className={'radio-group'}>
                                <Stack>
                                    <FormControlLabel
                                        value="public"
                                        control={<Radio sx={{marginRight: 1}}
                                                        checked={data.eventVisibility === 'public'}
                                                        onClick={() => setData(prev => ({...prev, eventVisibility: 'public'}))}/>}
                                        label="Public"
                                    />
                                    <p className="publish-settings__description">
                                        Shared only with a select audience
                                    </p>
                                </Stack>
                                <Stack>
                                    <FormControlLabel
                                        value="private"
                                        control={<Radio sx={{marginRight: 1}}
                                                        onClick={() => setData(prev => ({...prev, eventVisibility: 'private'}))}
                                                        checked={data.eventVisibility === 'private'}/>}
                                        label="Private"
                                    />
                                    <p className="publish-settings__description">
                                        Shared only with a select audience
                                    </p>
                                </Stack>
                            </RadioGroup>
                        </Stack>
                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>Set your refund policy</h3>
                            <p className="publish-settings__description">
                                After your event is published, you can only update your policy to make it more flexible
                                for your attendees.
                            </p>
                            <RadioGroup name="refundPolicy" defaultValue="allowRefunds" className={'radio-group'}
                                        value={data.allowRefund}
                                onChange={() => {
                                    setData(prev => ({...prev, allowRefund: !prev.allowRefund, daysForRefund: prev.allowRefund ? null : 1}))
                                }}
                            >
                                <FormControlLabel
                                    value={true}
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="Allow refunds"
                                />
                                <FormControlLabel
                                    value={false}
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="Don't allow refunds"
                                />
                            </RadioGroup>
                            {data.allowRefund &&
                                <Stack rowGap={.5} marginTop={2}>
                                    <TextField
                                        className="publish-settings__input"
                                        type="number"
                                        value={data.daysForRefund}
                                        onChange={(e) => setData(prev => ({...prev, daysForRefund: e.target.value}))}
                                        label="Days before the event"
                                        error={data.daysForRefund < 1 || data.daysForRefund > 30}
                                        helperText={data.daysForRefund < 1 || data.daysForRefund > 30 ? 'Please enter a number between 1 and 30' : ''}
                                        slotProps={{
                                            htmlInput: {
                                                min: 1, max: 30
                                            }
                                        }}
                                    />
                                    <p className="publish-settings__description">
                                        Set how many days (1 to 30) before the event that attendees can request refunds.
                                    </p>
                                </Stack>
                            }
                        </Stack>

                        {data.allowRefund &&
                            <Stack className="publish-settings__section" rowGap={1}>
                                <h3>Automate refunds</h3>
                                <p className="publish-settings__description">
                                    Automatically approve refund requests for orders of one ticket if the event balance can
                                    cover the request. If turned off, you must respond to all refund requests within five
                                    days.
                                </p>
                                <RadioGroup name="automateRefunds" defaultValue="manual" className={'radio-group'}
                                            value={data.automatedRefund}
                                            onChange={(e) => setData(prev => ({...prev, automatedRefund: e.target.value}))}
                                >
                                    <FormControlLabel
                                        value={true}
                                        control={<Radio sx={{marginRight: 1}}/>}
                                        label="Yes, automate refunds"
                                    />
                                    <FormControlLabel
                                        value={false}
                                        control={<Radio sx={{marginRight: 1}}/>}
                                        label="No, I'll respond to each request"
                                    />
                                </RadioGroup>
                            </Stack>
                        }

                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>When should we publish your event?</h3>
                            <RadioGroup name="publishTiming" defaultValue="now" className={'radio-group'}
                                value={data.publishType}
                                onChange={(e) => {
                                    setData(prev => ({...prev, publishType: e.target.value}))
                                    if(e.target.value === 'now'){
                                        setData(prev => ({...prev, publishDate: null, publishTime: null}))
                                    }
                                }}
                            >
                                <FormControlLabel
                                    value="now"
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="Publish now"
                                />
                                <FormControlLabel
                                    value="schedule"
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="Schedule for later"
                                />
                            </RadioGroup>
                            {data.publishType === 'schedule' && (
                                <Stack marginTop={2} direction={'row'} columnGap={1}>
                                    <DatePicker format={'DD/MM/YYYY'} disablePast
                                                value={dayjs(data.publishDate, 'DD/MM/YYYY')}
                                                onChange={(date) => setData(prev => ({...prev, publishDate: date.format('DD/MM/YYYY')}))}
                                            slotProps={{
                                                textField: {
                                                    error: data.publishDate === undefined,
                                                    helperText: data.publishDate === undefined ? 'Please select a date' : ''
                                                }
                                            }}
                                    />
                                    <TimePicker format={'HH:mm'} value={dayjs(data.publishTime, 'HH:mm')} ampm={false}
                                        onChange={(time) => setData(prev => ({...prev, publishTime: time.format("HH:mm")}))}
                                                slotProps={{
                                                    textField: {
                                                        error: data.publishTime === undefined,
                                                        helperText: data.publishTime === undefined ? 'Please select a time' : ''
                                                    }
                                                }}
                                    />
                                </Stack>
                            )}
                        </Stack>
                    </Box>

                    <Box className="publish-settings__tips">
                        <h3>Check out these tips before you publish 💡</h3>
                        <NavLink to="/create-promo" className="publish-settings__tip-link">
                            Create promo codes for your event
                        </NavLink>
                        <NavLink to="/customize-order-form" className="publish-settings__tip-link">
                            Customize your order form
                        </NavLink>
                        <NavLink to="/manage-payments" className="publish-settings__tip-link">
                            Manage how you get paid
                        </NavLink>
                        <NavLink to="/set-refund-policy" className="publish-settings__tip-link">
                            Set your refund policy
                        </NavLink>
                        <NavLink to="/increase-visibility" className="publish-settings__tip-link">
                            Add this event to a collection to increase visibility
                        </NavLink>
                        <NavLink to="/safety-plan" className="publish-settings__tip-link">
                            Develop a safety plan for your event
                        </NavLink>
                    </Box>
                </Stack>
            </div>
        </div>
    );
}

export default OrganizerPublishEvent