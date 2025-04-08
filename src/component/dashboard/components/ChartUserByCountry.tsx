import * as React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import {styled, useTheme} from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import Avatar from '@mui/material/Avatar';
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import viLocale from 'i18n-iso-countries/langs/vi.json';

countries.registerLocale(enLocale);
countries.registerLocale(viLocale);

const StyledText = styled('text', {
    shouldForwardProp: (prop) => prop !== 'variant',
})<{ variant: 'primary' | 'secondary' }>(({ theme }) => ({
    textAnchor: 'middle',
    dominantBaseline: 'central',
    fill: theme.palette.text.secondary,
    variants: [
        {
            props: { variant: 'primary' },
            style: {
                fontSize: theme.typography.h5.fontSize,
                fontWeight: theme.typography.h5.fontWeight,
            },
        },
        {
            props: { variant: 'secondary' },
            style: {
                fontSize: theme.typography.body2.fontSize,
                fontWeight: theme.typography.body2.fontWeight,
            },
        },
    ],
}));

function PieCenterLabel({ primaryText, secondaryText }) {
    const { width, height, left, top } = useDrawingArea();
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
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#d35400', '#34495e', '#16a085', '#c0392b', '#7f8c8d',
];

const getCountryFlag = (countryCode: string) => {
    if (countryCode === 'UK') {
        countryCode = 'GB';
    }

    if (countryCode === 'Other') {
        return '🌐';
    }

    return (
        <img
            src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`}
            alt={`${countryCode} flag`}
            style={{ width: 16, height: 12 }}
        />
    );
};

export default function ChartUserByCountry({ usersByCountry = [] }) {
    const { t, i18n } = useTranslation();
    const currentLocale = i18n.language || 'en';
    const theme = useTheme();

    const getCountryName = (countryCode: string): string => {
        if (countryCode === 'UK') {
            countryCode = 'GB';
        }

        if (countryCode === 'Other') {
            return t('chartUserByCountry.other');
        }

        const localizedName = countries.getName(countryCode, currentLocale);
        if (localizedName) {
            return localizedName;
        }

        try {
            return new Intl.DisplayNames([currentLocale], { type: 'region' }).of(countryCode) || countryCode;
        } catch (error) {
            return countryCode;
        }
    };

    const countriesArray = Array.isArray(usersByCountry) ? usersByCountry : [];

    const topCountries = countriesArray.slice(0, 10);
    const otherCount = countriesArray.slice(10).reduce((sum, country) => sum + country.count, 0);

    const pieData = [
        ...topCountries.map(country => ({
            label: getCountryName(country.nationality),
            value: country.count
        }))
    ];

    if (otherCount > 0) {
        pieData.push({ label: t('chartUserByCountry.other'), value: otherCount });
    }

    const totalUsers = countriesArray.reduce((sum, country) => sum + country.count, 0);

    const countryData = [
        ...topCountries.map((country, index) => ({
            code: country.nationality,
            name: getCountryName(country.nationality),
            value: Math.round((country.count / totalUsers) * 100),
            flag: getCountryFlag(country.nationality),
            color: colors[index % colors.length],
        }))
    ];

    if (otherCount > 0) {
        countryData.push({
            code: 'Other',
            name: t('chartUserByCountry.other'),
            value: Math.round((otherCount / totalUsers) * 100),
            flag: '🌐',
            color: colors[colors.length - 1],
        });
    }

    return (
        <Card
            variant="outlined"
            sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, width: '100%'}}
        >
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {t('chartUserByCountry.usersByCountry')}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={4} sx={{display: 'flex', justifyContent: 'center'}}>
                        <PieChart
                            colors={colors}
                            margin={{ left: 60, right: 60, top: 60, bottom: 60 }}
                            series={[
                                {
                                    data: pieData,
                                    innerRadius: 75,
                                    outerRadius: 100,
                                    paddingAngle: 0,
                                    highlightScope: {faded: 'global', highlighted: 'item'},
                                },
                            ]}
                            height={250}
                            width={250}
                            slotProps={{ legend: {hidden: true} }}
                        >
                            <PieCenterLabel
                                primaryText={`${totalUsers}`}
                                secondaryText={t('chartUserByCountry.total')}
                            />
                        </PieChart>
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            {countryData.map((country, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Stack
                                        direction="row"
                                        sx={{alignItems: 'center', gap: 2}}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 28,
                                                height: 28,
                                                fontSize: '1.2rem',
                                                bgcolor: theme.palette.background.paper,
                                                border: '1px solid',
                                                borderColor: theme.palette.divider,
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}
                                        >
                                            {country.flag}
                                        </Avatar>
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