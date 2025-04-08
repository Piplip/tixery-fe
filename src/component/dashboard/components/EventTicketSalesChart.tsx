import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';
import {useTranslation} from "react-i18next";

export default function EventTicketSalesChart({ eventTypes = [] }) {
    const { t } = useTranslation();
    const theme = useTheme();

    const colorPalette = [
        theme.palette.primary.dark,
        theme.palette.primary.main,
        theme.palette.primary.light,
    ];

    const totalSold = Array.isArray(eventTypes)
        ? eventTypes.reduce((sum, category) =>
            sum + (Array.isArray(category.data)
                ? category.data.reduce((s, v) => s + v, 0)
                : 0), 0)
        : 0;

    const getLast6Months = () => {
        const months = [];
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date();
            d.setMonth(today.getMonth() - i);
            months.push(d.toLocaleDateString('en-US', { month: 'short' }));
        }
        return months;
    };

    const months = getLast6Months();

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
                            {totalSold}
                        </Typography>
                        <Chip size="small" color="success" label={t('eventTicketSalesChart.increase')} />
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('eventTicketSalesChart.description')}
                    </Typography>
                </Stack>
                {Array.isArray(eventTypes) && eventTypes.length > 0 && (
                    <BarChart
                        borderRadius={8}
                        colors={colorPalette}
                        xAxis={
                            [
                                {
                                    scaleType: 'band',
                                    categoryGapRatio: 0.5,
                                    data: months,
                                },
                            ] as any
                        }
                        series={eventTypes.map(event => ({...event, label: t(`event-category.${event.label}`) }))}
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
                                direction: 'row',
                                padding: 8,
                                itemMarkWidth: 10,
                                itemMarkHeight: 10,
                                markGap: 5,
                                itemGap: 10,
                            },
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}