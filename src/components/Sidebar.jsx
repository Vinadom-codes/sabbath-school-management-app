import { useCallback,useState, useEffect } from "react";
import { ClipLoader } from "react-spinners";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import {FaBookOpen, FaAnglesRight, FaAnglesLeft, FaTableColumns, FaUsers, FaCalendarCheck, FaSchool, FaChartColumn, FaGear, FaUserCheck} from 'react-icons/fa6'
import logo from '../assets/images/adventist-logo.svg'
import Main from "../components/Main"

const API_URLl = "http://localhost:8080/api/v1/users";
const Sidebar = () => {
    const [isToggled, setIsToggled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false);
     const [isLoading, setIsLoading] = useState(true);
     const [students, setStudents] = useState([]);
    
    const fetchStudentss = useCallback(async () => {
        setIsLoading(true);
    
        try {
          const response = await fetch(API_URLl);
          const result = await response.json();
    
          if (!response.ok || result.status === "error") {
            throw new Error(
              result.message || "Failed to fetch students."
            );
          }
    
          const studentList = Array.isArray(result.data)
            ? result.data
            : Array.isArray(result)
              ? result
              : [];
          setStudents(studentList);
       
        } catch (error) {
          toast.error(error.message || "Could not load students.");
        } finally {
          setIsLoading(false);
        }
      }, []);
      useEffect(() => {
        fetchStudentss();
      }, [fetchStudentss]);
    
 
 
// Desktop sidebar expansion
const hideSidebar = () => {
  setIsToggled((prevState) => !prevState);
};

// Mobile sidebar opening and closing
const toggleMobileSidebar = () => {
  setMobileOpen((prevState) => !prevState);
};

const closeMobileSidebar = () => {
  setMobileOpen(false);
};

  return (

    <> 
    <aside id="sidebar" className={`${isToggled ? "expanded" : "collapsed"} ${mobileOpen ? "mobile-open" : ""} sidebar fixed inset-y-0 left-0 z-40 flex flex-col bg-navy text-white `}>
      <div className="flex items-center gap-3 p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15">
           <img src={logo}  />
        </div>
        <div className="brand-copy">
          <b className="text-sm">Sabbath School</b>
          <p className="text-xs text-blue-100/70">Administration</p>
        </div>
       {mobileOpen ? ("") : (<button onClick={hideSidebar} id="toggleSidebar" className="sidebar-toggle ml-auto rounded-lg p-2 hover:bg-white/10" title="Expand or collapse sidebar" aria-label="Expand or collapse sidebar" aria-expanded={`${isToggled ? "true" : "false"}`}> {isToggled ? <FaAnglesLeft aria-expanded="true" /> :  <FaAnglesRight aria-hidden="true" />} 
        </button>)} 
      </div>
      <nav className="sidebar-nav flex-1 space-y-1 px-3">
        <p className="nav-section px-3 pb-2 pt-4 text-[10px] uppercase tracking-widest text-blue-100/50">
          Workspace</p>
        
        <NavLink to="/"  onClick={closeMobileSidebar} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} ><FaTableColumns/>  <span>Dashboard</span></NavLink>

        <NavLink to="/students"  onClick={closeMobileSidebar} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} ><FaUsers /><span>Students</span><small>{students.length}</small></NavLink>
        
        <NavLink to="/class"  onClick={closeMobileSidebar} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} ><FaSchool /><span>Classes & Teachers </span></NavLink>

        {/* <NavLink to="/attendance"  onClick={closeMobileSidebar} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><FaCalendarCheck /><span>Attendance</span></NavLink>
        <NavLink to="/attendance"  onClick={closeMobileSidebar} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}><FaCalendarCheck /><span>Attendance</span></NavLink>


        <NavLink to="/reports"  onClick={closeMobileSidebar} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"} ><FaChartColumn /><span>Reports</span></NavLink> */}

        <p className="nav-section px-3 pb-2 pt-6 text-[10px] uppercase tracking-widest text-blue-100/50">
        Manage</p>


        <a role="/settings" aria-disabled="true" onClick={closeMobileSidebar} className="nav-link"><FaGear /><span>Settings</span></a>
        {/* <NavLink to="/settings"  onClick={closeMobileSidebar} className="nav-link"><FaGear /><span>Settings</span></NavLink> */}
      </nav>

      <div className="brand-copy m-3 rounded-xl border border-white/10 bg-white/5 p-3 text-xs">
        <b>Happy Sabbath!!</b>
        <p className="mt-2 text-blue-100/60">Remember to keep it <span className="text-white text-[16px]">Holy</span>!!</p>
      </div>
    </aside>
    
    {mobileOpen && (<div id="scrim" className="scrim visible" onClick={closeMobileSidebar}></div>)}
    

   <Main onMenuClick={toggleMobileSidebar} />
   </> 
  )
}

export default Sidebar
