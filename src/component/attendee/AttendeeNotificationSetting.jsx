import {Button, Checkbox, FormControlLabel, Snackbar, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {getUserData} from "../../common/Utilities.js";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {CircularProgress} from "@mui/joy";
import {useOutletContext} from "react-router-dom";
import {useTranslation} from "react-i18next";

function AttendeeNotificationSetting(){
    const {pid}  = useOutletContext()
    const [preferences, setPreferences] = useState({});
    const [open, setOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const {t} = useTranslation()

    const labels = {
        attending: {
            feature_announcement: t('attendeeNotificationSetting.attending.featureAnnouncement'),
            additional_info: t('attendeeNotificationSetting.attending.additionalInfo'),
            organizer_announces: t('attendeeNotificationSetting.attending.organizerAnnounces'),
            event_on_sales: t('attendeeNotificationSetting.attending.eventOnSales'),
            liked_events: t('attendeeNotificationSetting.attending.likedEvents'),
        },
        organizing: {
            feature_announcement: t('attendeeNotificationSetting.organizing.featureAnnouncement'),
            event_sales_recap: t('attendeeNotificationSetting.organizing.eventSalesRecap'),
            important_reminders: t('attendeeNotificationSetting.organizing.importantReminders'),
            order_confirmations: t('attendeeNotificationSetting.organizing.orderConfirmations'),
        },
    };

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
            <Typography variant="h5" fontWeight={'bold'} fontSize={'1.75rem'}>{t('attendeeNotificationSetting.emailPreferences')}</Typography>
            <hr style={{ marginBlock: '.5rem 1rem' }} />
            {getUserData('role') === 'ATTENDEE' &&
                <Stack rowGap={2}>
                    <Stack>
                        <Typography variant="h6" fontWeight={'bold'} fontSize={'1.4rem'}>{t('attendeeNotificationSetting.attendingEvents')}</Typography>
                        <Typography variant="body2" className="email-preferences__subtitle">{t('attendeeNotificationSetting.attendingEventsDescription')}</Typography>
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
                        <Typography variant="h6" fontWeight={'bold'} fontSize={'1.4rem'}>{t('attendeeNotificationSetting.organizingEvents')}</Typography>
                        <Typography variant="body2" className="email-preferences__subtitle">{t('attendeeNotificationSetting.organizingEventsDescription')}</Typography>
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

            <Button variant="contained" className="email-preferences__save-btn" sx={{ marginTop: 2, paddingBlock: 1 }}
                    onClick={updatePreferences}
                    disabled={isLoading}
            >
                {isLoading ? <CircularProgress size={'sm'} /> : t('attendeeNotificationSetting.savePreferences')}
            </Button>

            <Snackbar
                open={open}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                autoHideDuration={5000}
                onClose={() => setOpen(false)}
                message={t('attendeeNotificationSetting.preferencesUpdated')}
            />
        </Stack>
    );
}

export default AttendeeNotificationSetting;