import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from '../../../styles/Sidebar.module.css';
import { BiFoodMenu } from "react-icons/bi";
import { AiFillDashboard } from "react-icons/ai";
import { FiSettings } from "react-icons/fi";
import { MdFoodBank } from "react-icons/md";
import { CgLogOut } from "react-icons/cg";
import { useMediaQuery } from 'react-responsive';
import Dropdown from 'react-bootstrap/Dropdown';

function capitalizeString(str) {
  return str.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function Sidebar(props) {
  const isLoggedIn = props.loggedIn;
  const [name, setName] = useState('');
  let { restaurantId } = useParams();
  restaurantId = restaurantId ?? props.restaurantId;
  console.log(restaurantId);
  useEffect(() => {
    fetch(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/name/${restaurantId}`)
    .then((response) => response.json())
    .then((data) => setName(data.name))
    .catch((error) => console.error(error));
  }, [restaurantId]);
  
  const handleLogout = async () => {
    try {
      const response = await fetch('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerLogout', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        window.location.href = '/';
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  const isMobile = useMediaQuery({ query: '(max-width: 760px)' });

  if (isMobile) {
    return (
      <Dropdown>
        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
          Menu
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href={`/RestaurantManage/${restaurantId}`}>Dashboard</Dropdown.Item>
          <Dropdown.Item href={`/Orders/${restaurantId}`}>Orders</Dropdown.Item>
          <Dropdown.Item href={`/MenuManager/${restaurantId}`}>Menu</Dropdown.Item>
          <Dropdown.Item href={`/Settings/${restaurantId}`}>Settings</Dropdown.Item>
          {isLoggedIn ? <Dropdown.Item onClick={() => handleLogout()}>Logout</Dropdown.Item> : null}
        </Dropdown.Menu>
      </Dropdown>
    )
  } else {
    return (
      <div className={styles.sidebar}>
        <ul className={styles.sidebar_nav}>
          <h2>Welcome {capitalizeString(name)}!</h2>
          <li className={styles.nav_line}>
            <AiFillDashboard className={styles.nav_icon} />
            <Link to={`/RestaurantManage/${restaurantId}`} className={styles.nav_link}>Dashboard</Link>
          </li>
          <li className={styles.nav_line}>
            <MdFoodBank className={styles.nav_icon} />
            <Link to={`/Orders/${restaurantId}`} className={styles.nav_link}>Orders</Link>
          </li>
          <li className={styles.nav_line}>
            <BiFoodMenu className={styles.nav_icon} />
            <Link to={`/MenuManager/${restaurantId}`} className={styles.nav_link}>Menu</Link>
          </li>
          <li className={styles.nav_line}>
            <FiSettings className={styles.nav_icon} />
            <Link to={`/Settings/${restaurantId}`} className={styles.nav_link}>Settings</Link>
          </li>
          {isLoggedIn ? 
            <li className={styles.nav_line}>
              <CgLogOut className={styles.nav_icon} />
              <Link onClick={() => handleLogout()} className={styles.nav_link}>Logout</Link>
            </li> 
            : null
          }
        </ul>
      </div>
    );
  }
}

export default Sidebar;
