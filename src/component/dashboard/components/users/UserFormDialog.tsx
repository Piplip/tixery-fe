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
import {getDownloadURL, getStorage, ref} from 'firebase/storage';
import {useTranslation} from "react-i18next";
import Paper from "@mui/material/Paper";

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

interface OrganizerNotifyPreferences {
    feature_announcement: boolean;
    event_sales_recap: boolean;
    important_reminders: boolean;
    order_confirmations: boolean;
}

interface AttendeeNotifyPreferences {
    feature_announcement: boolean;
    organizer_announces: boolean;
    event_on_sales: boolean;
    liked_events: boolean;
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
    notify_preferences?: string | OrganizerNotifyPreferences | AttendeeNotifyPreferences;
    authorities?: string;
}
interface UserAuthorities {
    host?: {
        event_management: boolean;
        ticket_management: boolean;
        attendee_management: boolean;
        financial_management: boolean;
        analytics_access: boolean;
    };
    attendee?: {
        comment_post: boolean;
        review_create: boolean;
        ticket_transfer: boolean;
        refund_request: boolean;
    };
}

interface UserFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (data: UserFormData) => void;
    user?: any | null;
}

export default function UserFormDialog({open, onClose, onSave, user}: UserFormDialogProps) {
    const {t, i18n} = useTranslation();
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
        authorities: ''
    });
    const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>(undefined);

    const [organizerNotifyPrefs, setOrganizerNotifyPrefs] = useState<OrganizerNotifyPreferences>({
        feature_announcement: false,
        event_sales_recap: false,
        important_reminders: false,
        order_confirmations: false
    });

    const [attendeeNotifyPrefs, setAttendeeNotifyPrefs] = useState<AttendeeNotifyPreferences>({
        feature_announcement: false,
        organizer_announces: false,
        event_on_sales: false,
        liked_events: false
    });

    const [userAuthorities, setUserAuthorities] = useState<UserAuthorities>({
        host: {
            event_management: true,
            ticket_management: true,
            attendee_management: true,
            financial_management: true,
            analytics_access: true,
        },
        attendee: {
            comment_post: true,
            review_create: true,
            ticket_transfer: true,
            refund_request: true,
        }
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
            if (user.notify_preferences && typeof user.notify_preferences === 'string') {
                try {
                    const parsedPrefs = JSON.parse(user.notify_preferences);

                    if (user.role_name === 'HOST') {
                        setOrganizerNotifyPrefs({
                            feature_announcement: Boolean(parsedPrefs.feature_announcement),
                            event_sales_recap: Boolean(parsedPrefs.event_sales_recap),
                            important_reminders: Boolean(parsedPrefs.important_reminders),
                            order_confirmations: Boolean(parsedPrefs.order_confirmations || false)
                        });
                    } else if (user.role_name === 'ATTENDEE') {
                        setAttendeeNotifyPrefs({
                            feature_announcement: Boolean(parsedPrefs.feature_announcement),
                            organizer_announces: Boolean(parsedPrefs.organizer_announces),
                            event_on_sales: Boolean(parsedPrefs.event_on_sales),
                            liked_events: Boolean(parsedPrefs.liked_events)
                        });
                    }
                } catch (e) {
                    console.error("Error parsing notify preferences", e);
                }
            }

            if (user.authorities && typeof user.authorities === 'string') {
                const authList = user.authorities.split(',');

                if (user.role_name === 'HOST') {
                    setUserAuthorities({
                        host: {
                            event_management: authList.includes('EVENT_MANAGEMENT'),
                            ticket_management: authList.includes('TICKET_MANAGEMENT'),
                            attendee_management: authList.includes('ATTENDEE_MANAGEMENT'),
                            financial_management: authList.includes('FINANCIAL_MANAGEMENT'),
                            analytics_access: authList.includes('ANALYTICS_ACCESS'),
                        },
                        attendee: {
                            comment_post: true,
                            review_create: true,
                            ticket_transfer: true,
                            refund_request: true,
                        }
                    });
                } else if (user.role_name === 'ATTENDEE') {
                    setUserAuthorities({
                        host: {
                            event_management: true,
                            ticket_management: true,
                            attendee_management: true,
                            financial_management: true,
                            analytics_access: true,
                        },
                        attendee: {
                            comment_post: authList.includes('COMMENT_POST'),
                            review_create: authList.includes('REVIEW_CREATE'),
                            ticket_transfer: authList.includes('TICKET_TRANSFER'),
                            refund_request: authList.includes('REFUND_REQUEST'),
                        }
                    });
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
                authorities: user.authorities || '',
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
                authorities: '',
            });

            setOrganizerNotifyPrefs({
                feature_announcement: false,
                event_sales_recap: false,
                important_reminders: false,
                order_confirmations: false
            });

            setAttendeeNotifyPrefs({
                feature_announcement: false,
                organizer_announces: false,
                event_on_sales: false,
                liked_events: false
            });

            setUserAuthorities({
                host: {
                    event_management: true,
                    ticket_management: true,
                    attendee_management: true,
                    financial_management: true,
                    analytics_access: true,
                },
                attendee: {
                    comment_post: true,
                    review_create: true,
                    ticket_transfer: true,
                    refund_request: true,
                }
            });
        }

        setTabValue(0);
    }, [user, open]);;

    useEffect(() => {
        setTabValue(0);
    }, [formData.role_name]);

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

    const handleHostAuthorityChange = (field: keyof typeof userAuthorities.host) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setUserAuthorities(prev => ({
            ...prev,
            host: {
                ...prev.host!,
                [field]: event.target.checked
            }
        }));

        setFormData(prev => ({
            ...prev,
            authorities: JSON.stringify({
                ...userAuthorities,
                host: {
                    ...userAuthorities.host!,
                    [field]: event.target.checked
                }
            })
        }));
    };

    const handleAttendeeAuthorityChange = (field: keyof typeof userAuthorities.attendee) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setUserAuthorities(prev => ({
            ...prev,
            attendee: {
                ...prev.attendee!,
                [field]: event.target.checked
            }
        }));

        setFormData(prev => ({
            ...prev,
            authorities: JSON.stringify({
                ...userAuthorities,
                attendee: {
                    ...userAuthorities.attendee!,
                    [field]: event.target.checked
                }
            })
        }));
    };

    const handleSwitchChange = (field: string) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.checked ? 1 : 0;
        setFormData((prev) => ({...prev, [field]: value}));
    };

    const handleOrganizerNotifyPrefChange = (field: keyof OrganizerNotifyPreferences) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedPrefs = {
            ...organizerNotifyPrefs,
            [field]: event.target.checked
        };

        setOrganizerNotifyPrefs(updatedPrefs);
        setFormData((prev) => ({
            ...prev,
            notify_preferences: JSON.stringify(updatedPrefs)
        }));
    };

    const handleAttendeeNotifyPrefChange = (field: keyof AttendeeNotifyPreferences) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const updatedPrefs = {
            ...attendeeNotifyPrefs,
            [field]: event.target.checked
        };

        setAttendeeNotifyPrefs(updatedPrefs);
        setFormData((prev) => ({
            ...prev,
            notify_preferences: JSON.stringify(updatedPrefs)
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        let authorityString = '';

        if (formData.role_name === 'HOST') {
            authorityString = Object.entries(userAuthorities.host || {})
                .filter(([_, isEnabled]) => isEnabled)
                .map(([key]) => key.toUpperCase())
                .join(',');
        } else if (formData.role_name === 'ATTENDEE') {
            authorityString = Object.entries(userAuthorities.attendee || {})
                .filter(([_, isEnabled]) => isEnabled)
                .map(([key]) => key.toUpperCase())
                .join(',');
        }

        const finalData = {
            ...formData,
            authorities: authorityString
        };

        console.log('Submitting:', finalData);
        onSave(finalData);
    };

    const isOrganizer = formData.role_name === 'HOST';
    const isAttendee = formData.role_name === 'ATTENDEE';
    const showNotifyPrefs = isOrganizer || isAttendee;

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
                        {showNotifyPrefs && <Tab label={t('userFormDialog.notificationPrefs')} id="user-tab-2"/>}
                    </Tabs>

                    {(isOrganizer || isAttendee) && (
                        <TabPanel value={tabValue} index={isOrganizer ? 2 : 1}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('userFormDialog.manageUserAuthorities')}
                            </Typography>

                            {isOrganizer && (
                                <>
                                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                        {t('userFormDialog.hostPrivileges')}
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.host?.event_management || false}
                                                            onChange={handleHostAuthorityChange('event_management')}
                                                        />
                                                    }
                                                    label={t('authorities.host.eventManagement')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.host.eventManagementDesc')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.host?.ticket_management || false}
                                                            onChange={handleHostAuthorityChange('ticket_management')}
                                                        />
                                                    }
                                                    label={t('authorities.host.ticketManagement')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.host.ticketManagementDesc')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.host?.attendee_management || false}
                                                            onChange={handleHostAuthorityChange('attendee_management')}
                                                        />
                                                    }
                                                    label={t('authorities.host.attendeeManagement')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.host.attendeeManagementDesc')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.host?.financial_management || false}
                                                            onChange={handleHostAuthorityChange('financial_management')}
                                                        />
                                                    }
                                                    label={t('authorities.host.financialManagement')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.host.financialManagementDesc')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.host?.analytics_access || false}
                                                            onChange={handleHostAuthorityChange('analytics_access')}
                                                        />
                                                    }
                                                    label={t('authorities.host.analyticsAccess')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.host.analyticsAccessDesc')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </>
                            )}

                            {isAttendee && (
                                <>
                                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                                        {t('userFormDialog.attendeePrivileges')}
                                    </Typography>
                                    <Paper variant="outlined" sx={{ p: 2 }}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.attendee?.comment_post || false}
                                                            onChange={handleAttendeeAuthorityChange('comment_post')}
                                                        />
                                                    }
                                                    label={t('authorities.attendee.commentPost')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.attendee.commentPostDesc')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.attendee?.review_create || false}
                                                            onChange={handleAttendeeAuthorityChange('review_create')}
                                                        />
                                                    }
                                                    label={t('authorities.attendee.reviewCreate')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.attendee.reviewCreateDesc')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.attendee?.ticket_transfer || false}
                                                            onChange={handleAttendeeAuthorityChange('ticket_transfer')}
                                                        />
                                                    }
                                                    label={t('authorities.attendee.ticketTransfer')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.attendee.ticketTransferDesc')}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={userAuthorities.attendee?.refund_request || false}
                                                            onChange={handleAttendeeAuthorityChange('refund_request')}
                                                        />
                                                    }
                                                    label={t('authorities.attendee.refundRequest')}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4 }}>
                                                    {t('authorities.attendee.refundRequestDesc')}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </>
                            )}
                        </TabPanel>
                    )}

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
                                                <Typography variant="body2"
                                                            color="text.secondary">{t('userFormDialog.totalAttendees')}</Typography>
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
                                                <Typography variant="body2"
                                                            color="text.secondary">{t('userFormDialog.eventsHosted')}</Typography>
                                                <Typography
                                                    variant="h6">{formData.total_event_hosted?.toLocaleString() || "0"}</Typography>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </TabPanel>
                    )}

                    {showNotifyPrefs && (
                        <TabPanel value={tabValue} index={isOrganizer ? 2 : 1}>
                            <Typography variant="subtitle1" gutterBottom>
                                {t('userFormDialog.emailNotificationPreferences')}
                            </Typography>

                            {isAttendee && (
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={attendeeNotifyPrefs.feature_announcement}
                                                onChange={handleAttendeeNotifyPrefChange('feature_announcement')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.attending.featureAnnouncement')}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={attendeeNotifyPrefs.organizer_announces}
                                                onChange={handleAttendeeNotifyPrefChange('organizer_announces')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.attending.organizerAnnounces')}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={attendeeNotifyPrefs.event_on_sales}
                                                onChange={handleAttendeeNotifyPrefChange('event_on_sales')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.attending.eventOnSales')}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={attendeeNotifyPrefs.liked_events}
                                                onChange={handleAttendeeNotifyPrefChange('liked_events')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.attending.likedEvents')}
                                    />
                                </Stack>
                            )}

                            {isOrganizer && (
                                <Stack spacing={2}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={organizerNotifyPrefs.feature_announcement}
                                                onChange={handleOrganizerNotifyPrefChange('feature_announcement')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.organizing.featureAnnouncement')}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={organizerNotifyPrefs.event_sales_recap}
                                                onChange={handleOrganizerNotifyPrefChange('event_sales_recap')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.organizing.eventSalesRecap')}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={organizerNotifyPrefs.important_reminders}
                                                onChange={handleOrganizerNotifyPrefChange('important_reminders')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.organizing.importantReminders')}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={organizerNotifyPrefs.order_confirmations}
                                                onChange={handleOrganizerNotifyPrefChange('order_confirmations')}
                                            />
                                        }
                                        label={t('attendeeNotificationSetting.organizing.orderConfirmations')}
                                    />
                                </Stack>
                            )}
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