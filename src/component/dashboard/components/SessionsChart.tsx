import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';

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

function AreaGradient({ color, id }: { color: string; id: string }) {
    return (
        <defs>
            <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
        </defs>
    );
}

function formatDates(dateStrings: string[]): string[] {
    return dateStrings.map(dateString => {
        const date = dayjs(dateString, 'YYYYMMDD');
        return date.format('DD MMMM');
    });
}

function processAnalyticsData(analyticsData: AnalyticsData) {
    const allDatesSet = new Set<string>();
    analyticsData.trafficData.forEach(source => {
        source.dates.forEach(date => allDatesSet.add(date));
    });

    const allDates = Array.from(allDatesSet).sort();

    const directData: number[] = Array(allDates.length).fill(0);
    const referralData: number[] = Array(allDates.length).fill(0);
    const organicData: number[] = Array(allDates.length).fill(0);

    analyticsData.trafficData.forEach(source => {
        source.dates.forEach((date, index) => {
            const dateIndex = allDates.indexOf(date);
            if (dateIndex !== -1) {
                switch (source.source.toLowerCase()) {
                    case 'direct':
                        directData[dateIndex] = source.sessions[index];
                        break;
                    case 'referral':
                        referralData[dateIndex] = source.sessions[index];
                        break;
                    case 'organic':
                        organicData[dateIndex] = source.sessions[index];
                        break;
                }
            }
        });
    });

    const totalSessions = analyticsData.trafficData.reduce(
        (sum, source) => sum + source.totalSessions, 0
    );

    const halfwayPoint = Math.floor(allDates.length / 2);
    const firstHalfTotal = [...directData, ...referralData, ...organicData]
        .slice(0, halfwayPoint)
        .reduce((sum, val) => sum + val, 0);
    const secondHalfTotal = [...directData, ...referralData, ...organicData]
        .slice(halfwayPoint)
        .reduce((sum, val) => sum + val, 0);

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendPercentage = 0;

    if (firstHalfTotal > 0) {
        const change = ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
        trendPercentage = Math.abs(Math.round(change));
        trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
    } else if (secondHalfTotal > 0) {
        trend = 'up';
        trendPercentage = 100;
    }

    return {
        value: totalSessions,
        trend,
        trendPercentage,
        data: {
            direct: directData,
            referral: referralData,
            organic: organicData,
            dates: formatDates(allDates)
        }
    };
}

export default function SessionsChart({ analyticsData }: { analyticsData: AnalyticsData }) {
    const { t } = useTranslation();
    const theme = useTheme();

    const processedData = React.useMemo(() =>
        processAnalyticsData(analyticsData), [analyticsData]);

    const colorPalette = [
        theme.palette.primary.light,
        theme.palette.primary.main,
        theme.palette.primary.dark,
    ];

    const chipColor = processedData.trend === 'up' ? 'success' :
        processedData.trend === 'down' ? 'error' : 'info';

    const chipLabel = processedData.trend === 'up' ? `+${processedData.trendPercentage}%` : processedData.trend === 'down' ?
            `-${processedData.trendPercentage}%` :
            t('sessionsChart.stable');

    return (
        <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {t('sessionsChart.sessions')}
                </Typography>
                <Stack sx={{ justifyContent: 'space-between' }}>
                    <Stack
                        direction="row"
                        sx={{
                            alignContent: { xs: 'center', sm: 'flex-start' },
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        <Typography variant="h4" component="p">
                            {processedData.value.toLocaleString()}
                        </Typography>
                        <Chip size="small" color={chipColor} label={chipLabel} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('sessionsChart.description')}
                    </Typography>
                </Stack>
                <LineChart
                    colors={colorPalette}
                    xAxis={[
                        {
                            scaleType: 'point',
                            data: processedData.data.dates,
                            tickInterval: (index, i) => (i + 1) % 5 === 0,
                        },
                    ]}
                    series={[
                        {
                            id: 'direct',
                            label: t('sessionsChart.direct'),
                            showMark: false,
                            curve: 'linear',
                            stack: 'total',
                            area: true,
                            stackOrder: 'ascending',
                            data: processedData.data.direct,
                        },
                        {
                            id: 'referral',
                            label: t('sessionsChart.referral'),
                            showMark: false,
                            curve: 'linear',
                            stack: 'total',
                            area: true,
                            stackOrder: 'ascending',
                            data: processedData.data.referral,
                        },
                        {
                            id: 'organic',
                            label: t('sessionsChart.organic'),
                            showMark: false,
                            curve: 'linear',
                            stack: 'total',
                            stackOrder: 'ascending',
                            data: processedData.data.organic,
                            area: true,
                        },
                    ]}
                    height={250}
                    margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
                    grid={{ horizontal: true }}
                    sx={{
                        '& .MuiAreaElement-series-organic': {
                            fill: "url('#organic')",
                        },
                        '& .MuiAreaElement-series-referral': {
                            fill: "url('#referral')",
                        },
                        '& .MuiAreaElement-series-direct': {
                            fill: "url('#direct')",
                        },
                    }}
                    slotProps={{
                        legend: {
                            hidden: true,
                        },
                    }}
                >
                    <AreaGradient color={theme.palette.primary.dark} id="organic" />
                    <AreaGradient color={theme.palette.primary.main} id="referral" />
                    <AreaGradient color={theme.palette.primary.light} id="direct" />
                </LineChart>
            </CardContent>
        </Card>
    );
}