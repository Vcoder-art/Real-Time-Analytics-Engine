import VisionEye from "../assets/icons-eye.png";
import { IoSettingsOutline } from "react-icons/io5";
import { useSelector, useDispatch } from "react-redux";
import { openSettings } from "../features/slices/authSlice";
import { NavLink } from "react-router-dom";

function Header() {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const linkBase = "text-sm cursor-pointer transition-colors";
    const activeLink = "text-white border-b-2 border-white pb-1";
    const inactiveLink = "text-gray-400 hover:text-white";

    return (
        <header className="px-4 bg-gray-900/70 border-gray-800  backdrop-blur-md py-4 border-b">
            <div className="flex justify-between items-center">

                <NavLink
                    to="/">
                    <h3 className="text-2xl font-semibold flex items-center gap-2" >
                        <img width={50} height={50} src={VisionEye} alt="logo" />
                        Vision Pro
                    </h3>
                </NavLink>

                <nav className="flex items-center gap-6">
                    <NavLink
                        to="/meeting-room"
                        className={({ isActive }) =>
                            `${linkBase} ${isActive ? activeLink : inactiveLink}`
                        }
                    >
                        Chat Room
                    </NavLink>

                    <NavLink
                        to="/employees"
                        className={({ isActive }) =>
                            `${linkBase} ${isActive ? activeLink : inactiveLink}`
                        }
                    >
                        Employees
                    </NavLink>

                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `${linkBase} ${isActive ? activeLink : inactiveLink}`
                        }
                    >
                        Dashboard
                    </NavLink>

                    <span className="text-sm text-gray-400">
                        {user?.user?.email || "Anonymous"}
                    </span>

                    <IoSettingsOutline
                        size={22}
                        className="cursor-pointer hover:text-white"
                        onClick={() => dispatch(openSettings())}
                    />
                </nav>
            </div>
        </header>
    );
}

export default Header;
