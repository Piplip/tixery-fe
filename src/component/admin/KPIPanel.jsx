import {Box, Card, CardContent, Stack, Typography} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import GroupWorkIcon from '@mui/icons-material/GroupWork';

function KPIPanel(){
    const kpiData = {
        totalRequests: 10234,
        avgResponseTime: 200,
        errorRate: 1.2,
        activeInstances: 12
    };

    return (
        <Card>
            <CardContent sx={{ padding: '1rem' }}>
                <Typography variant="h6" gutterBottom>
                    Key Performance Indicators
                </Typography>

                <Stack justifyContent={'space-between'} direction={'row'}>
                    <Stack>
                        <Box display="flex" alignItems="center" gap={1}>
                            <TrendingUpIcon fontSize="small" color="primary" />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Total Requests
                                </Typography>
                                <Typography variant="h6">
                                    {kpiData.totalRequests.toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    <Stack>
                        <Box display="flex" alignItems="center" gap={1}>
                            <SpeedIcon fontSize="small" color="primary" />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Avg Response Time
                                </Typography>
                                <Typography variant="h6">
                                    {kpiData.avgResponseTime} ms
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    <Stack>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ErrorOutlineIcon fontSize="small" color="error" />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Error Rate
                                </Typography>
                                <Typography variant="h6">
                                    {kpiData.errorRate}%
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>

                    <Stack>
                        <Box display="flex" alignItems="center" gap={1}>
                            <GroupWorkIcon fontSize="small" color="primary" />
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Active Instances
                                </Typography>
                                <Typography variant="h6">
                                    {kpiData.activeInstances}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default KPIPanel;