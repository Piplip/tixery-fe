import {Box, Card, CardContent, Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as ChartTooltip,
    XAxis,
    YAxis
} from 'recharts';
import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import PropTypes from "prop-types";
import dayjs from "dayjs";
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import viLocale from 'i18n-iso-countries/langs/vi.json';
import i18n from "i18next";
import PeopleIcon from '@mui/icons-material/People';

countries.registerLocale(enLocale);
countries.registerLocale(viLocale);

AttendeeAnalytics.propTypes = {
    attendees: PropTypes.array
}

function AttendeeAnalytics({ attendees }) {
    const theme = useTheme();
    const { t } = useTranslation();

    if (!attendees || attendees.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4,
                    minHeight: '40vh',
                    textAlign: 'center',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2
                }}
            >
                <PeopleIcon sx={{ fontSize: 80, color: theme.palette.text.secondary, mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                    {t('eventAttendee.analytics.noAttendees')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '600px', mb: 3 }}>
                    {t('eventAttendee.analytics.noAttendeesMessage')}
                </Typography>
                <Typography variant="body2" sx={{ fontStyle: 'italic', maxWidth: '600px' }}>
                    {t('eventAttendee.analytics.noAttendeesAdvice')}
                </Typography>
            </Box>
        );
    }

    const calculateAge = (dob) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const uniqueAttendees = useMemo(() => {
        const uniqueMap = new Map();
        attendees.forEach(attendee => {
            if (!uniqueMap.has(attendee.profile_id)) {
                uniqueMap.set(attendee.profile_id, attendee);
            }
        });
        return Array.from(uniqueMap.values());
    }, [attendees]);

    const genderData = useMemo(() => {
        const genderCounts = uniqueAttendees.reduce((acc, attendee) => {
            const gender = attendee.gender || 'Not Specified';
            acc[gender] = (acc[gender] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(genderCounts).map(([name, value]) => ({ name, value }));
    }, [uniqueAttendees]);

    const ageData = useMemo(() => {
        const ageGroups = {
            '18-24': 0,
            '25-34': 0,
            '35-44': 0,
            '45-54': 0,
            '55+': 0,
        };

        uniqueAttendees.forEach(attendee => {
            if (!attendee.dob) {
                ageGroups['Unknown']++;
                return;
            }
            const age = calculateAge(attendee.dob);
            if (age < 18) ageGroups['18-24']++;
            else if (age <= 24) ageGroups['18-24']++;
            else if (age <= 34) ageGroups['25-34']++;
            else if (age <= 44) ageGroups['35-44']++;
            else if (age <= 54) ageGroups['45-54']++;
            else ageGroups['55+']++;
        });
        return Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
    }, [uniqueAttendees]);

    const ticketData = useMemo(() => {
        const ticketCounts = attendees.reduce((acc, attendee) => {
            const ticketKey = attendee.tier_name
                ? `${attendee.ticket_name} - ${attendee.tier_name}`
                : attendee.ticket_name;

            acc[ticketKey] = (acc[ticketKey] || 0) + attendee.ticket_count;
            return acc;
        }, {});

        return Object.entries(ticketCounts)
            .map(([name, value]) => ({ name, value }));
    }, [attendees]);

    const tierData = useMemo(() => {
        const tieredAttendees = attendees.filter(a => a.tier_name);

        if (tieredAttendees.length === 0) return [];

        const tierCounts = tieredAttendees.reduce((acc, attendee) => {
            const tierKey = `${attendee.ticket_name} - ${attendee.tier_name}`;
            acc[tierKey] = (acc[tierKey] || 0) + attendee.ticket_count;
            acc[tierKey + "_color"] = attendee.tier_color || '#cccccc';
            return acc;
        }, {});

        return Object.entries(tierCounts)
            .filter(([key]) => !key.endsWith("_color"))
            .map(([name, value]) => ({
                name,
                value,
                color: tierCounts[name + "_color"]
            }));
    }, [attendees]);

    const registrationData = useMemo(() => {
        const regByDate = attendees.reduce((acc, attendee) => {
            const date = new Date(attendee.registration_date).toLocaleDateString();
            acc[date] = (acc[date] || 0) + attendee.ticket_count;
            return acc;
        }, {});
        return Object.entries(regByDate)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [attendees]);

    const interestsData = useMemo(() => {
        const interestCategories = {};
        uniqueAttendees.forEach(attendee => {
            if (!attendee.interests) return;

            try {
                const interestStr = attendee.interests.replace(/^"|"$/g, '');
                const interests = interestStr.split(',');
                interests.forEach(interest => {
                    const parts = interest.split('-');
                    const category = parts[0];
                    if (category && category.trim()) {
                        interestCategories[category.trim()] = (interestCategories[category.trim()] || 0) + 1;
                    }
                });
            } catch (e) {
                console.error("Error parsing interests for attendee:", attendee.profile_id, e);
            }
        });

        return Object.entries(interestCategories)
            .map(([name, value]) => ({
                name: t(`event-category.${name}`, { defaultValue: name }),
                value
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [uniqueAttendees, t]);

    const nationalityData = useMemo(() => {
        const nationalityCounts = uniqueAttendees.reduce((acc, attendee) => {
            const nationality = attendee.nationality || 'Unknown';
            acc[nationality] = (acc[nationality] || 0) + 1;
            return acc;
        }, {});

        const currentLanguage = i18n.language || 'en';

        return Object.entries(nationalityCounts)
            .map(([code, value]) => ({
                name: code === 'Unknown'
                    ? t('common.unknown', { defaultValue: 'Unknown' })
                    : countries.getName(code, currentLanguage) || code,
                value
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [uniqueAttendees, i18n.language, t]);

    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.info.main,
    ];

    return (
        <Box sx={{width: "100%", backgroundColor: theme.palette.background.paper}}>
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4, justifyContent: 'center'}}>
                {[
                    {
                        label: t("eventAttendee.analytics.totalAttendees"),
                        value: uniqueAttendees.length,
                    },
                    {
                        label: t("eventAttendee.analytics.totalTickets"),
                        value: attendees.reduce((sum, a) => sum + a.ticket_count, 0),
                    },
                    {
                        label: t("eventAttendee.analytics.ticketTypes"),
                        value: new Set(attendees.map((a) => {
                            return a.tier_name
                                ? `${a.ticket_name} - ${a.tier_name}`
                                : a.ticket_name;
                        })).size,
                    },
                    {
                        label: t("eventAttendee.analytics.countries"),
                        value: new Set(
                            uniqueAttendees.map((a) => a.nationality).filter(Boolean)
                        ).size,
                    },
                ].map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            flexBasis: {
                                xs: 'calc(50% - 12px)',
                                sm: 'calc(50% - 12px)',
                                md: 'calc(25% - 18px)',
                            },
                            flexGrow: 0,
                            flexShrink: 0,
                        }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography
                                    variant="overline"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    {item.label}
                                </Typography>
                                <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
                                    {item.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                ))}
            </Box>

            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            flexBasis: {
                                xs: '100%',
                                md: 'calc(50% - 12px)',
                            },
                            flexGrow: 0,
                            flexShrink: 0,
                            minWidth: {
                                md: 'calc(50% - 12px)',
                            }
                        }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
                            <CardContent>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ fontWeight: 500, textAlign: 'center' }}
                                >
                                    {t("eventAttendee.analytics.genderDistribution")}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, percent }) =>
                                                    `${t(`eventAttendee.analytics.${name}`)}: ${(percent * 100).toFixed(0)}%`
                                                }
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <ChartTooltip
                                                formatter={(value) => [t('eventAttendee.analytics.totalAttendee', {total: value})]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box
                        sx={{
                            flexBasis: {
                                xs: '100%',
                                md: 'calc(50% - 12px)',
                            },
                            flexGrow: 0,
                            flexShrink: 0,
                            minWidth: {
                                md: 'calc(50% - 12px)',
                            }
                        }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
                            <CardContent>
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ fontWeight: 500, textAlign: 'center' }}
                                >
                                    {t("eventAttendee.analytics.ageDistribution")}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={ageData}
                                            margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <ChartTooltip
                                                formatter={(value) => [t('eventAttendee.analytics.totalAttendee', {total: value})]}
                                            />
                                            <Bar dataKey="value" fill={theme.palette.primary.main} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            flexBasis: {
                                xs: '100%',
                                md: 'calc(50% - 12px)',
                            },
                            flexGrow: 0,
                            flexShrink: 0,
                            minWidth: {
                                md: 'calc(50% - 12px)',
                            }
                        }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, textAlign: 'center' }}>
                                    {tierData.length > 0
                                        ? t('eventAttendee.analytics.tierDistribution')
                                        : t('eventAttendee.analytics.ticketDistribution')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                                            {tierData.length > 0 ? (
                                                <Pie
                                                    data={tierData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    label
                                                >
                                                    {tierData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                            ) : (
                                                <Pie
                                                    data={ticketData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    dataKey="value"
                                                >
                                                    {ticketData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                            )}
                                            <ChartTooltip formatter={(value) => [t('eventAttendee.analytics.ticketSold', {total: value})]} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box
                        sx={{
                            flexBasis: {
                                xs: '100%',
                                md: 'calc(50% - 12px)',
                            },
                            flexGrow: 0,
                            flexShrink: 0,
                            minWidth: {
                                md: 'calc(50% - 12px)',
                            }
                        }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, textAlign: 'center' }}>
                                    {t('eventAttendee.analytics.registrationTimeline')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={registrationData}
                                            margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(date) =>
                                                    dayjs(date).format('DD/MM')
                                                }
                                            />
                                            <YAxis allowDecimals={false} />
                                            <ChartTooltip
                                                formatter={(value) =>  [t('eventAttendee.analytics.ticketSold', {total: value})]}
                                                labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke={theme.palette.primary.main}
                                                strokeWidth={2}
                                                dot={{ r: 3 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>

            <Box>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 3,
                        justifyContent: 'center'
                    }}
                >
                    <Box
                        sx={{
                            flexBasis: {
                                xs: '100%',
                                md: 'calc(50% - 12px)',
                            },
                            flexGrow: 0,
                            flexShrink: 0,
                            minWidth: {
                                md: 'calc(50% - 12px)',
                            }
                        }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, textAlign: 'center' }}>
                                    {t('eventAttendee.analytics.topInterests')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={interestsData}
                                            layout="vertical"
                                            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <ChartTooltip formatter={(value) => [t('eventAttendee.analytics.totalAttendee', {total: value})]} />
                                            <Bar dataKey="value" fill={theme.palette.secondary.main} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>

                    <Box
                        sx={{
                            flexBasis: {
                                xs: '100%',
                                md: 'calc(50% - 12px)',
                            },
                            flexGrow: 0,
                            flexShrink: 0,
                            minWidth: {
                                md: 'calc(50% - 12px)',
                            }
                        }}
                    >
                        <Card sx={{ borderRadius: 2, boxShadow: 3, height: '100%' }}>
                            <CardContent>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, textAlign: 'center' }}>
                                    {t('eventAttendee.analytics.topCountries')}
                                </Typography>
                                <Box sx={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={nationalityData}
                                            layout="vertical"
                                            margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={120} />
                                            <ChartTooltip formatter={(value) =>  [t('eventAttendee.analytics.totalAttendee', {total: value})]} />
                                            <Bar dataKey="value" fill={theme.palette.info.main} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default AttendeeAnalytics;