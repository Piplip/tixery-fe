import {createBrowserRouter, RouterProvider} from "react-router-dom";
import AttendeeHome from "./component/AttendeeHome.jsx";
import LoginSignUp from "./component/LoginSignUp.jsx";
import VerifyAccountSuccess from "./component/VerifyAccountSuccess.jsx";
import VerifyAccountFailed from "./component/VerifyAccountFailed.jsx";
import SelectRole from "./component/SelectRole.jsx";
import UserCollectDataTemplate from "./component/UserCollectDataTemplate.jsx";
import AttendeeCollectnfo from "./component/AttendeeCollectnfo.jsx";

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
                {path: 'info', element: <AttendeeCollectnfo />}
            ]
        }
    ])

    return <RouterProvider router={routers} />
}

export default App
