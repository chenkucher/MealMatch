import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../../styles/CustomerOrders.module.css';
import Sidebar from '../../pages/components/CustomerManager/CustomerSidebar';
import NavBar from '../components/CustomerManager/CustomerNavBar';
import Checkout from '../components/CustomerManager/Checkout.js';

function CustomerCheckout(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const { customerId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerLogin')
      .then((response) => {
        console.log(response);
        setLoggedIn(response.data.loggedIn);
        if (response.data.loggedIn === false) {
          // Redirect to login page if not logged in
          navigate('/CustomerLogin');
        // } else if (response.data.loggedIn === true && response.data.userId != customerId) {
        //   // Redirect to login page if not logged in
        //   console.log(response.data.userId, customerId);
        //   navigate('/CustomerLogin');
        }
      });
  }, []);

  return (
    <div className={styles.container}>
      <header>
        <NavBar loggedIn={loggedIn} customerId={customerId}/>
      </header>

      <main className={styles.main}>
        <section className={styles.section_side}>
          <Sidebar loggedIn={loggedIn} />
        </section>

        <section className={styles.section_middle}>
        <Checkout customerId={customerId} />


        </section>
      </main>
    </div>
  );
}

export default CustomerCheckout;