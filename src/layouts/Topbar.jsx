import React from "react";
import { Link } from "react-router-dom";

import MaximizeScreen from "@/components/MaximizeScreen";
import ProfileDropdown from "@/components/ProfileDropdown";
import profilePic from "@/assets/images/users/user-1.jpg";
import logoSm from "@/assets/images/logo-sm.png";
import logoDark from "@/assets/images/logo-dark.png";
import logoDark2 from "@/assets/images/logo-dark-2.png";
import logoLight from "@/assets/images/logo-light.png";
import logoLight2 from "@/assets/images/logo-light-2.png";
import { useViewport } from "@/hooks/useViewPort";
import { useLayoutContext } from "@/context/useLayoutContext.jsx";
import { useAuthContext } from "@/context/useAuthContext.jsx";
import { toggleDocumentAttribute } from "@/utils";

// get the profilemenu
const ProfileMenus = [
{
  label: "Logout",
  icon: "fe-log-out",
  redirectTo: "/auth/logout"
}];
const Topbar = ({
  hideLogo,
  navCssClasses
}) => {
  const {
    width
  } = useViewport();
  const {
    menu,
    orientation,
    changeMenuSize,
    themeCustomizer
  } = useLayoutContext();
  const { user } = useAuthContext();
  const navbarCssClasses = navCssClasses || "";
  const containerCssClasses = !hideLogo ? "container-fluid" : "";
  const adminName = user?.name || "Ajith";
  const adminRole = user?.role ? `${user.role}` : "Admin";

  /**
   * Toggle the leftmenu when having mobile screen
   */
  const handleLeftMenuCallBack = () => {
    if (width < 1140) {
      if (menu.size === 'full') {
        showLeftSideBarBackdrop();
        toggleDocumentAttribute("class", "sidebar-enable");
      } else {
        changeMenuSize('full');
      }
    } else if (menu.size === "condensed") {
      changeMenuSize('default');
    } else if (menu.size === 'full') {
      showLeftSideBarBackdrop();
      toggleDocumentAttribute("class", "sidebar-enable");
    } else if (menu.size === 'fullscreen') {
      changeMenuSize('default');
      toggleDocumentAttribute("class", "sidebar-enable");
    } else {
      changeMenuSize('condensed');
    }
  };

  // create backdrop for leftsidebar
  function showLeftSideBarBackdrop() {
    const backdrop = document.createElement("div");
    backdrop.id = "custom-backdrop";
    backdrop.className = "offcanvas-backdrop fade show";
    document.body.appendChild(backdrop);
    if (document.getElementsByTagName("html")[0]?.getAttribute("dir") !== "rtl") {
      document.body.style.overflow = "hidden";
      if (width > 1140) {
        document.body.style.paddingRight = "15px";
      }
    }
    backdrop.addEventListener("click", function () {
      toggleDocumentAttribute("class", "sidebar-enable", true);
      changeMenuSize('full');
      hideLeftSideBarBackdrop();
    });
  }
  function hideLeftSideBarBackdrop() {
    const backdrop = document.getElementById("custom-backdrop");
    if (backdrop) {
      document.body.removeChild(backdrop);
      document.body.style.overflow = "visible";
    }
  }
  return <React.Fragment>
            <div className={`navbar-custom ${navbarCssClasses}`}>
                <div className={`topbar ${containerCssClasses}`}>
                    <div className="topbar-menu d-flex align-items-center gap-1">
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

                        <button className="button-toggle-menu" onClick={handleLeftMenuCallBack}>
                            <i className="mdi mdi-menu" />
                        </button>

                        <div className="admin-topbar-intro d-none d-lg-flex flex-column ms-2">
                            <span className="admin-topbar-label">Sri Ayini Commerce Console</span>
                            <span className="admin-topbar-subtitle">Single-admin control center for orders, products, and customers</span>
                        </div>
                    </div>

                    <ul className="topbar-menu d-flex align-items-center">
                        <li className="dropdown d-none d-lg-inline-block">
                            <MaximizeScreen />
                        </li>

                        <li className="d-none d-md-inline-flex align-items-center">
                            <span className="admin-status-pill">
                              <span className="admin-status-dot"></span>
                              {adminRole}
                            </span>
                        </li>
                        <li className="dropdown">
                            <ProfileDropdown profilePic={profilePic} menuItems={ProfileMenus} username={adminName} userTitle={"Single Admin"} />
                        </li>
                        <li>
                            <button className="nav-link dropdown-toggle right-bar-toggle waves-effect waves-light btn btn-link shadow-none" onClick={themeCustomizer.toggle}>
                                <i className="fe-settings noti-icon font-22"></i>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </React.Fragment>;
};
export default Topbar;
