import { useEffect } from "react";
import { useNavigation, useLocation } from "react-router-dom";

function NavigationTracker() {
    const navigation = useNavigation();
    const location = useLocation();

    useEffect(() => {
        if (navigation.state === "idle") {
            sessionStorage.setItem("lastSuccessfulPath", location.pathname);
        }
    }, [navigation.state, location.pathname]);

    return null;
}

export default NavigationTracker;
