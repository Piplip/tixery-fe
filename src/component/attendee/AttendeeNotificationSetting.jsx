import {Button, Checkbox, FormControlLabel, Snackbar, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {getUserData} from "../../common/Utilities.js";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {CircularProgress} from "@mui/joy";
import {useOutletContext} from "react-router-dom";

const labels = {
    attending: {
        feature_announcement: "Updates about new Eventbrite features and announcements",
        additional_info: "Requests for additional information on an event after you have attended",
        organizer_announces: "When an organizer you follow announces a new event",
        event_on_sales: "Reminders about event onsales",
        liked_events: "Reminders about events I’ve liked",
    },
    organizing: {
        feature_announcement: "Updates about new Eventbrite features and announcements",
        event_sales_recap: "Event Sales Recap",
        important_reminders: "Important reminders for my next event",
        order_confirmations: "Order confirmations from my attendees",
    },
};

function AttendeeNotificationSetting(){
    const {pid}  = useOutletContext()
    const [preferences, setPreferences] = useState({});
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (section, key) => {
        setPreferences((prev) => ({
            ...prev,
            [section]: {
                ...prev[section], [key]: !prev[section][key],
            },
        }));
    };

    useEffect(() => {
        if(preferences.attending === undefined){
            accountAxiosWithToken.get(`/notification/preferences?pid=${pid}`)
                .then(r => {
                    console.log(r.data)
                    setPreferences(prev => ({
                        ...prev,
                        attending: {
                            feature_announcement: r.data.feature_announcement,
                            additional_info: r.data.additional_info,
                            organizer_announces: r.data.organizer_announces,
                            event_on_sales: r.data.event_on_sales,
                            liked_events: r.data.liked_events,
                        },
                        organizing: {
                            feature_announcement: r.data.feature_announcement,
                            event_sales_recap: r.data.event_sales_recap,
                            important_reminders: r.data.important_reminders,
                            order_confirmations: r.data.order_confirmations,
                        }
                    }))
                })
                .catch(err => console.log(err))
        }
    }, [pid]);

    function updatePreferences(){
        setIsLoading(true)
        accountAxiosWithToken.post(`/notification/preferences/update?pid=${getUserData('profileID')}&role=${getUserData('role') === 'ATTENDEE' ? 'ATTENDEE' : 'HOST'}`,
            getUserData('role') === 'ATTENDEE' ? preferences.attending : preferences.organizing)
            .then(r => {
                setIsLoading(false)
                setOpen(true)
            })
            .catch(err => console.log(err))
    }

    return (
        <Stack className="email-preferences" rowGap={1}>
            <Typography variant="h5" fontWeight={'bold'} fontSize={'1.75rem'}>Email Preferences</Typography>
            <hr style={{marginBlock: '.5rem 1rem'}}/>
            {getUserData('role') === 'ATTENDEE' &&
                <Stack rowGap={2}>
                    <Stack>
                        <Typography variant="h6" fontWeight={'bold'} fontSize={'1.4rem'}>Attending Events</Typography>
                        <Typography variant="body2" className="email-preferences__subtitle">News and updates about events created by event organizers</Typography>
                    </Stack>

                    <Stack className="email-preferences__options">
                        {preferences?.attending && Object.keys(preferences.attending).map((key) => (
                            <FormControlLabel
                                key={key}
                                control={<Checkbox checked={preferences.attending[key]} onChange={() => handleChange("attending", key)} />}
                                label={labels.attending[key]}
                            />
                        ))}
                    </Stack>
                </Stack>
            }

            {getUserData('role') === 'HOST' &&
                <Stack rowGap={2}>
                    <Stack>
                        <Typography variant="h6" fontWeight={'bold'} fontSize={'1.4rem'}>Organizing Events</Typography>
                        <Typography variant="body2" className="email-preferences__subtitle">Helpful updates and tips for organizing events on Eventbrite</Typography>
                    </Stack>

                    <Stack>
                        {preferences?.organizing && Object.keys(preferences.organizing).map((key) => (
                            <FormControlLabel
                                key={key}
                                control={<Checkbox checked={preferences.organizing[key]} onChange={() => handleChange("organizing", key)} />}
                                label={labels.organizing[key]}
                            />
                        ))}
                    </Stack>
                </Stack>
            }

            <Button variant="contained" className="email-preferences__save-btn" sx={{marginTop: 2, paddingBlock: 1}}
                onClick={updatePreferences}
            >
                {isLoading ? <CircularProgress size={'sm'} /> : 'Save Preferences'}
            </Button>

            <Snackbar
                open={open}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                autoHideDuration={5000}
                onClose={() => setOpen(false)}
                message="Preferences updated successfully"
            />
        </Stack>
    );
}

export default AttendeeNotificationSetting;