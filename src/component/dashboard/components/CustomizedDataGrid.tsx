import * as React from 'react';
import {DataGrid, GridColDef, GridRenderCellParams} from '@mui/x-data-grid';
import Chip from '@mui/material/Chip';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';

const defaultEventColumns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 70},
    {field: 'eventName', headerName: 'Event Name', width: 230},
    {field: 'organizerName', headerName: 'Organizer', width: 170},
    {
        field: 'eventDate',
        headerName: 'Date',
        width: 110,
        valueFormatter: (params) => params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params: GridRenderCellParams) => {
            const statusStyles = {
                active: {color: 'success', label: 'Active'},
                pending: {color: 'warning', label: 'Pending'},
                completed: {color: 'default', label: 'Completed'},
                cancelled: {color: 'error', label: 'Cancelled'},
            };
            const status = (params.value || 'pending') as keyof typeof statusStyles;
            return (
                <Chip
                    size="small"
                    label={statusStyles[status].label}
                    color={statusStyles[status].color as any}
                />
            );
        }
    },
    {
        field: 'ticketsSold',
        headerName: 'Tickets Sold',
        type: 'number',
        width: 110,
    },
    {
        field: 'actions',
        headerName: 'Actions',
        width: 120,
        sortable: false,
        renderCell: () => (
            <Stack direction="row">
                <IconButton size="small"><VisibilityIcon fontSize="small"/></IconButton>
                <IconButton size="small"><EditIcon fontSize="small"/></IconButton>
                <IconButton size="small"><BlockIcon fontSize="small"/></IconButton>
            </Stack>
        )
    }
];

// Default rows for events (used when no rows are provided)
const defaultEventRows = [
    {
        id: 1,
        eventName: 'Summer Music Festival',
        organizerName: 'GlobalEvents Inc.',
        eventDate: '2024-07-15',
        status: 'active',
        ticketsSold: 1458,
        revenue: 87480,
        platformFee: 8748
    },
    {
        id: 2,
        eventName: 'Tech Conference 2024',
        organizerName: 'TechCorp',
        eventDate: '2024-08-22',
        status: 'active',
        ticketsSold: 872,
        revenue: 69760,
        platformFee: 6976
    },
    {
        id: 3,
        eventName: 'Sports Championship',
        organizerName: 'SportsMasters',
        eventDate: '2024-06-30',
        status: 'active',
        ticketsSold: 2541,
        revenue: 127050,
        platformFee: 12705
    },
    {
        id: 4,
        eventName: 'Dance Showcase',
        organizerName: 'Arts Alliance',
        eventDate: '2024-05-12',
        status: 'completed',
        ticketsSold: 642,
        revenue: 32100,
        platformFee: 3210
    },
    {
        id: 5,
        eventName: 'Business Workshop',
        organizerName: 'Enterprise Solutions',
        eventDate: '2024-09-05',
        status: 'pending',
        ticketsSold: 145,
        revenue: 14500,
        platformFee: 1450
    },
    {
        id: 6,
        eventName: 'Comic Convention',
        organizerName: 'FanExpo',
        eventDate: '2024-10-18',
        status: 'active',
        ticketsSold: 3562,
        revenue: 178100,
        platformFee: 17810
    },
    {
        id: 7,
        eventName: 'Food & Wine Festival',
        organizerName: 'Culinary Arts',
        eventDate: '2024-08-08',
        status: 'active',
        ticketsSold: 984,
        revenue: 49200,
        platformFee: 4920
    },
    {
        id: 8,
        eventName: 'Classical Concert',
        organizerName: 'Symphony Group',
        eventDate: '2024-07-25',
        status: 'active',
        ticketsSold: 742,
        revenue: 59360,
        platformFee: 5936
    },
    {
        id: 9,
        eventName: 'Gaming Tournament',
        organizerName: 'GamersUnite',
        eventDate: '2024-06-15',
        status: 'cancelled',
        ticketsSold: 0,
        revenue: 0,
        platformFee: 0
    },
    {
        id: 10,
        eventName: 'Art Exhibition',
        organizerName: 'Creative Minds',
        eventDate: '2024-09-20',
        status: 'pending',
        ticketsSold: 218,
        revenue: 6540,
        platformFee: 654
    },
];

interface CustomizedDataGridProps {
    rows?: any[];
    columns?: GridColDef[];
    pageSize?: number;
    pageSizeOptions?: number[];
    checkboxSelection?: boolean;
    disableRowSelectionOnClick?: boolean;
    initialState?: any;
    getRowClassName?: (params: any) => string;
    sx?: any;
}

export default function CustomizedDataGrid({
                                               rows = defaultEventRows,
                                               columns = defaultEventColumns,
                                               pageSize = 10,
                                               pageSizeOptions = [5, 10, 20],
                                               checkboxSelection = true,
                                               disableRowSelectionOnClick = true,
                                               initialState = {
                                                   pagination: {paginationModel: {pageSize: 10}},
                                                   sorting: {
                                                       sortModel: [{field: 'eventDate', sort: 'asc'}],
                                                   },
                                               },
                                               getRowClassName = (params) =>
                                                   params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd',
                                               sx = {
                                                   '& .MuiDataGrid-row:hover': {
                                                       backgroundColor: 'action.hover',
                                                   },
                                               }
                                           }: CustomizedDataGridProps) {
    return (
        <DataGrid
            rows={rows}
            columns={columns}
            getRowClassName={getRowClassName}
            initialState={initialState}
            pageSizeOptions={pageSizeOptions}
            checkboxSelection={checkboxSelection}
            disableRowSelectionOnClick={disableRowSelectionOnClick}
            sx={sx}
        />
    );
}