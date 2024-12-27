import {Outlet} from "react-router-dom";
import '../styles/user-collect-data-template-styles.css'

function UserCollectDataTemplate(){
    return (
        <div className={'user-collect-data-template-container'}>
            {/* TODO: should replace a dedicated navigation for user collect data instead of default navigation */}
            {/*<TopNav />*/}
            <div className={'user-collect-data-outlet-wrapper'}>
                <Outlet />
            </div>
        </div>
    )
}

export default UserCollectDataTemplate