import * as React from 'react';
import {useEffect, useState} from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import * as dayjs from 'dayjs';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import PersonIcon from '@mui/icons-material/Person';
import Tooltip from '@mui/material/Tooltip';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import viLocale from 'i18n-iso-countries/langs/vi.json';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import i18n from "i18next";
import {useTranslation} from "react-i18next";

countries.registerLocale(enLocale);
countries.registerLocale(viLocale);

const statuses = ['VERIFIED', 'PENDING', 'DISABLED'];
const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`user-tabpanel-${index}`}
            aria-labelledby={`user-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{pt: 2}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface NotifyPreferences {
    feature_announcement: boolean;
    event_sales_recap: boolean;
    important_reminders: boolean;
    order_confirmations: boolean;
}

interface UserFormData {
    account_id?: number;
    account_email: string;
    role_name: string;
    full_name: string;
    date_of_birth: string | null;
    gender: string;
    phone_number: string;
    nationality: string;
    account_status: string;
    profile_id?: number;
    user_data_id?: number;
    profile_name?: string;
    description?: string;
    profile_image_url?: string | null;
    email_opt_in?: number;
    social_media_links?: any;
    custom_url?: string | null;
    total_followers?: number;
    total_attendee_hosted?: number;
    total_event_hosted?: number;
    notify_preferences?: string | NotifyPreferences;
}

interface UserFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: UserFormData) => void;
    user?: any | null;
}

export default function UserFormDialog({open, onClose, onSave, user}: UserFormDialogProps) {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState<UserFormData>({
        account_email: '',
        role_name: 'ATTENDEE',
        full_name: '',
        date_of_birth: null,
        gender: 'Prefer not to say',
        phone_number: '',
        nationality: 'US',
        account_status: 'VERIFIED',
        profile_name: '',
        description: '',
        email_opt_in: 0,
    });
    const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

    const [notifyPrefs, setNotifyPrefs] = useState<NotifyPreferences>({
        feature_announcement: false,
        event_sales_recap: false,
        important_reminders: false,
        order_confirmations: false
    });

    useEffect(() => {
        const loadProfileImage = async () => {
            if (formData.profile_image_url) {
                try {
                    if (formData.profile_image_url.startsWith('gs://') ||
                        formData.profile_image_url.includes('firebase')) {
                        const storage = getStorage();
                        const imageRef = ref(storage, formData.profile_image_url);
                        const url = await getDownloadURL(imageRef);
                        setProfileImageUrl(url);
                    } else {
                        setProfileImageUrl(formData.profile_image_url);
                    }
                } catch (error) {
                    setProfileImageUrl(undefined);
                }
            } else {
                setProfileImageUrl(undefined);
            }
        };

        loadProfileImage();
    }, [formData.profile_image_url]);

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (user) {
            let parsedNotifyPrefs = notifyPrefs;
            if (user.notify_preferences && typeof user.notify_preferences === 'string') {
                try {
                    parsedNotifyPrefs = JSON.parse(user.notify_preferences);
                    setNotifyPrefs(parsedNotifyPrefs);
                } catch (e) {
                    console.error("Error parsing notify preferences", e);
                }
            }

            setFormData({
                account_id: user.account_id,
                profile_id: user.profile_id,
                user_data_id: user.user_data_id,
                account_email: user.account_email || '',
                role_name: user.role_name || 'ATTENDEE',
                full_name: user.full_name || '',
                date_of_birth: user.date_of_birth || null,
                gender: user.gender || 'Prefer not to say',
                phone_number: user.phone_number || '',
                nationality: user.nationality || 'US',
                account_status: user.account_status || 'VERIFIED',

                profile_name: user.profile_name || '',
                description: user.description || '',
                profile_image_url: user.profile_image_url,
                email_opt_in: user.email_opt_in || 0,
                social_media_links: user.social_media_links,
                custom_url: user.custom_url,
                total_followers: user.total_followers,
                total_attendee_hosted: user.total_attendee_hosted,
                total_event_hosted: user.total_event_hosted,
                notify_preferences: user.notify_preferences,
            });
        } else {
            setFormData({
                account_email: '',
                role_name: 'ATTENDEE',
                full_name: '',
                date_of_birth: null,
                gender: 'Prefer not to say',
                phone_number: '',
                nationality: 'US',
                account_status: 'VERIFIED',
                profile_name: '',
                description: '',
                email_opt_in: 0,
            });

            setNotifyPrefs({
                feature_announcement: false,
                event_sales_recap: false,
                important_reminders: false,
                order_confirmations: false
            });
        }

        setTabValue(0);
    }, [user, open]);

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleChange = (field: string) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const value = event.target.value;
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleSelectChange = (field: string) => (
        event: SelectChangeEvent<string>
    ) => {
        const value = event.target.value;
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleDateChange = (date: any) => {
        setFormData((prev) => ({
            ...prev,
            date_of_birth: date ? date.format('YYYY-MM-DD') : null
        }));
    };

    const handleSwitchChange = (field: string) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.checked ? 1 : 0;
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleNotifyPrefChange = (field: keyof NotifyPreferences) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedPrefs = {
            ...notifyPrefs,
            [field]: event.target.checked
        };

        setNotifyPrefs(updatedPrefs);
        setFormData((prev) => ({
            ...prev,
            notify_preferences: JSON.stringify(updatedPrefs)
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        onSave(formData);
    };

    const isOrganizer = formData.role_name === 'HOST';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>
                    {user ? t('userFormDialog.editUser') : t('userFormDialog.addNewUser')}
                </DialogTitle>
                <DialogContent>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="user form tabs">
                        <Tab label={t('userFormDialog.basicInfo')} id="user-tab-0"/>
                        {isOrganizer && <Tab label={t('userFormDialog.organizerProfile')} id="user-tab-1"/>}
                        {isOrganizer && <Tab label={t('userFormDialog.notificationPrefs')} id="user-tab-2"/>}
                    </Tabs>

                    <TabPanel value={tabValue} index={0}>
                        <Stack spacing={3}>
                            <TextField
                                label={t('userFormDialog.email')}
                                type="email"
                                value={formData.account_email}
                                onChange={handleChange('account_email')}
                                required
                                fullWidth
                            />

                            <TextField
                                label={t('userFormDialog.fullName')}
                                value={formData.full_name}
                                onChange={handleChange('full_name')}
                                required
                                fullWidth
                            />

                            <FormControl fullWidth>
                                <InputLabel>{t('userFormDialog.role')}</InputLabel>
                                <Select
                                    value={formData.role_name}
                                    label={t('userFormDialog.role')}
                                    onChange={handleSelectChange('role_name')}
                                >
                                    <MenuItem value="ATTENDEE">{t('userFormDialog.attendee')}</MenuItem>
                                    <MenuItem value="HOST">{t('userFormDialog.host')}</MenuItem>
                                    <MenuItem value="ADMIN">{t('userFormDialog.admin')}</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>{t('userFormDialog.status')}</InputLabel>
                                <Select
                                    value={formData.account_status}
                                    label={t('userFormDialog.status')}
                                    onChange={handleSelectChange('account_status')}
                                >
                                    {statuses.map((status) => (
                                        <MenuItem key={status} value={status}>
                                            {t(`userFormDialog.statusValue.${status.toLowerCase()}`)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    label={t('userFormDialog.dob')}
                                    format={"DD/MM/YYYY"}
                                    value={formData.date_of_birth ? dayjs.default(formData.date_of_birth) : null}
                                    onChange={handleDateChange}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            variant: 'outlined'
                                        }
                                    }}
                                />
                            </LocalizationProvider>

                            <FormControl fullWidth>
                                <InputLabel>{t('userFormDialog.gender')}</InputLabel>
                                <Select
                                    value={formData.gender}
                                    label={t('userFormDialog.gender')}
                                    onChange={handleSelectChange('gender')}
                                >
                                    {genders.map((gender) => (
                                        <MenuItem key={gender} value={gender}>
                                            {t(`userFormDialog.genderValue.${gender.toLowerCase().replace(/ /g, '')}`)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                label={t('userFormDialog.phoneNumber')}
                                value={formData.phone_number}
                                onChange={handleChange('phone_number')}
                                fullWidth
                            />

                            <FormControl fullWidth>
                                <InputLabel>{t('userFormDialog.nationality')}</InputLabel>
                                <Select
                                    value={formData.nationality}
                                    label={t('userFormDialog.nationality')}
                                    onChange={handleSelectChange('nationality')}
                                >
                                    {Object.entries(countries.getNames(i18n.language?.split('-')[0]) || countries.getNames('en'))
                                        .sort((a, b) => a[1].localeCompare(b[1]))
                                        .map(([code, name]) => (
                                            <MenuItem key={code} value={code}>
                                                {name} ({code})
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                        </Stack>
                    </TabPanel>

                    {isOrganizer && (
                        <TabPanel value={tabValue} index={1}>
                            <Stack rowGap={1}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={3}>
                                        <Box display="flex" flexDirection="column" alignItems="center">
                                            <Avatar
                                                src={profileImageUrl}
                                                sx={{width: 100, height: 100, mb: 1}}
                                            >
                                                <PersonIcon fontSize="large"/>
                                            </Avatar>
                                            <Typography variant="caption" color="text.secondary">
                                                {t('userFormDialog.profileImage')}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} md={9}>
                                        <Stack spacing={2}>
                                            <TextField
                                                label={t('userFormDialog.profileName')}
                                                value={formData.profile_name || ''}
                                                onChange={handleChange('profile_name')}
                                                required={isOrganizer}
                                                fullWidth
                                            />

                                            <TextField
                                                label={t('userFormDialog.customURL')}
                                                value={formData.custom_url || ''}
                                                onChange={handleChange('custom_url')}
                                                fullWidth
                                            />

                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={Boolean(formData.email_opt_in)}
                                                        onChange={handleSwitchChange('email_opt_in')}
                                                    />
                                                }
                                                label={t('userFormDialog.emailOptIn')}
                                            />
                                        </Stack>
                                    </Grid>
                                </Grid>

                                <TextField
                                    label={t('userFormDialog.description')}
                                    value={formData.description || ''}
                                    onChange={handleChange('description')}
                                    multiline
                                    fullWidth
                                />

                                <Divider/>

                                <Typography variant="subtitle1">{t('userFormDialog.statistics')}</Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={4}>
                                        <Tooltip title={t('userFormDialog.followersTooltip')}>
                                            <Box sx={{
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1
                                            }}>
                                                <Typography variant="body2"
                                                            color="text.secondary">{t('userFormDialog.followers')}</Typography>
                                                <Typography
                                                    variant="h6">{formData.total_followers?.toLocaleString() || "0"}</Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Tooltip title={t('userFormDialog.totalAttendeesTooltip')}>
                                            <Box sx={{
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1
                                            }}>
                                                <Typography variant="body2" color="text.secondary">{t('userFormDialog.totalAttendees')}</Typography>
                                                <Typography
                                                    variant="h6">{formData.total_attendee_hosted?.toLocaleString() || "0"}</Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Tooltip title={t('userFormDialog.totalEventsTooltip')}>
                                            <Box sx={{
                                                p: 2,
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                borderRadius: 1
                                            }}>
                                                <Typography variant="body2" color="text.secondary">{t('userFormDialog.eventsHosted')}</Typography>
                                                <Typography
                                                    variant="h6">{formData.total_event_hosted?.toLocaleString() || "0"}</Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </TabPanel>
                    )}

                    {isOrganizer && (
                        <TabPanel value={tabValue} index={2}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('userFormDialog.emailNotificationPreferences')}
                            </Typography>
                            <Stack spacing={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifyPrefs.feature_announcement}
                                            onChange={handleNotifyPrefChange('feature_announcement')}
                                        />
                                    }
                                    label={t('userFormDialog.featureAnnouncements')}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifyPrefs.event_sales_recap}
                                            onChange={handleNotifyPrefChange('event_sales_recap')}
                                        />
                                    }
                                    label={t('userFormDialog.eventSalesRecap')}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifyPrefs.important_reminders}
                                            onChange={handleNotifyPrefChange('important_reminders')}
                                        />
                                    }
                                    label={t('userFormDialog.importantReminders')}
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={notifyPrefs.order_confirmations}
                                            onChange={handleNotifyPrefChange('order_confirmations')}
                                        />
                                    }
                                    label={t('userFormDialog.orderConfirmations')}
                                />
                            </Stack>
                        </TabPanel>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t('userFormDialog.cancel')}</Button>
                    <Button type="submit" variant="contained">
                        {user ? t('userFormDialog.update') : t('userFormDialog.create')}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}