import {RouterProvider} from "react-router-dom";
import {Suspense} from "react";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {configureDayjs} from "./common/Utilities.js";
import LoadingFallback from "./component/shared/LoadingFallback.jsx";
import "./config/i18nConfig.js";
import {AlertProvider} from "./component/shared/AlertProvider.jsx";
import NavigationTracker from "./component/shared/NavigationTracker.js";
import routers from "./router.jsx";

configureDayjs()
// dayjs().tz(Intl.DateTimeFormat().resolvedOptions().timeZone)

function App() {
    return (
        <AlertProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <RouterProvider router={routers}>
                    <Suspense fallback={<LoadingFallback />}>
                        <NavigationTracker />
                    </Suspense>
                </RouterProvider>
            </LocalizationProvider>
        </AlertProvider>
    )
}

export default App
