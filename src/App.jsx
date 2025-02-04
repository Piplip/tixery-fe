import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AttendeeHome from "./component/attendee/AttendeeHome.jsx";
import LoginSignUp from "./component/shared/LoginSignUp.jsx";
import VerifyAccountSuccess from "./component/shared/VerifyAccountSuccess.jsx";
import VerifyAccountFailed from "./component/shared/VerifyAccountFailed.jsx";
import SelectRole from "./component/shared/SelectRole.jsx";
import UserCollectDataTemplate from "./component/template/UserCollectDataTemplate.jsx";
import AttendeeCollectnfo from "./component/attendee/AttendeeCollectnfo.jsx";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import OrganizerCollectInfo from "./component/organizer/OrganizerCollectInfo.jsx";
import OrganizerOverview from "./component/organizer/OrganizerOverview.jsx";
import OrganizerTemplate from "./component/template/OrganizerTemplate.jsx";
import OrganizerHome from "./component/organizer/OrganizerHome.jsx";
import OrganizerSettings from "./component/organizer/OrganizerSettings.jsx";
import OrganizerSettingProfile from "./component/organizer/OrganizerSettingProfile.jsx";
import OrganizerViewTemplate from "./component/template/OrganizerViewTemplate.jsx";
import OrganizerView from "./component/organizer/OrganizerView.jsx";
import {accountAxiosWithToken, eventAxios, eventAxiosWithToken} from "./config/axiosConfig.js";
import {checkLoggedIn, getUserData} from "./common/Utilities.js";
import {lazy} from "react";
import LoadingFallback from "./component/shared/LoadingFallback.jsx";
import OrganizerNewProfile from "./component/organizer/OrganizerNewProfile.jsx";
import OrganizerEditProfile from "./component/organizer/OrganizerEditProfile.jsx";
import CreateEvent from "./component/organizer/CreateEvent.jsx";
import OrganizerEvent from "./component/organizer/OrganizerEvent.jsx";
import EventView from "./component/shared/EventView.jsx";
import EventSearch from "./component/shared/EventSearch.jsx";
import RootTemplate from "./component/template/RootTemplate.jsx";
import OnlineEventCreatePanel from "./component/organizer/OnlineEventCreatePanel.jsx";
import AttendeeFavorite from "./component/attendee/AttendeeFavorite.jsx";

function App() {
    const OrganizerBuildEventPage = lazy(() => import('./component/organizer/OrganizerBuildEventPage'))
    const OrganizerCreateTicket = lazy(() => import('./component/organizer/OrganizerCreateTicket'))
    const OrganizerTicketAdmission = lazy(() => import('./component/organizer/OrganizerTicketAdmission'))
    const OrganizerPublishEvent = lazy(() => import('./component/organizer/OrganizerPublishEvent'))

    const routers = createBrowserRouter([
        {path: '/login', element: <LoginSignUp />},
        {path: '/sign-up', element: <LoginSignUp />},
        {path: '/accounts/verify/success', element: <VerifyAccountSuccess />},
        {path: '/accounts/verify/failed', element: <VerifyAccountFailed />},
        {
            path: '/',
            element: <RootTemplate />,
            hydrateFallbackElement: <LoadingFallback />,
            children: [
                {index: true, element: <AttendeeHome />},
                {
                    path: 'events/search', element: <EventSearch />,
                    loader: async () => {
                        const response = await eventAxios.get(`/search?eids=${sessionStorage.getItem('search-ids')}`)
                        return response.data
                    }
                },
                {
                    path: 'favorites', element: <AttendeeFavorite />,
                    loader: async () => {
                        const response = await eventAxiosWithToken.post(`/event/favorite/get`
                            , sessionStorage.getItem('liked-event'))
                        return response.data
                    }
                },
                {
                    path: 'events/:id', element: <EventView />,
                    hydrateFallbackElement: <LoadingFallback />,
                    loader: async ({ params }) => {
                        const searchParams = new URLSearchParams({
                            eid: params.id
                        })
                        if(checkLoggedIn()){
                            searchParams.append('pid', getUserData('profileID'))
                        }
                        const response = await eventAxiosWithToken.get(
                            `/get/specific?${searchParams}`
                        );

                        return response.data;
                    }
                },
            ]
        },
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
            hydrateFallbackElement: <LoadingFallback />,
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
                        {path: 'online', element: <OnlineEventCreatePanel />},
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
                        {index: true, element: <OrganizerBuildEventPage />},
                        {path: 'online', element: <OnlineEventCreatePanel />},
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
                        {path: 'publish', element: <OrganizerPublishEvent />}
                    ]
                }
            ]
        },
        {
            path: '/o',
            element: <OrganizerViewTemplate />,
            hydrateFallbackElement: <LoadingFallback />,
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
    ])

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <RouterProvider router={routers} />
        </LocalizationProvider>
    )
}

export default App
