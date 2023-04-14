import React, { useEffect, useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import axios from 'axios';
import styles from '../../styles/Orders.module.css'
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import OrderTable from '../components/RestaurantManager/OrderTable';

function Orders(props) {
    const [loggedIn, setLoggedIn] = useState(false);
    const { restaurantId } = useParams();
    const navigate = useNavigate();
    useEffect(() => {
      axios.get("http://ec2-50-17-11-178.compute-1.amazonaws.com/api/SellerLogin").then((response) => {
        console.log(response);
        setLoggedIn(response.data.loggedIn);
        if (response.data.loggedIn===false) {
            // Redirect to login page if not logged in
            navigate('/Login');
          }
        else if (response.data.loggedIn===true && response.data.userId!=restaurantId) {
            // Redirect to login page if not logged in
            navigate('/Login');
          }
      });
    }, []);
    return (
        <div>
            <header>
                <NavBar loggedIn={loggedIn}/>
            </header>

            <main className={styles.main}>
            <section className={styles.section_side}>
                <div  className={styles.sidebar} >
                    <Sidebar loggedIn={loggedIn}/>
                </div>
            </section>
            <section className={styles.section_middle}>
                <div className={styles.orderTable}>
                    <OrderTable/>
                </div>
            </section>
                
            </main>
           
        </div>
    );
}

export default Orders;