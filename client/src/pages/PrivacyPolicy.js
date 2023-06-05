import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomerSidebar from "../pages/components/CustomerManager/CustomerSidebar";
import CustomerNavBar from "./components/CustomerManager/CustomerNavBar";
import RestaurantSidebar from "../pages/components/RestaurantManager/Sidebar";
import RestaurantNavBar from "./components/RestaurantManager/NavBar";
import styles from "../styles/PrivacyPolicy.module.css";

function PrivacyPolicy(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    axios
      .get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerLogin")
      .then((response) => {
        console.log(response);
        if (response.data.loggedIn === true) {
          setLoggedIn(response.data.loggedIn);
          setCustomerId(response.data.userId);
        } else {
          axios
            .get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/SellerLogin")
            .then((response) => {
              console.log(response);
              if (response.data.loggedIn === true) {
                setLoggedIn(response.data.loggedIn);
                setRestaurantId(response.data.userId);
              }
            });
        }
      });
  }, []);

  let NavBar = CustomerNavBar;
  let Sidebar = CustomerSidebar;

  if (customerId) {
    NavBar = CustomerNavBar;
    Sidebar = CustomerSidebar;
  } else if (restaurantId) {
    NavBar = RestaurantNavBar;
    Sidebar = RestaurantSidebar;
  }

  return (
    <div className={styles.container}>
      <header>
        <NavBar loggedIn={loggedIn} customerId={customerId} restaurantId={restaurantId} />
      </header>

      <main className={styles.main}>
      {loggedIn ? (
          <section className={styles.section_side}>
            <Sidebar loggedIn={loggedIn} customerId={customerId} restaurantId={restaurantId} />
          </section>
        ) : null}

        <section className={styles.section_middle}>
          <div className={styles.container}>
            <h1>Privacy Policy</h1>

            <p>
              At MealMatch, the privacy and security of our customers and
              users are of paramount importance. We are committed to protecting
              the data you share with us. This privacy policy explains how we
              collect, process, and store your personal information.
            </p>

            <h2>Collection of Personal Information</h2>

            <p>
              We collect personal information when you register on our platform,
              place an order, or interact with our site. The type of personal
              information we collect can include: name, email address, phone
              number, delivery address, payment information, and any other
              information you choose to provide.
            </p>

            <h2>Use of Personal Information</h2>

            <p>
              The personal information you provide is used for purposes such as:
              providing you with services, processing your orders, communicating
              with you about orders, products, and promotional offers, updating
              our records, improving our platform and services, and
              personalizing your experience.
            </p>

            <h2>Information Sharing and Disclosure</h2>

            <p>
              We do not sell, trade, or rent your personal information to
              others. We may disclose your personal information to third parties
              such as restaurants to facilitate order processing and delivery.
              We may also disclose your personal information if we are required
              by law to do so or if you violate our Terms of Service.
            </p>

            <h2>Security</h2>

            <p>
              We implement a variety of security measures to maintain the safety
              of your personal information. Your personal information is
              contained behind secured networks and is only accessible by a
              limited number of persons who have special access rights to such
              systems, and are required to keep the information confidential.
            </p>

            <h2>Changes to Privacy Policy</h2>

            <p>
              We reserve the right to modify this privacy policy at any time, so
              please review it frequently. If we make changes to this policy, we
              will notify you here, by email, or by means of a notice on our
              homepage.
            </p>

            <h2>Contact Us</h2>

            <p>
              If you have any questions or concerns regarding our privacy
              policy, please contact us at mealmatch@gmail.com.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default PrivacyPolicy;
