import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from "react-i18next";
import dayjs from 'dayjs';
import { formatCurrency } from '../../../common/Utilities';

interface RevenueTrend {
    previousRevenue: number;
    trend: 'up' | 'down' | 'stable';
    currentRevenue: number;
    trendPercentage: number;
}

interface EventType {
    data: number[];
    id: string;
    label: string;
    stack?: string;
}

interface EventTicketSalesChartProps {
    eventTypes?: EventType[];
    revenueTrend?: RevenueTrend;
}

export default function EventTicketSalesChart({
                                                  eventTypes = [],
                                                  revenueTrend
                                              }: EventTicketSalesChartProps) {
    const { t } = useTranslation();
    const theme = useTheme();

    const topEventTypes = React.useMemo(() => {
        return [...eventTypes]
            .filter(type => type.data.some(val => val > 0))
            .sort((a, b) =>
                b.data.reduce((sum, val) => sum + val, 0) -
                a.data.reduce((sum, val) => sum + val, 0)
            )
            .slice(0, 5);
    }, [eventTypes]);

    const colorPalette = [
        theme.palette.primary.dark,
        theme.palette.primary.main,
        theme.palette.primary.light,
        theme.palette.secondary.main,
        theme.palette.secondary.light,
    ];

    const totalSold = React.useMemo(() => {
        if (revenueTrend) {
            return revenueTrend.currentRevenue;
        }

        return Array.isArray(eventTypes)
            ? eventTypes.reduce((sum, category) =>
                sum + (Array.isArray(category.data)
                    ? category.data.reduce((s, v) => s + v, 0)
                    : 0), 0)
            : 0;
    }, [eventTypes, revenueTrend]);

    const getLast6Months = () => {
        const months = [];
        const today = dayjs();
        for (let i = 5; i >= 0; i--) {
            months.push(today.subtract(i, 'month').format('MMMM'));
        }
        return months;
    };

    const months = getLast6Months();

    const trendColor = revenueTrend?.trend === 'up' ? 'success' :
        revenueTrend?.trend === 'down' ? 'error' : 'default';

    const formattedTrendPercentage = revenueTrend?.trendPercentage !== 0 ?
        `${revenueTrend?.trendPercentage.toFixed(1)}%` : "";

    const trendLabel = revenueTrend?.trend === 'up' ? t('eventTicketSalesChart.increase') :
        revenueTrend?.trend === 'down' ? t('eventTicketSalesChart.decrease') :
            t('eventTicketSalesChart.stable');

    return (
        <Card variant="outlined" sx={{ width: '100%' }}>
            <CardContent>
                <Typography component="h2" variant="subtitle2" gutterBottom>
                    {t('eventTicketSalesChart.title')}
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
                            {formatCurrency(totalSold, 'USD')}
                        </Typography>
                        <Chip
                            size="small"
                            color={trendColor}
                            label={revenueTrend?.trendPercentage !== 0 ?
                                `${trendLabel} ${formattedTrendPercentage}` :
                                trendLabel}
                        />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('eventTicketSalesChart.description')}
                    </Typography>
                </Stack>
                {topEventTypes.length > 0 ? (
                    <BarChart
                        sx={{textTransform: 'capitalize'}}
                        borderRadius={8}
                        colors={colorPalette}
                        xAxis={[{
                            scaleType: 'band',
                            categoryGapRatio: 0.5,
                            data: months,
                        } as any]}
                        series={topEventTypes.map(event => ({
                            data: event.data,
                            id: event.id,
                            label: t(`event-category.${event.label}`, event.label),
                            stack: event.stack,
                            valueFormatter: (value: number) => formatCurrency(value, 'USD')
                        }))}
                        height={250}
                        margin={{ left: 50, right: 30, top: 50, bottom: 20 }}
                        grid={{ horizontal: true }}
                        slotProps={{
                            legend: {
                                hidden: false,
                                position: {
                                    vertical: 'top',
                                    horizontal: 'right',
                                },
                            },
                        }}
                    />
                ) : (
                    <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            {t('common.noDataAvailable', 'No data available')}
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}