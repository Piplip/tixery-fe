import {
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem, Stack
} from '@mui/material';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid
} from 'recharts';
import {useState} from "react";


const mockServices = ['Config Server', 'Registry', 'Gateway', 'Service 1', 'Service 2'];


const generateMockData = () => {
    const data = [];
    for (let i = 0; i < 10; i++) {
        data.push({
            timestamp: `T${i}`,
            cpuUsage: Math.floor(Math.random() * 100),
            memoryUsage: Math.floor(Math.random() * 100)
        });
    }
    return data;
};

function ResourceUtilization(){
    const [selectedService, setSelectedService] = useState(mockServices[0]);
    const chartData = generateMockData();

    return (
        <Card>
            <CardContent>
                <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'}>
                    <Typography variant="h6" gutterBottom>
                        Resource Utilization
                    </Typography>
                    <FormControl sx={{ minWidth: 200, marginBottom: '1rem' }} size="small">
                        <InputLabel id="service-select-label">Select Service</InputLabel>
                        <Select
                            labelId="service-select-label"
                            value={selectedService}
                            label="Select Service"
                            onChange={(e) => setSelectedService(e.target.value)}
                        >
                            {mockServices.map((service, index) => (
                                <MenuItem key={index} value={service}>
                                    {service}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>

                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timestamp" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="cpuUsage"
                            name="CPU Usage (%)"
                            stroke="#8884d8"
                            activeDot={{ r: 8 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="memoryUsage"
                            name="Memory Usage (%)"
                            stroke="#82ca9d"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

export default ResourceUtilization;