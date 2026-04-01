import React, { useEffect, useRef, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import SimpleBar from "simplebar-react";
import { getMenuItems } from "@/helpers/menu";

// components
import AppMenu from "./Menu";
import profileImg from "@/assets/images/users/user-1.jpg";
import logoSm from "@/assets/images/logo-sm.png";
import logoDark from "@/assets/images/logo-dark.png";
import logoDark2 from "@/assets/images/logo-dark-2.png";
import logoLight from "@/assets/images/logo-light.png";
import logoLight2 from "@/assets/images/logo-light-2.png";
import { FiLogOut } from "react-icons/fi";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { useAuthContext } from "@/context/useAuthContext.jsx";

/* user box */
const UserBox = () => {
  const ProfileMenus = [{
    label: "Logout",
    icon: FiLogOut,
    redirectTo: "/auth/logout"
  }];
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user } = useAuthContext();
  const adminName = user?.name || "Ajith";
  const adminRole = user?.role || "Admin";
  const adminContact = user?.email || user?.phone || "Single-admin access";

  /*
   * toggle dropdown
   */
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  return <div className="user-box text-center">
            <div className="user-box-avatar-wrap">
              <img src={profileImg} alt="" title={adminName} className="rounded-circle avatar-md" />
              <span className="user-box-badge">Live</span>
            </div>
            <Dropdown show={dropdownOpen} onToggle={toggleDropdown}>
                <Dropdown.Toggle id="dropdown-notification" as="a" onClick={toggleDropdown} className="cursor-pointer text-dark h5 mt-2 mb-1 d-block">
                    {adminName}
                </Dropdown.Toggle>
                <Dropdown.Menu className="user-pro-dropdown">
                    <div onClick={toggleDropdown}>
                        {(ProfileMenus || []).map((item, index) => {
            const Icon = item.icon;
            return <Link to={item.redirectTo} className="dropdown-item notify-item" key={index + "-profile-menu"}>
                                    <Icon className="me-1" />
                                    <span>{item.label}</span>
                                </Link>;
          })}
                    </div>
                </Dropdown.Menu>
            </Dropdown>
            <p className="text-muted mb-1">{adminRole}</p>
            <p className="text-muted small user-box-contact">{adminContact}</p>
        </div>;
};

/* sidebar content */
const SideBarContent = () => {
  return <>
            <UserBox />

            {/* <div id="sidebar-menu"> */}
            <AppMenu menuItems={getMenuItems()} />
            {/* </div> */}

            <div className="clearfix" />
        </>;
};
const LeftSidebar = ({
  isCondensed,
  hideLogo
}) => {
  const menuNodeRef = useRef(null);
  const {
    orientation
  } = useLayoutContext();

  /**
   * Handle the click anywhere in doc
   */
  const handleOtherClick = e => {
    if (menuNodeRef && menuNodeRef.current && menuNodeRef.current.contains(e.target)) return;
    // else hide the menubar
    if (document.body) {
      document.body.classList.remove("sidebar-enable");
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleOtherClick, false);
    return () => {
      document.removeEventListener("mousedown", handleOtherClick, false);
    };
  }, []);
  return <React.Fragment>
            <div className="app-menu" ref={menuNodeRef}>
                {!hideLogo && <div className="logo-box">
                        <Link to="/" className="logo logo-dark text-center">
              <span className="logo-sm">
                <img src={logoSm} alt="" height="22" />
              </span>
                            <span className="logo-lg">
                <img src={orientation === 'two-column' ? logoDark2 : logoDark} alt="" height="20" />
              </span>
                        </Link>
                        <Link to="/" className="logo logo-light text-center">
              <span className="logo-sm">
                <img src={logoSm} alt="" height="22" />
              </span>
                            <span className="logo-lg">
                <img src={orientation === 'two-column' ? logoLight2 : logoLight} alt="" height="20" />
              </span>
                        </Link>
                    </div>}

                {!isCondensed && <SimpleBar className="scrollbar show h-100" scrollbarMaxSize={320}>
                        <SideBarContent />
                    </SimpleBar>}
                {isCondensed && <SideBarContent />}
            </div>
        </React.Fragment>;
};
LeftSidebar.defaultProps = {
  isCondensed: false
};
export default LeftSidebar;
