import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styles from '../../styles/CustomerCategoryPage.module.css';
import Sidebar from '../../pages/components/CustomerManager/CustomerSidebar';
import NavBar from '../components/CustomerManager/CustomerNavBar';

function CustomerCategoryPage(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const { category } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerLogin")
      .then((response) => {
        console.log(response);
        setLoggedIn(response.data.loggedIn);
        setCustomerId(response.data.userId);
        if (response.data.loggedIn === false) {
          // Redirect to login page if not logged in
          navigate('/CustomerLogin');
        }
      });

  }, []);

  useEffect(() => {
    if (loggedIn) {
      axios
        .get(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurants-by-category/${category}`)
        .then((response) => {
          setRestaurants(response.data);
        });
    }
  }, [loggedIn]);

  return (
    <div className={styles.container}>
      <header>
        <NavBar loggedIn={loggedIn} />
      </header>

      <main className={styles.main}>
        <section className={styles.section_side}>
          <Sidebar loggedIn={loggedIn} />
        </section>

        <section className={styles.section_middle}>
          <h1>Resutaurants that has {category} food:</h1>
          <div className={styles.restaurantGrid}>
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.restaurant_id}
                to={`/CustomerMenuView/${customerId}/${restaurant.restaurant_id}`}
                className={styles.restaurant_box}
              >
                <div className={styles.restaurant_logo}>
                  <img
                    src={restaurant.restaurant_logo_url}
                    alt={restaurant.restaurant_details}
                  />
                </div>
                <div className={styles.restaurant_details}>
                  <p className={styles.restaurant_name}>
                    {restaurant.restaurant_name}
                  </p>
                  <p className={styles.restaurant_descrpition}>
                    {restaurant.restaurant_details}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default CustomerCategoryPage;
