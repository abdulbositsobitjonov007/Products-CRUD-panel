import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"

function Layout({ setAuth }) {
    return (
        <div>
            <Sidebar setAuth={setAuth} />
            <main className="pl-65">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout