import * as React from 'react';
import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid2';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

interface Event {
    id: number;
    eventName: string;
    organizerName: string;
    eventDate: string;
    status: 'active' | 'pending' | 'completed' | 'cancelled';
    ticketsSold: number;
    revenue: number;
    platformFee: number;
    location?: string;
    capacity?: number;
    description?: string;
}

interface EventFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (eventData: Partial<Event>) => void;
    event: Event | null;
}

export default function EventFormDialog({ open, onClose, onSave, event }: EventFormDialogProps) {
    const [formData, setFormData] = useState<Partial<Event>>({
        eventName: '',
        organizerName: '',
        eventDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        ticketsSold: 0,
        revenue: 0,
        platformFee: 0,
        location: '',
        capacity: 0,
        description: '',
    });

    useEffect(() => {
        if (event) {
            setFormData(event);
        } else {
            setFormData({
                eventName: '',
                organizerName: '',
                eventDate: new Date().toISOString().split('T')[0],
                status: 'pending',
                ticketsSold: 0,
                revenue: 0,
                platformFee: 0,
                location: '',
                capacity: 0,
                description: '',
            });
        }
    }, [event]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'ticketsSold' || name === 'revenue' || name === 'platformFee' || name === 'capacity'
                ? Number(value)
                : value,
        });
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleDateChange = (date: Date | null) => {
        if (date) {
            setFormData({
                ...formData,
                eventDate: date.toISOString().split('T')[0],
            });
        }
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{event ? 'Edit Event' : 'Add New Event'}</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="eventName"
                            label="Event Name"
                            value={formData.eventName}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="organizerName"
                            label="Organizer"
                            value={formData.organizerName}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Event Date"
                                value={formData.eventDate ? new Date(formData.eventDate) : null}
                                onChange={handleDateChange}
                                slotProps={{
                                    textField: { fullWidth: true }
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                label="Status"
                                onChange={handleSelectChange}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                                <MenuItem value="cancelled">Cancelled</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="location"
                            label="Location"
                            value={formData.location}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            name="capacity"
                            label="Capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            name="ticketsSold"
                            label="Tickets Sold"
                            type="number"
                            value={formData.ticketsSold}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            name="revenue"
                            label="Revenue ($)"
                            type="number"
                            value={formData.revenue}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            name="platformFee"
                            label="Platform Fee ($)"
                            type="number"
                            value={formData.platformFee}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleChange}
                            fullWidth
                            multiline
                            rows={4}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">
                    {event ? 'Update' : 'Add'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}