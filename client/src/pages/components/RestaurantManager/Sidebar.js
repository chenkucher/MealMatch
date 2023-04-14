import React, { useState, useEffect } from 'react';
import { Link,useParams } from 'react-router-dom';
// import { useParams } from 'react-router-dom';

import styles from '../../../styles/Sidebar.module.css';
import { BiFoodMenu} from "react-icons/bi";
import { AiFillDashboard,} from "react-icons/ai";
import { FaWarehouse,FaHome } from "react-icons/fa";
import { FiSettings} from "react-icons/fi";
import { MdFoodBank} from "react-icons/md";
import { CgLogOut} from "react-icons/cg";



function capitalizeString(str) {//to captalize the name
  return str.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
function Sidebar(props) {
  const isLoggedIn = props.loggedIn;
  const [name, setName] = useState('');
  const { restaurantId } = useParams();
  useEffect(() => {
    // Fetch data from the server
    fetch(`http://ec2-50-17-11-178.compute-1.amazonaws.com/api/restaurant/name/${restaurantId}`)
    .then((response) => response.json())
    .then((data) => setName(data.name))
    .catch((error) => console.error(error));
  
  }, [restaurantId]);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('http://ec2-50-17-11-178.compute-1.amazonaws.com/api/SellerLogout', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        // Redirect to homepage after successful logout
        window.location.href = '/';
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  return (
    <div className={styles.sidebar}>
  <ul className={styles.sidebar_nav}>
    <h2>Welcome {capitalizeString(name)}!</h2>
    <li className={styles.nav_line}>
      <FaHome className={styles.nav_icon} />
      <Link to={`/RestaurantManage/${restaurantId}`} className={styles.nav_link}>Dashboard</Link>
    </li>
    {/* <li className={styles.nav_line}>
      <AiFillDashboard className={styles.nav_icon} />
      <Link to="/Statistic" className={styles.nav_link}>Statistic</Link>
    </li> */}
    <li className={styles.nav_line}>
      <MdFoodBank className={styles.nav_icon} />
      <Link to={`/Orders/${restaurantId}`} className={styles.nav_link}>Orders</Link>
    </li>
    <li className={styles.nav_line}>
      <BiFoodMenu className={styles.nav_icon} />
      <Link to={`/MenuManager/${restaurantId}`} className={styles.nav_link}>Menu</Link>
    </li>
    {/* <li className={styles.nav_line}>
      <FaWarehouse className={styles.nav_icon} />
      <Link to="/Storage" className={styles.nav_link}>Storage</Link>
    </li> */}
    <li className={styles.nav_line}>
      <FiSettings className={styles.nav_icon} />
      <Link to={`/Settings/${restaurantId}`} className={styles.nav_link}>Settings</Link>
    </li>
    {isLoggedIn ? <li className={styles.nav_line}>
                          <CgLogOut className={styles.nav_icon} />
                          <Link onClick={() => handleLogout()} className={styles.nav_link}>Logout</Link>
                        </li> : null}
  </ul>
</div>

  );
}

export default Sidebar;
