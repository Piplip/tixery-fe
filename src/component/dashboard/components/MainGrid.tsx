import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChartUserByCountry from './ChartUserByCountry';
import EventTicketSalesChart from './EventTicketSalesChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import Grid from '@mui/material/Grid2';
import { useLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface TrafficData {
    totalSessions: number;
    sessions: number[];
    totalUsers: number;
    dates: string[];
    source: string;
    users: number[];
}

interface AnalyticsData {
    trafficData: TrafficData[];
    endDate: string;
    propertyId: string;
    startDate: string;
}

interface MetricsData {
    ticketsSold: {
        data: number[];
        trend: 'up' | 'down' | 'stable';
        interval: number;
        trendPercentage: number;
        title: string;
        value: string;
    };
    totalEvents: {
        trend: 'up' | 'down' | 'stable';
        dailyEvents: number[];
        interval: number;
        trendPercentage: number;
        title: string;
        value: string;
    };
    revenueTrend: {
        previousRevenue: number;
        trend: 'up' | 'down' | 'stable';
        currentRevenue: number;
        trendPercentage: number;
    };
    topEventTypes: Array<{
        data: number[];
        id: string;
        label: string;
        stack?: string;
    }>;
}

export default function MainGrid() {
    const { t } = useTranslation();
    const { overview, metrics, analytics } = useLoaderData() as {
        overview: { usersByCountry: Array<{ nationality: string; count: number }> };
        metrics: MetricsData;
        analytics: AnalyticsData;
    };

    return (
        <Box sx={{ width: '100%', maxWidth: { sm: '100%', md: '1700px' } }}>
            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
                {t('mainGrid.overview')}
            </Typography>
            <Grid
                container
                spacing={2}
                columns={12}
                sx={{ mb: (theme) => theme.spacing(2) }}
            >
                <Grid key="tickets" size={{ xs: 12, sm: 6, lg: 6 }}>
                    <StatCard
                        {...metrics.ticketsSold}
                        trendPercentage={metrics.ticketsSold.trendPercentage}
                    />
                </Grid>
                <Grid key="events" size={{ xs: 12, sm: 6, lg: 6 }}>
                    <StatCard
                        {...metrics.totalEvents}
                        data={metrics.totalEvents.dailyEvents}
                        trendPercentage={metrics.totalEvents.trendPercentage}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SessionsChart analyticsData={analytics} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <EventTicketSalesChart
                        eventTypes={metrics.topEventTypes}
                        revenueTrend={metrics.revenueTrend}
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2} columns={12}>
                <Grid container spacing={2} columns={12}>
                    <Grid size={{ xs: 12 }}>
                        <ChartUserByCountry usersByCountry={overview.usersByCountry} />
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}