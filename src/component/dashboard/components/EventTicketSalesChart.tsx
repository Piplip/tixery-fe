import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export default function EventTicketSalesChart() {
  const theme = useTheme();
  const colorPalette = [
    (theme.vars || theme).palette.primary.dark,
    (theme.vars || theme).palette.primary.main,
    (theme.vars || theme).palette.primary.light,
  ];
  return (
      <Card variant="outlined" sx={{ width: '100%' }}>
        <CardContent>
          <Typography component="h2" variant="subtitle2" gutterBottom>
            Ticket Sales by Event Category
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
                87.4K
              </Typography>
              <Chip size="small" color="success" label="+12%" />
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Total tickets sold across all categories for the last 6 months
            </Typography>
          </Stack>
          <BarChart
              borderRadius={8}
              colors={colorPalette}
              xAxis={
                [
                  {
                    scaleType: 'band',
                    categoryGapRatio: 0.5,
                    data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                  },
                ] as any
              }
              series={[
                {
                  id: 'concerts',
                  label: 'Concerts',
                  data: [5234, 6872, 7998, 8125, 9357, 10789],
                  stack: 'A',
                },
                {
                  id: 'sports',
                  label: 'Sports',
                  data: [4098, 4215, 5384, 6101, 6752, 7593],
                  stack: 'A',
                },
                {
                  id: 'conferences',
                  label: 'Conferences',
                  data: [2051, 2275, 3129, 3693, 3904, 4038],
                  stack: 'A',
                },
              ]}
              height={250}
              margin={{ left: 50, right: 0, top: 20, bottom: 20 }}
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
        </CardContent>
      </Card>
  );
}