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
import OrganizerCollectInfo from "./component/organizer/OrganizerCollectInfo.jsx";
import OrganizerOverview from "./component/organizer/OrganizerOverview.jsx";
import OrganizerTemplate from "./component/organizer/OrganizerTemplate.jsx";
import OrganizerHome from "./component/organizer/OrganizerHome.jsx";
import OrganizerSettings from "./component/organizer/OrganizerSettings.jsx";
import OrganizerSettingProfile from "./component/organizer/OrganizerSettingProfile.jsx";
import OrganizerViewTemplate from "./component/organizer/OrganizerViewTemplate.jsx";
import OrganizerView from "./component/organizer/OrganizerView.jsx";
import {accountAxiosWithToken} from "./config/axiosConfig.js";
import {getUserData} from "./common/Utilities.js";
import {Suspense} from "react";
import LoadingFallback from "./component/LoadingFallback.jsx";
import OrganizerNewProfile from "./component/organizer/OrganizerNewProfile.jsx";
import OrganizerEditProfile from "./component/organizer/OrganizerEditProfile.jsx";

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
                {
                    index: true,
                    element: <OrganizerHome />,
                },
                {
                    path: 'u',
                    element: <OrganizerSettings />,
                    children: [
                        {index: true, element: <OrganizerSettingProfile />,
                            loader: () => accountAxiosWithToken.get('/organizer/profile?u=' + getUserData("sub"))
                        }
                    ]
                },
                {path: 'profile/info', element: <OrganizerNewProfile />},
                {
                    path: 'profile/info/:id', element: <OrganizerEditProfile />,
                    loader: async ({ params }) => {
                        const profileId = params.id;

                        const response = await accountAxiosWithToken.get(
                            `/organizer/profile/get?pid=${profileId}`
                        );

                        return response.data;
                    },
                }
            ]
        },
        {
            path: '/o',
            element: <OrganizerViewTemplate />,
            children: [
                {
                    path: ':name', element: <OrganizerView />,
                    loader: async ({ params }) => {
                        const organizerName = params.name;

                        const response = await accountAxiosWithToken.get(
                            `/organizer/profile/get?pid=${organizerName}`
                        )

                        return response.data;
                    },
                }
            ]
        }
    ])

    return (
        <Suspense fallback={<LoadingFallback />}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <RouterProvider router={routers} />
            </LocalizationProvider>
        </Suspense>
    )
}

export default App
