import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import styles from "../../styles/CustomerExplore.module.css";
import Sidebar from "../../pages/components/CustomerManager/CustomerSidebar";
import NavBar from "../components/CustomerManager/CustomerNavBar";

function CustomerExplore(props) {
  const [loggedIn, setLoggedIn] = useState(false);
  const { customerId } = useParams();
  const navigate = useNavigate();
  const logo = "https://mealmatch.s3.amazonaws.com/logo.jpg";
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Italian",
      image: "https://mealmatch.s3.amazonaws.com/icons/italian.png",
    },
    {
      id: 2,
      name: "Mexican",
      image: "https://mealmatch.s3.amazonaws.com/icons/mexican.png",
    },
    {
      id: 3,
      name: "Dessert",
      image: "https://mealmatch.s3.amazonaws.com/icons/dessert.png",
    },
    {
      id: 4,
      name: "Street-food",
      image: "https://mealmatch.s3.amazonaws.com/icons/street-food.png",
    },
    {
      id: 5,
      name: "Kosher",
      image: "https://mealmatch.s3.amazonaws.com/icons/kosher.png",
    },
    {
      id: 6,
      name: "Vegan",
      image: "https://mealmatch.s3.amazonaws.com/icons/vegan.png",
    },
    {
      id: 7,
      name: "Hamburger",
      image: "https://mealmatch.s3.amazonaws.com/icons/hamburger.png",
    },
    {
      id: 8,
      name: "Sandwich",
      image: "https://mealmatch.s3.amazonaws.com/icons/sandwich.png",
    },
    {
      id: 9,
      name: "Asian",
      image: "https://mealmatch.s3.amazonaws.com/icons/asian.png",
    },
    {
      id: 10,
      name: "Sushi",
      image: "https://mealmatch.s3.amazonaws.com/icons/sushi.png",
    },
  ]);

  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios
      .get("http://ec2-35-169-139-56.compute-1.amazonaws.com/api/CustomerLogin")
      .then((response) => {
        console.log(response);
        setLoggedIn(response.data.loggedIn);
        if (response.data.loggedIn === false) {
          // Redirect to login page if not logged in
          navigate("/CustomerLogin");
        } else if (
          response.data.loggedIn === true &&
          response.data.userId != customerId
        ) {
          // Redirect to login page if not logged in
          console.log(response.data.userId, customerId);
          navigate("/CustomerLogin");
        }
      });

    axios
      .get(
        `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurants-by-preferences/${customerId}`
      )
      .then((response) => {
        setRestaurants(response.data);
        console.log(response.data);
      });
  }, []);

  function scrollCategories(direction) {
    const scrollContainer = document.querySelector(`.${styles.categories}`);

    if (direction === "left") {
      scrollContainer.scrollBy({ left: -200, behavior: "smooth" });
    } else {
      scrollContainer.scrollBy({ left: 200, behavior: "smooth" });
    }
  }

  function scrollRestaurants(direction) {
    const scrollContainer = document.querySelector(`.${styles.restaurants}`);
  
    if (direction === "left") {
      scrollContainer.scrollBy({ left: -200, behavior: "smooth" });
    } else {
      scrollContainer.scrollBy({ left: 200, behavior: "smooth" });
    }
  }
  
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
          <h1>Categories:</h1>
          <div className={styles.categories_wrapper}>
            <button
              className={styles.arrowLeft}
              onClick={() => scrollCategories("left")}
            >
              &lt;
            </button>
            <div className={styles.categories}>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/CustomerCategoryPage/${category.name}`}
                  className={styles.categoryItem}
                >
                  <div>
                    <img src={category.image} alt={category.name} />
                    <h3>{category.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <button
              className={styles.arrowRight}
              onClick={() => scrollCategories("right")}
            >
              &gt;
            </button>
          </div>
          <h1 className={styles.restaurants_header}>
            Best Restaurants For you
          </h1>
          <div className={styles.restaurants_wrapper}>

          <button
  className={styles.arrowLeft}
  onClick={() => scrollRestaurants("left")}
>
  &lt;
</button>
<div className={styles.restaurants}>
  {restaurants.map((restaurant) => (
    <Link
      to={`/CustomerMenuView/${customerId}/${restaurant.restaurant_id}`}
      key={restaurant.restaurant_id}
      className={styles.restaurant_box}
    >

      <img
      src={restaurant.restaurant_logo_url || logo}
      alt={`${restaurant.restaurant_name} logo`}

      />

      <h3>{restaurant.restaurant_name}</h3>
      <p>{restaurant.restaurant_details}</p>

    </Link>
  ))}
</div>
<button
  className={styles.arrowRight}
  onClick={() => scrollRestaurants("right")}
>
  &gt;
</button>
</div>

        </section>
      </main>
    </div>
  );
}

export default CustomerExplore;
