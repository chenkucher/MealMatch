import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/Sidebar.css';
import { BiFoodMenu} from "react-icons/bi";
import { AiFillDashboard,} from "react-icons/ai";
import { FaWarehouse,FaHome } from "react-icons/fa";
import { FiSettings} from "react-icons/fi";
import { MdFoodBank} from "react-icons/md";

function Sidebar() {
  return (
    <div className="sidebar">
      <ul className="sidebar-nav">
      <h2>Name of resturant</h2>
        <p>Managment</p>
        <li className='nav-line'>
          <FaHome className='nav-icon'/>
          <Link to="/" className='nav-link'>Home</Link>
        </li>
        <li className='nav-line'>
          <AiFillDashboard className='nav-icon'/>
          <Link to="/Dashboard" className='nav-link'>Dashboard</Link>
        </li>
        <li className='nav-line'>
          <MdFoodBank className='nav-icon'/>
          <Link to="/Orders" className='nav-link'>Orders</Link>
        </li>
        <li className='nav-line'>
          <BiFoodMenu className='nav-icon'/>
          <Link to="/Menu" className='nav-link'>Menu</Link>
        </li>
        <li className='nav-line'>
          <FaWarehouse className='nav-icon'/>
          <Link to="/Inventory" className='nav-link'>Inventory</Link>
        </li>
        <li className='nav-line'>
          <FiSettings className='nav-icon'/> 
          <Link to="/Settings" className='nav-link'>Settings</Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
