import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ChartUserByCountry from './ChartUserByCountry';
import EventTicketSalesChart from './EventTicketSalesChart';
import SessionsChart from './SessionsChart';
import StatCard from './StatCard';
import Grid from '@mui/material/Grid2';
import { useLoaderData } from "react-router-dom";
import {useTranslation} from "react-i18next";

interface MetricsData {
    ticketsSold: {
        data: number[];
        trend: 'up' | 'down';
        interval: string;
        title: string;
        value: string;
    };
    totalEvents: {
        trend: 'up' | 'down';
        dailyEvents: number[];
        interval: string;
        title: string;
        value: string;
    };
    topEventTypes: Array<{
        stack: string;
        data: number[];
        id: string;
        label: string;
    }>;
}

export default function MainGrid() {
    const {t} = useTranslation()
    const { overview, metrics } = useLoaderData() as {
        overview: { usersByCountry: Array<{ nationality: string; count: number }> };
        metrics: MetricsData;
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
                    <StatCard {...metrics.ticketsSold} />
                </Grid>
                <Grid key="events" size={{ xs: 12, sm: 6, lg: 6 }}>
                    <StatCard {...metrics.totalEvents} data={metrics.totalEvents.dailyEvents} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SessionsChart />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <EventTicketSalesChart eventTypes={metrics.topEventTypes} />
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