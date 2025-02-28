import "../../styles/organizer-report-styles.css"
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {Card, CardContent} from "@mui/joy";
import {useState} from "react";
import {Bar, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart} from "recharts";
import {useLoaderData} from "react-router-dom";

function OrganizerReport(){
    const data = useLoaderData()
    console.log(data)
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: ''
    });

    // Dummy summary data
    const totalEvents = 25;
    const totalSaved = 100;

    // Sample data for the gross revenue chart
    const grossRevenueData = [
        { date: '2025-01-01', revenue: 4000 },
        { date: '2025-01-02', revenue: 3000 },
        { date: '2025-01-03', revenue: 5000 },
        { date: '2025-01-04', revenue: 2000 },
        { date: '2025-01-05', revenue: 2780 },
        { date: '2025-01-06', revenue: 1890 },
        { date: '2025-01-07', revenue: 2390 },
    ];

    // Sample data for combined tickets & buyers chart
    const ticketsAndBuyersData = [
        { date: '2025-01-01', tickets: 240, buyers: 40 },
        { date: '2025-01-02', tickets: 221, buyers: 35 },
        { date: '2025-01-03', tickets: 229, buyers: 45 },
        { date: '2025-01-04', tickets: 200, buyers: 30 },
        { date: '2025-01-05', tickets: 218, buyers: 38 },
        { date: '2025-01-06', tickets: 250, buyers: 42 },
        { date: '2025-01-07', tickets: 210, buyers: 37 },
    ];

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const applyFilters = () => {
        console.log('Filters applied:', filters);
    };

    return (
        <div className="organizer-report">
            <Typography variant="h4" className="organizer-report__title">
                Organizer Report
            </Typography>

            <Paper className="organizer-report__filters">
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <TextField
                            type="date"
                            label="Start Date"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            type="date"
                            label="End Date"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={applyFilters}
                            fullWidth
                        >
                            FIND
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2} className="organizer-report__summary">
                <Grid item xs={12} sm={6} md={4}>
                    <Card className="organizer-report__card">
                        <CardContent>
                            <Typography variant="h6">Total Events</Typography>
                            <Typography variant="h4">{totalEvents}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card className="organizer-report__card">
                        <CardContent>
                            <Typography variant="h6">Total Saved Events</Typography>
                            <Typography variant="h4">{totalSaved}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <div className="organizer-report__charts">
                <Paper className="organizer-report__chart-card">
                    <Typography variant="h6" className="organizer-report__chart-title">
                        Gross Revenue
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={grossRevenueData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#8884d8"
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Paper>

                <Paper className="organizer-report__chart-card">
                    <Typography variant="h6" className="organizer-report__chart-title">
                        Tickets & Buyers
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={ticketsAndBuyersData}
                            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="tickets" fill="#82ca9d" />
                            <Bar dataKey="buyers" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>
            </div>
        </div>
    );
}

export default OrganizerReport;