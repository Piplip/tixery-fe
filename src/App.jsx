import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AttendeeHome from "./component/attendee/AttendeeHome.jsx";
import LoginSignUp from "./component/shared/LoginSignUp.jsx";
import VerifyAccountSuccess from "./component/shared/VerifyAccountSuccess.jsx";
import VerifyAccountFailed from "./component/shared/VerifyAccountFailed.jsx";
import SelectRole from "./component/shared/SelectRole.jsx";
import UserCollectDataTemplate from "./component/shared/UserCollectDataTemplate.jsx";
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
import {accountAxiosWithToken, eventAxiosWithToken} from "./config/axiosConfig.js";
import {getUserData} from "./common/Utilities.js";
import {lazy, Suspense} from "react";
import LoadingFallback from "./component/shared/LoadingFallback.jsx";
import OrganizerNewProfile from "./component/organizer/OrganizerNewProfile.jsx";
import OrganizerEditProfile from "./component/organizer/OrganizerEditProfile.jsx";
import CreateEvent from "./component/organizer/CreateEvent.jsx";
import OrganizerEvent from "./component/organizer/OrganizerEvent.jsx";
import EventView from "./component/shared/EventView.jsx";

function App() {
    const OrganizerBuildEventPage = lazy(() => import('./component/organizer/OrganizerBuildEventPage'))
    const OrganizerCreateTicket = lazy(() => import('./component/organizer/OrganizerCreateTicket'))
    const OrganizerTicketAdmission = lazy(() => import('./component/organizer/OrganizerTicketAdmission'))
    const OrganizerPublishEvent = lazy(() => import('./component/organizer/OrganizerPublishEvent'))

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
                    loader: () => accountAxiosWithToken.get(`/organizer/profile?u=${getUserData('sub')}`)
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
                },
                {
                    path: 'events', element: <OrganizerEvent />,
                    loader: () => eventAxiosWithToken.get('/get?uid=' + getUserData("userID"))
                },
                {
                    path: 'events/:id',
                    element: <CreateEvent />,
                    children: [
                        {index: true, element: <OrganizerBuildEventPage />},
                        {
                            path: 'tickets', element: <OrganizerCreateTicket />,
                            children: [
                                {index: true, element: <OrganizerTicketAdmission />}
                            ]
                        },
                        {path: 'publish', element: <OrganizerPublishEvent />}
                    ]
                },
                {
                    path: 'events/edit/:id',
                    element: <CreateEvent />,
                    loader: ({params}) => eventAxiosWithToken.get('/get/specific?eid=' + params.id),
                    children: [
                        {
                            index: true,
                            element: <OrganizerBuildEventPage />
                        },
                        {
                            path: 'tickets',
                            element: <OrganizerCreateTicket />,
                            children: [
                                {
                                    index: true,
                                    element: <OrganizerTicketAdmission />
                                }
                            ]
                        },
                        {
                            path: 'publish',
                            element: <OrganizerPublishEvent />
                        }
                    ]
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
        },
        {
            path: '/events/:id', element: <EventView />,
            hydrateFallbackElement: <LoadingFallback />,
            loader: async ({ params }) => {
                const eventId = params.id;

                const response = await eventAxiosWithToken.get(
                    `/get/specific?eid=${eventId}`
                );

                return response.data;
            }
        },
    ])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RouterProvider router={routers} />
        </LocalizationProvider>
    )
}

export default App
