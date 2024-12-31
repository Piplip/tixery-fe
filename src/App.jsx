import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AttendeeHome from "./component/attendee/AttendeeHome.jsx";
import LoginSignUp from "./component/LoginSignUp.jsx";
import VerifyAccountSuccess from "./component/VerifyAccountSuccess.jsx";
import VerifyAccountFailed from "./component/VerifyAccountFailed.jsx";
import SelectRole from "./component/SelectRole.jsx";
import UserCollectDataTemplate from "./component/UserCollectDataTemplate.jsx";
import AttendeeCollectnfo from "./component/attendee/AttendeeCollectnfo.jsx";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import OrganizerCollectInfo from "./component/OrganizerCollectInfo.jsx";
import OrganizerOverview from "./component/organizer/OrganizerOverview.jsx";
import OrganizerTemplate from "./component/organizer/OrganizerTemplate.jsx";
import OrganizerHome from "./component/organizer/OrganizerHome.jsx";
import OrganizerSettings from "./component/organizer/OrganizerSettings.jsx";
import OrganizerSettingProfile from "./component/organizer/OrganizerSettingProfile.jsx";

function App() {
    const routers = createBrowserRouter([
        {path: '/', element: <AttendeeHome />},
        {path: '/login', element: <LoginSignUp />},
        {path: '/sign-up', element: <LoginSignUp />},
        {path: '/accounts/verify/success', element: <VerifyAccountSuccess />},
        {path: '/accounts/verify/failed', element: <VerifyAccountFailed />},
        {
            path: '/u/interests',
            element: <UserCollectDataTemplate />,
            children: [
                {index: true, element: <SelectRole />},
                {path: 'info', element: <AttendeeCollectnfo />},
                {path: 'organizer/info', element: <OrganizerCollectInfo />},
            ]
        },
        {
            path: '/organizer/overview',
            children: [
                {index: true, element: <OrganizerOverview />}
            ]
        },
        {
            path: '/organizer',
            element: <OrganizerTemplate />,
            children: [
                {index: true, element: <OrganizerHome />},
                {
                    path: 'u',
                    element: <OrganizerSettings />,
                    children: [
                        {index: true, element: <OrganizerSettingProfile />}
                    ]
                }
            ]
        }
    ])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RouterProvider router={routers} />
        </LocalizationProvider>
    )
}

export default App
