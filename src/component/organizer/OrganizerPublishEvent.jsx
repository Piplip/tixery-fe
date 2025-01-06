import {Box, Checkbox, FormControlLabel, Stack, TextField, Typography} from "@mui/material";
import {Link, NavLink} from "react-router-dom";
import ImageIcon from '@mui/icons-material/Image';
import "../../styles/organizer-publish-event-styles.css"
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {Radio, RadioGroup} from "@mui/joy";
import {useState} from "react";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import PropTypes from "prop-types";
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

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

function OrganizerPublishEvent(){
    const [refundDays, setRefundDays] = useState(7);

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
                            <div className="event-publish__image">
                                <ImageIcon className="event-publish__image-icon" sx={{fontSize: '3rem'}}/>
                            </div>
                            <div className="event-publish__details">
                                <p className="event-publish__title">Foo</p>
                                <p className="event-publish__datetime">
                                    Saturday, February 15 • 8 - 10am GMT+7
                                </p>
                                <p className="event-publish__online">Online event</p>
                                <Stack direction={'row'} justifyContent={'space-between'}>
                                    <div className="event-publish__info">
                                        <span><BookOnlineIcon/> $5.23</span>
                                        <span><PersonIcon/> 500</span>
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
                                disabled={false}
                                placeholder="Organizer"
                                size="md"
                                variant="soft"
                            >
                                <Option value={''}>...</Option>
                            </Select>
                            <p className="event-publish__organizer-info">
                                Your event will appear on this organizer&#39;s profile page.
                            </p>
                            <Link to="/organizer-info" className="event-publish__organizer-link">
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
                                >
                                    <Option value={''}>...</Option>
                                </Select>
                                <Stack direction={'row'} columnGap={2}>
                                    <Select sx={{width: '100%'}}
                                        color="neutral"
                                        disabled={false}
                                        placeholder="Catergory"
                                            size="md"
                                        variant="soft"
                                    >
                                        <Option value={''}>...</Option>
                                    </Select>
                                    <Select sx={{width: '100%'}}
                                        color="neutral"
                                        disabled={false}
                                        placeholder="Sub category"
                                        size="md"
                                        variant="soft"
                                    >
                                        <Option value={''}>...</Option>
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
                                multiline
                                rows={4}
                                placeholder="Add search keywords to your event"
                                variant="outlined"
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
                                        control={<Radio sx={{marginRight: 1}}/>}
                                        label="Public"
                                    />
                                    <p className="publish-settings__description">
                                        Shared only with a select audience
                                    </p>
                                </Stack>
                                <Stack>
                                    <FormControlLabel
                                        value="private"
                                        control={<Radio sx={{marginRight: 1}}/>}
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
                            <RadioGroup name="refundPolicy" defaultValue="allowRefunds" className={'radio-group'}>
                                <FormControlLabel
                                    value="allowRefunds"
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="Allow refunds"
                                />
                                <FormControlLabel
                                    value="noRefunds"
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="Don't allow refunds"
                                />
                            </RadioGroup>
                            <Stack rowGap={.5} marginTop={2}>
                                <TextField
                                    className="publish-settings__input"
                                    type="number"
                                    value={refundDays}
                                    onChange={(e) => setRefundDays(e.target.value)}
                                    label="Days before the event"
                                    inputProps={{min: 1, max: 30}}
                                />
                                <p className="publish-settings__description">
                                    Set how many days (1 to 30) before the event that attendees can request refunds.
                                </p>
                            </Stack>
                        </Stack>

                        {/* Automated Refunds */}
                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>Automate refunds</h3>
                            <p className="publish-settings__description">
                                Automatically approve refund requests for orders of one ticket if the event balance can
                                cover the request. If turned off, you must respond to all refund requests within five
                                days.
                            </p>
                            <RadioGroup name="automateRefunds" defaultValue="manual" className={'radio-group'}>
                                <FormControlLabel
                                    value="auto"
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="Yes, automate refunds"
                                />
                                <FormControlLabel
                                    value="manual"
                                    control={<Radio sx={{marginRight: 1}}/>}
                                    label="No, I'll respond to each request"
                                />
                            </RadioGroup>
                        </Stack>

                        {/* Publish Timing */}
                        <Stack className="publish-settings__section" rowGap={1}>
                            <h3>When should we publish your event?</h3>
                            <RadioGroup name="publishTiming" defaultValue="now" className={'radio-group'}>
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