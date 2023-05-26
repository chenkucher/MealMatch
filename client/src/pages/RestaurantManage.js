import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate,useParams } from 'react-router-dom';
import Sidebar from '../pages/components/RestaurantManager/Sidebar';
import styles from '../styles/RestaurantManage.module.css';
import NavBar from './components/NavBar';
import BestSellingItemsTable from './components/RestaurantManager/BestSellingItemsTable';
import LastOrdersTable from './components/RestaurantManager/LastOrdersTable';
import FutureOrdersChart from './components/RestaurantManager/FutureOrdersChart';

function RestaurantManage(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerLogin").then((response) => {
      console.log(response);
      setLoggedIn(response.data.loggedIn);
      if (response.data.loggedIn===false) {
        // Redirect to login page if not logged in
        navigate('/Login');
      }
      else if (response.data.loggedIn===true && response.data.userId!=restaurantId) {
        // Redirect to login page if not logged in
        console.log(response.data.userId,restaurantId);
        navigate('/Login');
      }
    });

  }, []);


  return (
    <div className={styles.container}>
      <header>
        <NavBar loggedIn={loggedIn} />
      </header>

      <main className={styles.main}>
        <section className={styles.section_side}>
          <Sidebar loggedIn={loggedIn}/>
        </section>

        <section className={styles.section_middle}>
          <div className={styles.dashboardz}>
            <div className={styles.future}>
              <h1>Future Orders</h1>
              <div className={styles.dashboard_sum}>
                <FutureOrdersChart />
              </div>
            </div>
          </div>

          <div className={styles.last_events}>
            <h1>Last Events</h1>
            <div className={styles.events_list}>
              <LastOrdersTable />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default RestaurantManage;
