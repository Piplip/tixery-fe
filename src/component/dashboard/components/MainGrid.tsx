import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Copyright from '../internals/components/Copyright';
import ChartUserByCountry from './ChartUserByCountry';
import EventTicketSalesChart from './EventTicketSalesChart';
import SessionsChart from './SessionsChart';
import StatCard, {StatCardProps} from './StatCard';
import Grid from '@mui/material/Grid2'

const data: StatCardProps[] = [
    {
        title: 'Tickets Sold',
        value: '14k',
        interval: 'Last 30 days',
        trend: 'up',
        data: [
            200, 24, 220, 260, 240, 380, 100, 240, 280, 240, 300, 340, 320, 360, 340, 380,
            360, 400, 380, 420, 400, 640, 340, 460, 440, 480, 460, 600, 880, 300,
        ],
    },
    {
        title: 'Total Organizers',
        value: '324',
        interval: '52 active this month',
        trend: 'up',
        data: [
            240, 250, 270, 230, 250, 240, 220, 280, 300, 350, 320, 320, 340, 360, 320,
            280, 300, 360, 380, 340, 360, 320, 340, 350, 360, 380, 390, 400, 410, 420,
        ],
    },
    {
        title: 'Total Events',
        value: '1,452',
        interval: '268 active now',
        trend: 'up',
        data: [
            930, 932, 941, 950, 958, 970, 978, 982, 985, 990, 997, 1005, 1010, 1018, 1025,
            1036, 1042, 1050, 1062, 1070, 1078, 1082, 1090, 1102, 1110, 1118, 1125, 1140, 1145, 1152,
        ],
    },
];

export default function MainGrid() {
    return (
        <Box sx={{width: '100%', maxWidth: {sm: '100%', md: '1700px'}}}>
            <Typography component="h2" variant="h6" sx={{mb: 2}}>
                Overview
            </Typography>
            <Grid
                container
                spacing={2}
                columns={12}
                sx={{mb: (theme) => theme.spacing(2)}}
            >
                {data.map((card, index) => (
                    <Grid key={index} size={{xs: 12, sm: 6, lg: 4}}>
                        <StatCard {...card} />
                    </Grid>
                ))}
                <Grid size={{xs: 12, md: 6}}>
                    <SessionsChart/>
                </Grid>
                <Grid size={{xs: 12, md: 6}}>
                    <EventTicketSalesChart/>
                </Grid>
            </Grid>
            <Grid container spacing={2} columns={12}>
                <Grid size={{xs: 12}}>
                    <ChartUserByCountry/>
                </Grid>
            </Grid>
        </Box>
    );
}
