import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../../styles/CustomerManage.module.css';
import Sidebar from '../../pages/components/CustomerManager/CustomerSidebar';
import NavBar from '../components/CustomerManager/CustomerNavBar';
import CustomerCalender from '../components/CustomerManager/CustomerCalender';



//dashboard page- calendar compnent is in it
function CustomerManage() {
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
        } else if (response.data.loggedIn === true && response.data.userId != customerId) {
          // Redirect to login page if not logged in
          console.log(response.data.userId, customerId);
          navigate('/CustomerLogin');
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
          <Sidebar loggedIn={loggedIn} customerId={customerId}/>
        </section>

        <section className={styles.section_middle}>
          
          <CustomerCalender customerId={customerId} />
        </section>
      </main>

    </div>
  );
}

export default CustomerManage;
