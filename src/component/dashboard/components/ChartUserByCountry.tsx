import * as React from 'react';
import {PieChart} from '@mui/x-charts/PieChart';
import {useDrawingArea} from '@mui/x-charts/hooks';
import {styled} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import LinearProgress, {linearProgressClasses} from '@mui/material/LinearProgress';

import {BrazilFlag, GlobeFlag, IndiaFlag, UsaFlag,} from '../internals/components/CustomIcons';

const data = [
    {label: 'India', value: 50000},
    {label: 'USA', value: 35000},
    {label: 'Brazil', value: 10000},
    {label: 'Other', value: 5000},
];

const countries = [
    {
        name: 'India',
        value: 50,
        flag: <IndiaFlag/>,
        color: 'hsl(220, 25%, 65%)',
    },
    {
        name: 'USA',
        value: 35,
        flag: <UsaFlag/>,
        color: 'hsl(220, 25%, 45%)',
    },
    {
        name: 'Brazil',
        value: 10,
        flag: <BrazilFlag/>,
        color: 'hsl(220, 25%, 30%)',
    },
    {
        name: 'Other',
        value: 5,
        flag: <GlobeFlag/>,
        color: 'hsl(220, 25%, 20%)',
    },
];

interface StyledTextProps {
    variant: 'primary' | 'secondary';
}

const StyledText = styled('text', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<StyledTextProps>(({theme}) => ({
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fill: (theme.vars || theme).palette.text.secondary,
    variants: [
        {
            props: {
                variant: 'primary',
            },
            style: {
                fontSize: theme.typography.h5.fontSize,
            },
        },
        {
            props: ({variant}) => variant !== 'primary',
            style: {
                fontSize: theme.typography.body2.fontSize,
            },
        },
        {
            props: {
                variant: 'primary',
            },
            style: {
                fontWeight: theme.typography.h5.fontWeight,
            },
        },
        {
            props: ({variant}) => variant !== 'primary',
            style: {
                fontWeight: theme.typography.body2.fontWeight,
            },
        },
    ],
}));

interface PieCenterLabelProps {
    primaryText: string;
    secondaryText: string;
}

function PieCenterLabel({primaryText, secondaryText}: PieCenterLabelProps) {
    const {width, height, left, top} = useDrawingArea();
    const primaryY = top + height / 2 - 10;
    const secondaryY = primaryY + 24;

    return (
        <React.Fragment>
            <StyledText variant="primary" x={left + width / 2} y={primaryY}>
                {primaryText}
            </StyledText>
            <StyledText variant="secondary" x={left + width / 2} y={secondaryY}>
                {secondaryText}
            </StyledText>
        </React.Fragment>
    );
}

const colors = [
    'hsl(220, 20%, 65%)',
    'hsl(220, 20%, 42%)',
    'hsl(220, 20%, 35%)',
    'hsl(220, 20%, 25%)',
];

export default function ChartUserByCountry() {
    return (
        <Card
            variant="outlined"
            sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%'}}
        >
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    Users by Country
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4} sx={{display: 'flex', justifyContent: 'center'}}>
                        <PieChart
                            colors={colors}
                            margin={{
                                left: 60,
                                right: 60,
                                top: 60,
                                bottom: 60,
                            }}
                            series={[
                                {
                                    data,
                                    innerRadius: 75,
                                    outerRadius: 100,
                                    paddingAngle: 0,
                                    highlightScope: {faded: 'global', highlighted: 'item'},
                                },
                            ]}
                            height={250}
                            width={250}
                            slotProps={{
                                legend: {hidden: true},
                            }}
                        >
                            <PieCenterLabel primaryText="98.5K" secondaryText="Total"/>
                        </PieChart>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            {countries.map((country, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Stack
                                        direction="row"
                                        sx={{alignItems: 'center', gap: 2}}
                                    >
                                        {country.flag}
                                        <Stack sx={{gap: 1, flexGrow: 1}}>
                                            <Stack
                                                direction="row"
                                                sx={{
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    gap: 2,
                                                }}
                                            >
                                                <Typography variant="body2" sx={{fontWeight: '500'}}>
                                                    {country.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{color: 'text.secondary'}}>
                                                    {country.value}%
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                aria-label="Number of users by country"
                                                value={country.value}
                                                sx={{
                                                    [`& .${linearProgressClasses.bar}`]: {
                                                        backgroundColor: country.color,
                                                    },
                                                }}
                                            />
                                        </Stack>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}