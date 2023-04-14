import React, { useState, useEffect } from 'react';
import { Link,useParams } from 'react-router-dom';


import styles from '../../../styles/Sidebar.module.css';
import { BiFoodMenu} from "react-icons/bi";
import { FiSettings} from "react-icons/fi";
import { MdFoodBank} from "react-icons/md";
import { CgLogOut} from "react-icons/cg";
import { AiFillDashboard,} from "react-icons/ai";



function capitalizeString(str) {//to captalize the name
  return str.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}
function Sidebar(props) {
  const isLoggedIn = props.loggedIn;
  const [name, setName] = useState('');
  const { customerId } = useParams();

  useEffect(() => {
    // Fetch data from the server
    fetch(`http://ec2-50-17-11-178.compute-1.amazonaws.com/api/CustomerSettings`)
      .then((response) => response.json())
      .then((data) => {
        const name = `${data.first_name}`;
        setName(name);
      })
      .catch((error) => console.error(error));
  
  }, []);
  
  
  const handleLogout = async () => {
    try {
      const response = await fetch('http://ec2-50-17-11-178.compute-1.amazonaws.com/api/CustomerLogout', {
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
                <AiFillDashboard className={styles.nav_icon} />
                <Link to={`/CustomerManage/${customerId}`} className={styles.nav_link}>Dashboard</Link>
            </li>

            <li className={styles.nav_line}>
                <AiFillDashboard className={styles.nav_icon} />
                <Link to={`/CustomerMealMatcher/${customerId}`} className={styles.nav_link}>Matcher</Link>
            </li>

            <li className={styles.nav_line}>
                <AiFillDashboard className={styles.nav_icon} />
                <Link to={`/CustomerExplore/${customerId}`} className={styles.nav_link}>Explore</Link>
            </li>

            <li className={styles.nav_line}>
                <MdFoodBank className={styles.nav_icon} />
                <Link to={`/MyOrders/${customerId}`} className={styles.nav_link}>My Orders</Link>
            </li>

            <li className={styles.nav_line}>
                <BiFoodMenu className={styles.nav_icon} />
                <Link to={`/Customerbilling/${customerId}`} className={styles.nav_link}>Billing Information</Link>
            </li>

            <li className={styles.nav_line}>
                <FiSettings className={styles.nav_icon} />
                <Link to={`/CustomerSettings/${customerId}`} className={styles.nav_link}>Settings</Link>
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
