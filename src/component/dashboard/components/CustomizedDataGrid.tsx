import * as React from 'react';
import {DataGrid, GridColDef} from '@mui/x-data-grid';
import {viVN, enUS} from '@mui/x-data-grid/locales';
import {viVN as pickersviVN, enUS as pickersenUS} from '@mui/x-date-pickers/locales';
import {viVN as coreviVN, enUS as coreenUS} from '@mui/material/locale';
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {useTranslation} from 'react-i18next';

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
                                               rows,
                                               columns,
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
    const { i18n } = useTranslation();

    const getLocales = () => {
        if (i18n.language.startsWith('vi')) {
            return {
                dataGridLocale: viVN,
                pickerLocale: pickersviVN,
                coreLocale: coreviVN
            };
        } else {
            return {
                dataGridLocale: enUS,
                pickerLocale: pickersenUS,
                coreLocale: coreenUS
            };
        }
    };

    const { dataGridLocale, pickerLocale, coreLocale } = getLocales();

    const theme = React.useMemo(() =>
            createTheme(
                {
                    palette: {
                        primary: { main: '#1976d2' },
                    },
                },
                dataGridLocale,
                pickerLocale,
                coreLocale
            ),
        [i18n.language]);

    return (
        <ThemeProvider theme={theme}>
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
        </ThemeProvider>
    );
}