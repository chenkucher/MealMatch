import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from '../../../styles/Sidebar.module.css';
import { FiSettings } from "react-icons/fi";
import { MdFoodBank } from "react-icons/md";
import { CgLogOut } from "react-icons/cg";
import { AiFillDashboard } from "react-icons/ai";
import { TbListSearch,TbArrowsDiff } from "react-icons/tb";
import { useMediaQuery } from 'react-responsive';
import Dropdown from 'react-bootstrap/Dropdown';

function capitalizeString(str) {
  return str.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
}

function Sidebar(props) {
  const isLoggedIn = props.loggedIn;
  const [name, setName] = useState('');
  let { customerId } = useParams();
  customerId = customerId ?? props.customerId;

  useEffect(() => {
    if (isLoggedIn) {
      fetch(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerSettings`)
        .then((response) => response.json())
        .then((data) => {
          const name = `${data.first_name}`;
          setName(name);
        })
        .catch((error) => console.error(error));
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    const response = await fetch('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerLogout', {
      method: 'GET',
      credentials: 'include'
    });
    if (response.ok) {
      window.location.href = '/';
    } else {
      console.error('Logout failed:', response.statusText);
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
          <Dropdown.Item href={`/CustomerManage/${customerId}`}>Dashboard</Dropdown.Item>
          <Dropdown.Item href={`/CustomerMealMatcher/${customerId}`}>Matcher</Dropdown.Item>
          <Dropdown.Item href={`/CustomerExplore/${customerId}`}>Explore</Dropdown.Item>
          <Dropdown.Item href={`/CustomerOrders/${customerId}`}>My Orders</Dropdown.Item>
          <Dropdown.Item href={`/CustomerSettings/${customerId}`}>Settings</Dropdown.Item>
          {isLoggedIn ? <Dropdown.Item onClick={() => handleLogout()}>Logout</Dropdown.Item> : null}
        </Dropdown.Menu>
      </Dropdown>
    );
  } else {
    return (
      <div className={styles.sidebar}>
        <ul className={styles.sidebar_nav}>
          <h2>Welcome {isLoggedIn ? capitalizeString(name) : 'guest'}!</h2>
          {isLoggedIn ? (
            <>
              <li className={styles.nav_line}>
                <AiFillDashboard className={styles.nav_icon} />
                <Link to={`/CustomerManage/${customerId}`} className={styles.nav_link}>Dashboard</Link>
              </li>

              <li className={styles.nav_line}>
                <TbArrowsDiff className={styles.nav_icon} />
                <Link to={`/CustomerMealMatcher/${customerId}`} className={styles.nav_link}>Matcher</Link>
              </li>

              <li className={styles.nav_line}>
                <TbListSearch className={styles.nav_icon} />
                <Link to={`/CustomerExplore/${customerId}`} className={styles.nav_link}>Explore</Link>
              </li>

              <li className={styles.nav_line}>
                <MdFoodBank className={styles.nav_icon} />
                <Link to={`/CustomerOrders/${customerId}`} className={styles.nav_link}>My Orders</Link>
              </li>

              <li className={styles.nav_line}>
                <FiSettings className={styles.nav_icon} />
                <Link to={`/CustomerSettings/${customerId}`} className={styles.nav_link}>Settings</Link>
              </li>
              <li className={styles.nav_line}>
                <CgLogOut className={styles.nav_icon} />
                <Link onClick={() => handleLogout()} className={styles.nav_link}>Logout</Link>
              </li>
            </>
          ) : null}
        </ul>
      </div>
    );
  }
}

export default Sidebar;
