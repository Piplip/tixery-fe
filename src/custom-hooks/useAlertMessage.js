import { useState, useCallback } from 'react';

function useAlertMessage() {
    const [alerts, setAlerts] = useState([]);

    const showAlert = useCallback((message, severity = 'info', duration = 5000) => {
        const id = Date.now();
        setAlerts(prev => [...prev, { id, message, severity, duration }]);

        if (duration !== null) {
            setTimeout(() => {
                closeAlert(id);
            }, duration);
        }

        return id;
    }, []);

    const closeAlert = useCallback((id) => {
        setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, []);

    const showSuccess = useCallback((message, duration) =>
        showAlert(message, 'success', duration), [showAlert]);

    const showError = useCallback((message, duration) =>
        showAlert(message, 'error', duration), [showAlert]);

    const showWarning = useCallback((message, duration) =>
        showAlert(message, 'warning', duration), [showAlert]);

    const showInfo = useCallback((message, duration) =>
        showAlert(message, 'info', duration), [showAlert]);

    return {
        alerts,
        showAlert,
        closeAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo
    };
}

export default useAlertMessage;