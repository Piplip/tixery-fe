import {Alert, Snackbar, Stack} from '@mui/material';
import useAlertMessage from '../../custom-hooks/useAlertMessage.js';
import {AlertContext} from "../../context.js";
import PropTypes from "prop-types";

AlertProvider.propTypes = {
    children: PropTypes.node.isRequired,
}

export function AlertProvider({ children }) {
    const alertUtils = useAlertMessage();

    return (
        <AlertContext.Provider value={alertUtils}>
            {children}
            <Stack spacing={1} sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100000001 }}>
                {alertUtils.alerts.map((alert) => (
                    <Snackbar
                        key={alert.id}
                        open={true}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                        sx={{ transform: 'none', zIndex: 100000001}}
                    >
                        <Alert
                            onClose={() => alertUtils.closeAlert(alert.id)}
                            severity={alert.severity}
                            variant="filled"
                            sx={{ width: '100%' }}
                        >
                            {alert.message}
                        </Alert>
                    </Snackbar>
                ))}
            </Stack>
        </AlertContext.Provider>
    );
}