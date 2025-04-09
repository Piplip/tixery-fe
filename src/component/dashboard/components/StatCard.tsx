import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import { areaElementClasses } from '@mui/x-charts/LineChart';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface StatCardProps {
    title: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
    interval: string | number;
    trendPercentage: number;
    data?: number[];
    dailyTickets?: number[];
}

function getDaysInMonth(month: number, year: number) {
    const date = dayjs().year(year).month(month - 1);
    const monthName = date.format('MMMM');
    const daysInMonth = date.daysInMonth();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(`${i} ${monthName}`);
    }
    return days;
}

function AreaGradient({ color, id }: { color: string; id: string }) {
    return (
        <defs>
            <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="100%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
        </defs>
    );
}

export default function StatCard({
                                     title,
                                     value,
                                     interval,
                                     trend,
                                     trendPercentage,
                                     data,
                                 }: StatCardProps) {
    const { t } = useTranslation();
    const theme = useTheme();
    const daysInWeek = getDaysInMonth(4, 2024);

    const trendColors = {
        up:
            theme.palette.mode === 'light'
                ? theme.palette.success.main
                : theme.palette.success.dark,
        down:
            theme.palette.mode === 'light'
                ? theme.palette.error.main
                : theme.palette.error.dark,
        stable:
            theme.palette.mode === 'light'
                ? theme.palette.grey[400]
                : theme.palette.grey[700],
    };

    const labelColors = {
        up: 'success' as const,
        down: 'error' as const,
        stable: 'default' as const,
    };

    const color = labelColors[trend];
    const chartColor = trendColors[trend];
    const trendValues: Record<string, string> = {
        up: 'statCard.trendUp',
        down: 'statCard.trendDown',
        stable: 'statCard.trendStable'
    };

    const formattedTrendPercentage = trendPercentage !== 0 ?
        `${trend === 'up' ? '+' : trend === 'down' ? '-' : ''}${trendPercentage.toFixed(1)}%` : "";
    return (
        <Card variant="outlined" sx={{ height: '100%', flexGrow: 1 }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {t(`statCard.${title}` as any)}
                </Typography>
                <Stack
                    direction="column"
                    sx={{ justifyContent: 'space-between', flexGrow: '1', gap: 1 }}
                >
                    <Stack sx={{ justifyContent: 'space-between' }}>
                        <Stack
                            direction="row"
                            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <Typography variant="h4" component="p">
                                {value}
                            </Typography>
                            <Chip
                                size="small"
                                color={color}
                                label={trendPercentage !== 0 ?
                                    `${formattedTrendPercentage}` :
                                    t(trendValues[trend] as any)
                                }
                            />
                        </Stack>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {title === 'Total Events' ?
                                t('statCard.active', { interval } as any)
                                :
                                t('statCard.day', { interval } as any)
                            }
                        </Typography>
                    </Stack>
                    <Box sx={{ width: '100%', height: 50 }}>
                        <SparkLineChart
                            colors={[chartColor]}
                            data={data}
                            area
                            showHighlight
                            showTooltip
                            xAxis={{
                                scaleType: 'band',
                                data: daysInWeek,
                            }}
                            sx={{
                                [`& .${areaElementClasses.root}`]: {
                                    fill: `url(#area-gradient-${value})`,
                                },
                            }}
                        >
                            <AreaGradient color={chartColor} id={`area-gradient-${value}`}/>
                        </SparkLineChart>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}