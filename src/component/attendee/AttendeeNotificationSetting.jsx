import {Button, Checkbox, FormControlLabel, Stack, Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {getUserData} from "../../common/Utilities.js";
import {accountAxiosWithToken} from "../../config/axiosConfig.js";
import {CircularProgress} from "@mui/joy";
import {useOutletContext} from "react-router-dom";
import {useTranslation} from "react-i18next";
import {useAlert} from "../../custom-hooks/useAlert.js";

function AttendeeNotificationSetting(){
    const {pid} = useOutletContext()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const {t} = useTranslation()
    const {showInfo} = useAlert()

    const [preferences, setPreferences] = useState({
        attending: {
            feature_announcement: false,
            organizer_announces: false,
            event_on_sales: false,
            liked_events: false,
        },
        organizing: {
            feature_announcement: false,
            event_sales_recap: false,
            important_reminders: false,
        }
    });

    const labels = {
        attending: {
            feature_announcement: t('attendeeNotificationSetting.attending.featureAnnouncement'),
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
        accountAxiosWithToken.get(`/notification/preferences?pid=${pid}`)
            .then(r => {
                const responseData = r.data || {};

                setPreferences({
                    attending: {
                        feature_announcement: Boolean(responseData.feature_announcement === true),
                        organizer_announces: Boolean(responseData.organizer_announces === true),
                        event_on_sales: Boolean(responseData.event_on_sales === true),
                        liked_events: Boolean(responseData.liked_events === true),
                    },
                    organizing: {
                        feature_announcement: Boolean(responseData.feature_announcement === true),
                        event_sales_recap: Boolean(responseData.event_sales_recap === true),
                        important_reminders: Boolean(responseData.important_reminders === true),
                    }
                });
                setIsLoading(false);
            })
            .catch(err => {
                console.log(err);
                setIsLoading(false);
            });
    }, [pid]);

    function updatePreferences(){
        setIsSaving(true);
        const userRole = getUserData('role');

        const preferencesToSend = userRole === 'ATTENDEE'
            ? preferences.attending
            : preferences.organizing;

        accountAxiosWithToken.post(
            `/notification/preferences/update?pid=${getUserData('profileID')}&role=${userRole}`,
            preferencesToSend
        )
            .then(() => {
                setIsSaving(false);
                showInfo(t('attendeeNotificationSetting.preferencesUpdated'))
            })
            .catch(err => {
                console.log(err);
                setIsSaving(false);
            });
    }

    if (isLoading) {
        return <Stack alignItems="center" padding={4}><CircularProgress /></Stack>;
    }

    return (
        <Stack className="email-preferences" rowGap={1}>
            <Typography variant="h5" fontWeight={'bold'} fontSize={'1.75rem'}>{t('attendeeNotificationSetting.emailPreferences')}</Typography>
            <hr style={{ marginBlock: '.5rem 1rem' }} />
            {getUserData('role') === 'ATTENDEE' ?
                <Stack rowGap={2}>
                    <Stack>
                        <Typography variant="h6" fontWeight={'bold'} fontSize={'1.4rem'}>{t('attendeeNotificationSetting.attendingEvents')}</Typography>
                        <Typography variant="body2" className="email-preferences__subtitle">{t('attendeeNotificationSetting.attendingEventsDescription')}</Typography>
                    </Stack>

                    <Stack className="email-preferences__options">
                        {Object.keys(preferences.attending).map((key) => (
                            <FormControlLabel
                                key={key}
                                control={<Checkbox checked={preferences.attending[key]} onChange={() => handleChange("attending", key)} />}
                                label={labels.attending[key]}
                            />
                        ))}
                    </Stack>
                </Stack>
                :
                <Stack rowGap={2}>
                    <Stack>
                        <Typography variant="h6" fontWeight={'bold'} fontSize={'1.4rem'}>{t('attendeeNotificationSetting.organizingEvents')}</Typography>
                        <Typography variant="body2" className="email-preferences__subtitle">{t('attendeeNotificationSetting.organizingEventsDescription')}</Typography>
                    </Stack>

                    <Stack>
                        {Object.keys(preferences.organizing).map((key) => (
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
                    disabled={isSaving}
            >
                {isSaving ? <CircularProgress size={'sm'} /> : t('attendeeNotificationSetting.savePreferences')}
            </Button>
        </Stack>
    );
}

export default AttendeeNotificationSetting;