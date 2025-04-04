import { Box, Typography, Card, CardContent, Divider, Tooltip, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Info as InfoIcon } from '@mui/icons-material';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid2";

AttendeeAnalytics.propTypes = {
    attendees: PropTypes.array
}

function AttendeeAnalytics({ attendees }) {
    const theme = useTheme();
    const { t } = useTranslation();

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
            'Unknown': 0
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
            const ticketName = attendee.ticket_name;
            acc[ticketName] = (acc[ticketName] || 0) + attendee.ticket_count;
            return acc;
        }, {});
        return Object.entries(ticketCounts).map(([name, value]) => ({ name, value }));
    }, [attendees]);

    const registrationData = useMemo(() => {
        const regByDate = attendees.reduce((acc, attendee) => {
            const date = new Date(attendee.registration_date).toISOString().split('T')[0];
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
                    const category = interest.split('-')[0];
                    if (category) {
                        interestCategories[category] = (interestCategories[category] || 0) + 1;
                    }
                });
            } catch (e) {
                console.error("Error parsing interests:", e);
            }
        });
        return Object.entries(interestCategories)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [uniqueAttendees]);

    const nationalityData = useMemo(() => {
        const nationalityCounts = uniqueAttendees.reduce((acc, attendee) => {
            const nationality = attendee.nationality || 'Unknown';
            acc[nationality] = (acc[nationality] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(nationalityCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [uniqueAttendees]);

    const COLORS = [
        theme.palette.primary.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.info.main,
    ];

    const compliment =
        uniqueAttendees.length > 100
            ? t('Great job! Your event is attracting a lot of interest!')
            : t('Keep pushing – there’s room to grow your audience!');

    return (
        <Box sx={{ backgroundColor: theme.palette.background.paper, p: 4 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: theme.palette.text.primary }}>
                    {t('eventAttendee.analytics.title')}
                    <Tooltip title={t('eventAttendee.analytics.description')}>
                        <InfoIcon sx={{ ml: 1, fontSize: 18, verticalAlign: 'middle', color: 'text.secondary' }} />
                    </Tooltip>
                </Typography>
            </motion.div>

            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} transition={{ duration: 0.5 }}>
                <Card sx={{ borderRadius: 2, boxShadow: 4, mb: 4, background: theme.palette.success.light }}>
                    <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: theme.palette.success.dark }}>
                            {compliment}
                        </Typography>
                        <Button variant="contained" color="success" sx={{ mt: 2 }}>
                            {t('eventAttendee.analytics.seeDetails')}
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {[
                    { label: t('eventAttendee.analytics.totalAttendees'), value: uniqueAttendees.length },
                    { label: t('eventAttendee.analytics.totalTickets'), value: attendees.reduce((sum, a) => sum + a.ticket_count, 0) },
                    { label: t('eventAttendee.analytics.ticketTypes'), value: new Set(attendees.map(a => a.ticket_name)).size },
                    { label: t('eventAttendee.analytics.countries'), value: new Set(uniqueAttendees.map(a => a.nationality).filter(Boolean)).size }
                ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3, cursor: 'pointer', '&:hover': { boxShadow: 6 } }}>
                                <CardContent>
                                    <Typography variant="overline" sx={{ color: theme.palette.text.secondary }}>
                                        {item.label}
                                    </Typography>
                                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 500 }}>
                                        {item.value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    {t('eventAttendee.analytics.demographics')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                                        {t('eventAttendee.analytics.genderDistribution')}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {genderData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip formatter={(value) => [`${value} attendees`, 'Count']} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                                        {t('eventAttendee.analytics.ageDistribution')}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={ageData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="name" />
                                            <YAxis allowDecimals={false} />
                                            <ChartTooltip formatter={(value) => [`${value} attendees`, 'Count']} />
                                            <Bar dataKey="value" fill={theme.palette.primary.main} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    {t('eventAttendee.analytics.ticketInsights')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ x: -50 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                                        {t('eventAttendee.analytics.ticketDistribution')}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <PieChart>
                                            <Pie
                                                data={ticketData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {ticketData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <ChartTooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ x: 50 }} animate={{ x: 0 }} transition={{ duration: 0.5 }}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                                        {t('eventAttendee.analytics.registrationTimeline')}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <LineChart data={registrationData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickFormatter={(date) =>
                                                    new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                                }
                                            />
                                            <YAxis allowDecimals={false} />
                                            <ChartTooltip
                                                formatter={(value) => [`${value} tickets`, 'Tickets Sold']}
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
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>

            <Box>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                    {t('eventAttendee.analytics.attendeeInsights')}
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                                        {t('eventAttendee.analytics.topInterests')}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={interestsData} layout="vertical" margin={{ left: 100 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={100} />
                                            <ChartTooltip formatter={(value) => [`${value} attendees`, 'Count']} />
                                            <Bar dataKey="value" fill={theme.palette.secondary.main} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
                            <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                                        {t('eventAttendee.analytics.topCountries')}
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={240}>
                                        <BarChart data={nationalityData} layout="vertical" margin={{ left: 50 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis dataKey="name" type="category" width={50} />
                                            <ChartTooltip formatter={(value) => [`${value} attendees`, 'Count']} />
                                            <Bar dataKey="value" fill={theme.palette.info.main} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}

export default AttendeeAnalytics;
