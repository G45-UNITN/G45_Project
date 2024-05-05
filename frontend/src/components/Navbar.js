import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {sideBarData} from "./sideBar";
import "../index.css";
import {IconContext} from "react-icons"; // Modifica qui: importa IconContext da "react-icons"
import {FaBars} from 'react-icons/fa';
import {IoLogOutSharp} from "react-icons/io5";
import {logoutUser} from "../auth/actions/userActions";


function Navbar() {
    const [sidebar, setSidebar] = useState(false);
    const navigate = useNavigate();

    const showSidebar = () => setSidebar(!sidebar);

    return (

        <>
            <IconContext.Provider value={{color: "undefined"}}>
                <div className="navbar">
                    <Link to="#" className="menu-bars">
                        <FaBars onClick={showSidebar}/>
                    </Link>
                </div>
                <nav className={sidebar ? "nav-menu active" : "nav-menu"}>
                    <ul className="nav-menu-items" onClick={showSidebar}>
                        <li className="navbar-toggle">
                        </li>
                        {sideBarData.map((item, index) => {
                            return (
                                <li key={index} className={item.cName}>
                                    <Link to={item.path} onClick={window.location.reload}>
                                        {item.icon}
                                        <span>{item.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <div className="logout-icon" onClick={logoutUser(navigate)}>
                        <IoLogOutSharp color={"white"} />
                    </div>
                </nav>
            </IconContext.Provider>
        </>

    )
}

export default Navbar;
