

import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Icon from "../AppIcon";
import Button from "./Button";

const Header = ({ userName = "User", onLogout, testMode = false }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleName = sessionStorage.getItem("roleName") || "SAS";
  const cleanRole = roleName.trim().toUpperCase();

  const managerRoles = ["MANAGER", "CEO", "CTO", "HR","PM","TL"];
  const traineeRoles = ["SAS", "AS", "ACC", "JA", "SA"];

  const normalizedRole = useMemo(() => {
    if (managerRoles.includes(cleanRole)) return "manager";
    if (traineeRoles.includes(cleanRole)) return "trainee";
    return "trainee";
  }, [cleanRole]);

  const navigationItems = [
    { label: "Dashboard", path: normalizedRole==="manager"?"/manager-dashboard":"/trainee-dashboard", icon: "LayoutDashboard", roles:["trainee","manager"] },
    { label: "Learning", path: "/syllabus-content-viewer", icon: "BookOpen", roles:["trainee"] },
    { label: "Test", path: "/trainee-assessment-list", icon: "BookOpen", roles:["trainee"] },
    { label: "Assessment", path: "/assessment-entry", icon: "ClipboardCheck", roles: cleanRole==="TL"?["manager"]:[] },
    { label: "Interviews", path: "/interview-scheduling", icon: "Calendar", roles: ["manager"] },
    { label: "Syllabus", path: "/upload-syllabus", icon: "BookOpen", roles: ["manager"] },
    { label: "Approval", path: "/trainee-steps", icon: "CheckCircle", roles: ["manager"] },
    { label: "Department", path: "/department", icon: "Building", roles: ["manager"] },
    { label: "Assign Trainee", path: "/assign-trainee", icon: "UserPlus", roles: ["manager"] },
    { label: "Assessment Test", path: "/create-question", icon: "FileText", roles: ["manager"] },
     { label: "Test Check", path: "/check-page", icon: "ClipboardCheck", roles: ["manager"] },
      { label: "Trainee Report", path: "/trainee-report", icon: "ClipboardCheck", roles: ["manager"] },
  ];

  //const visibleNavItems = navigationItems.filter((item) => item.roles.includes(normalizedRole));

   const visibleNavItems = navigationItems?.filter(item =>
     item?.roles?.includes(normalizedRole)
   )?.slice(0,12);

  const handleNavigation = (path) => { if(!testMode) navigate(path); setIsMobileMenuOpen(false); };
  const handleLogoutClick = () => { setIsProfileOpen(false); if(onLogout) onLogout(); };
  const isActivePath = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-surface border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="GraduationCap" size={20} color="white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">TMS</h1>
            <p className="text-xs text-foreground">Trainee Management</p>
          </div>
        </div>

        {/* Desktop */}
        {/* <nav className="hidden lg:flex items-center space-x-1"> */}
        <nav className="hidden lg:flex items-center space-x-1 overflow-x-auto no-scrollbar scroll-smooth">
          {visibleNavItems.map((item) => {
           const disabledDuringTest = testMode && ["Dashboard", "Learning"].includes(item.label)
            return (
              <Button
  key={item.path}
  variant={isActivePath(item.path) ? "default" : "ghost"}
  size="sm"
  onClick={() => !disabledDuringTest && handleNavigation(item.path)}
  iconName={item.icon}
  iconPosition="left"
  iconSize={16}
  className={`px-4 ${disabledDuringTest ? "opacity-50 cursor-not-allowed" : ""}`}
  disabled={disabledDuringTest}
>
  {item.label}
</Button>
            )
          })}
        </nav>

        {/* Profile */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}
            iconName={isMobileMenuOpen?"X":"Menu"}
            iconSize={20}
          />
          <div className="relative">
            <Button variant="ghost" size="sm" onClick={()=>setIsProfileOpen(!isProfileOpen)} className="flex items-center space-x-2 px-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white"/>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-foreground">{userName}</p>
                <p className="text-xs text-foreground capitalize">{roleName}</p>
              </div>
              <Icon name="ChevronDown" size={16}/>
            </Button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{roleName}</p>
                  </div>
                  <button onClick={handleLogoutClick} className="w-full px-4 py-2 text-left text-sm text-error hover:bg-muted">
                    <Icon name="LogOut" size={16} className="inline mr-2"/>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-surface border-t border-border">
          <nav className="px-6 py-4 space-y-2">
            {visibleNavItems.map((item)=>{
              const disabledDuringTest = testMode && ["Dashboard","Learning"].includes(item.label);
              return (
                <Button
                  key={item.path}
                  variant={isActivePath(item.path)?"default":"ghost"}
                  size="sm"
                  onClick={()=>!disabledDuringTest && handleNavigation(item.path)}
                  iconName={item.icon}
                  iconPosition="left"
                  iconSize={16}
                  fullWidth
                  className={`justify-start ${disabledDuringTest?"opacity-50 cursor-not-allowed":""}`}
                  disabled={disabledDuringTest}
                >
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
};

export default Header;