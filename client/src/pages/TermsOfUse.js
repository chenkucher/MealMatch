import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomerSidebar from "../pages/components/CustomerManager/CustomerSidebar";
import CustomerNavBar from "./components/CustomerManager/CustomerNavBar";
import RestaurantSidebar from "../pages/components/RestaurantManager/Sidebar";
import RestaurantNavBar from "./components/NavBar";
import styles from "../styles/TermsOfUse.module.css";

function TermsOfUse(props) {
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
            <h1>Terms of Use</h1>

            <p>
              Welcome to MealMatch. These Terms of Use govern your use of
              our platform and services.
            </p>

            <h2>Acceptance of Terms</h2>

            <p>
              By using our platform, you confirm that you accept these terms of
              use and that you agree to comply with them. If you do not agree to
              these terms, you must not use our platform.
            </p>

            <h2>Changes to Terms</h2>

            <p>
              We may revise these terms of use at any time by amending this
              page. Please check this page from time to time to take notice of
              any changes we made, as they are binding on you.
            </p>

            <h2>Accessing Our Platform</h2>

            <p>
              We do not guarantee that our platform, or any content on it, will
              always be available or uninterrupted. Access to our platform is
              permitted on a temporary basis. We may suspend, withdraw,
              discontinue or change all or any part of our platform without
              notice.
            </p>

            <h2>User Accounts</h2>

            <p>
              To use some parts of our platform, you will need to register for
              an account. You must treat your account details as confidential,
              and you must not disclose them to any third party.
            </p>

            <h2>Orders</h2>

            <p>
              All orders placed through our platform are subject to our
              acceptance. We may, at our sole discretion, refuse to accept an
              order or limit the quantity of items ordered.
            </p>

            <h2>Prohibited Uses</h2>

            <p>
              You may use our platform only for lawful purposes. You may not use
              our platform in any way that breaches any applicable local,
              national or international law or regulation.
            </p>

            <h2>Disclaimer and Limitation of Liability</h2>

            <p>
              We do not guarantee, represent or warrant that your use of our
              platform will be uninterrupted, timely, secure or error-free. We
              do not warrant that the results that may be obtained from the use
              of the platform will be accurate or reliable.
            </p>

            <h2>Termination</h2>

            <p>
              We may terminate or suspend your access to our platform
              immediately, without prior notice or liability, for any reason
              whatsoever, including, without limitation, if you breach these
              terms of use.
            </p>

            <h2>Contact Us</h2>

            <p>
              If you have any questions about these Terms of Use, please contact
              us at mealmatch@gmail.com.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default TermsOfUse;
