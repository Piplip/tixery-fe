import * as React from 'react';
import {useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {DataGrid, GridColDef, GridPaginationModel} from '@mui/x-data-grid';
import UserFormDialog from './UserFormDialog';
import {useTheme} from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EventIcon from '@mui/icons-material/Event';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Chip from '@mui/material/Chip';
import {useLoaderData, useSearchParams, useSubmit} from "react-router-dom";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import {accountAxiosWithToken} from "../../../../config/axiosConfig"
import {useAlert} from "../../../../custom-hooks/useAlert";
import {useTranslation} from "react-i18next";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import {viVN, enUS} from "@mui/x-data-grid/locales";

export default function UserManagement() {
    const {t, i18n} = useTranslation();
    const theme = useTheme();
    const submit = useSubmit();
    const [searchParams] = useSearchParams();
    const loaderData = useLoaderData() as { users: any[], total: number };
    const {showSuccess, showError} = useAlert()

    const usersWithId = Array.isArray(loaderData.users)
        ? loaderData.users.map(user => ({
            ...user,
            id: user.account_id
        }))
        : [];

    const [users, setUsers] = useState(usersWithId);
    const [totalUsers, setTotalUsers] = useState(loaderData.total || 0);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [selectedUserData, setSelectedUserData] = useState<any>(null);

    const initialPage = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) - 1 : 0;
    const initialPageSize = searchParams.get('size') ? parseInt(searchParams.get('size')!, 10) : 10;

    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: initialPage,
        pageSize: initialPageSize,
    });

    const getLocale = () => {
        return i18n.language.startsWith('vi') ? viVN : enUS;
    };

    useEffect(() => {
        if (loaderData && loaderData.users) {
            setUsers(loaderData.users.map(user => ({
                ...user,
                id: user.account_id
            })));
            setTotalUsers(loaderData.total || 0);
        }
    }, [loaderData]);

    const handlePaginationModelChange = (newModel: GridPaginationModel) => {
        setPaginationModel(newModel);

        const formData = new FormData();
        formData.append('page', String(newModel.page + 1));
        formData.append('size', String(newModel.pageSize));
        submit(formData, {method: 'get', action: '/admin/users'});
    };

    const handleEdit = (id: number, role: string) => {
        const user = users.find((u) => u.id === id);
        if (user) {
            setSelectedUser(user);

            accountAxiosWithToken.get(`/admin/user?uid=${id}&role=${role.toLowerCase()}`)
                .then(response => {
                    console.log(response.data)
                    setSelectedUserData(response.data);
                    setOpenDialog(true);
                })
                .catch(() => {
                    setOpenDialog(true);
                });
        }
    };

    const handleDelete = (id: number) => {
        accountAxiosWithToken.delete(`/admin/user?uid=${id}`)
            .then(() => {
                setUsers(users.filter((user) => user.id !== id));
                showSuccess(t('userManagement.deleteSuccess'));
            })
            .catch(() => {
                showError(t('userManagement.deleteError'));
            });
    };

    const userColumns: GridColDef[] = [
        {field: 'account_id', headerName: t('userManagement.id'), width: 70},
        {
            field: 'full_name',
            headerName: t('userManagement.fullName'),
            flex: 1,
            minWidth: 200,
        },
        {field: 'account_email', headerName: t('userManagement.email'), flex: 1, minWidth: 250},
        {
            field: 'role_name',
            headerName: t('userManagement.role'),
            flex: 1,
            minWidth: 200,
            renderCell: (params) => {
                const role = params.value?.toLowerCase() || '';
                let icon = null;
                let color = theme.palette.primary.main;

                switch (role) {
                    case 'attendee':
                        icon = <VerifiedUserIcon sx={{mr: 1}} color="info"/>;
                        color = theme.palette.info.main;
                        break;
                    case 'host':
                        icon = <EventIcon sx={{mr: 1}} color="warning"/>;
                        color = theme.palette.warning.main;
                        break;
                    case 'admin':
                        icon = <AdminPanelSettingsIcon sx={{mr: 1}} color="error"/>;
                        color = theme.palette.error.main;
                        break;
                }

                return (
                    <Stack direction="row" alignItems="center">
                        {icon}
                        <Typography sx={{color, fontWeight: 'medium'}}>
                            {t(`userManagement.${role}`)}
                        </Typography>
                    </Stack>
                );
            }
        },
        {
            field: 'account_status',
            headerName: t('userManagement.status'),
            minWidth: 200,
            renderCell: (params) => {
                const status = params.value?.toLowerCase() || '';
                const isActive = status === 'verified' || status === 'true';

                return (
                    <Chip
                        icon={isActive ? <CheckCircleIcon/> : <BlockIcon/>}
                        label={isActive ? t('userManagement.active') : t('userManagement.inactive')}
                        color={isActive ? 'success' : 'default'}
                        size="small"
                        sx={{
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            '& .MuiChip-icon': {fontSize: 16}
                        }}
                    />
                );
            }
        },
        {
            field: 'actions',
            headerName: t('userManagement.actions'),
            minWidth: 200,
            renderCell: (params) => {
                const role = params.row.role_name?.toLowerCase() || '';

                return (
                    <Stack direction="row" spacing={1}>
                        <Tooltip title={t('userManagement.edit')}>
                            <IconButton
                                color="primary"
                                onClick={() => handleEdit(params.row.id, role)}
                            >
                                <EditIcon />
                            </IconButton>
                        </Tooltip>

                        {role === 'host' && (
                            <Tooltip title={t('userManagement.events')}>
                                <IconButton>
                                    <VisibilityIcon />
                                </IconButton>
                            </Tooltip>
                        )}

                        <Tooltip title={t('userManagement.delete')}>
                            <IconButton
                                color="error"
                                onClick={() => handleDelete(params.row.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                );
            },
        },
    ];

    const handleSaveUser = (formData: any) => {
        const isUpdate = selectedUser != null;

        const requestData = {
            accountId: formData.account_id,
            profileId: formData.profile_id,
            userDataId: formData.user_data_id,
            accountEmail: formData.account_email,
            roleName: formData.role_name,
            fullName: formData.full_name,
            dateOfBirth: formData.date_of_birth,
            gender: formData.gender,
            phoneNumber: formData.phone_number,
            nationality: formData.nationality,
            accountStatus: formData.account_status,
            profileName: formData.profile_name || "",
            description: formData.description || "",
            profileImageUrl: formData.profile_image_url,
            emailOptIn: formData.email_opt_in,
            socialMediaLinks: formData.social_media_links || [],
            customUrl: formData.custom_url || "",
            totalFollowers: formData.total_followers || 0,
            totalAttendeeHosted: formData.total_attendee_hosted || 0,
            totalEventHosted: formData.total_event_hosted || 0,
            notifyPreferences: formData.notify_preferences,
            authorities: formData.authorities || ''
        };

        const apiCall = isUpdate
            ? accountAxiosWithToken.put(`/admin/user?uid=${selectedUser.account_id}&pid=${selectedUser.profile_id}`, requestData)
            : accountAxiosWithToken.post('/admin/user', requestData);

        apiCall
            .then(response => {
                if (isUpdate) {
                    setUsers(users.map(user =>
                        user.id === selectedUser.id
                            ? {...user, ...formData}
                            : user
                    ));
                } else {
                    const newUser = {
                        ...formData,
                        id: response.data?.accountId || Math.max(...users.map(u => u.id), 0) + 1,
                    };
                    setUsers([...users, newUser]);
                }

                setOpenDialog(false);
                showSuccess(t('userManagement.updateSuccess'));
            })
            .catch(error => {
                console.error(isUpdate ? "Error updating user:" : "Error creating user:", error);
                showError(t('userManagement.updateError'));
            });
    };

    return (
        <Box sx={{height: '100%', width: '100%'}}>
            <Paper sx={{p: 3}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h2">
                        {t('userManagement.title')}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                            {t('userManagement.totalUsers')}:
                        </Typography>
                        <Chip
                            label={totalUsers}
                            color="primary"
                            size="small"
                            sx={{fontWeight: 'bold'}}
                        />
                    </Stack>
                </Stack>
                <Box sx={{height: 600, width: '100%'}}>
                    <DataGrid
                        localeText={getLocale().components.MuiDataGrid.defaultProps.localeText}
                        rows={users}
                        columns={userColumns}
                        paginationModel={paginationModel}
                        onPaginationModelChange={handlePaginationModelChange}
                        pageSizeOptions={[5, 10, 25, 50]}
                        paginationMode="server"
                        rowCount={totalUsers}
                        disableRowSelectionOnClick
                        getRowClassName={(params) =>
                            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
                        }
                        sx={{
                            '& .MuiDataGrid-cell': {
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center'
                            }
                        }}
                    />
                </Box>
            </Paper>
            <UserFormDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={handleSaveUser}
                user={selectedUserData || selectedUser}
            />
        </Box>
    );
}