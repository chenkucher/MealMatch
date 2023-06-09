import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../styles/CustomerMealMatcher.module.css";
import Sidebar from "../../pages/components/CustomerManager/CustomerSidebar";
import NavBar from "../components/CustomerManager/CustomerNavBar";




//showing loved meal by catrgoty, swiping right to add to shopping cart
function CustomerMealMatcher() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [restaurantItems, setRestaurantItems] = useState([]);
  const [swipedLeftItems, setSwipedLeftItems] = useState([]);
  const [swipedRightItems, setSwipedRightItems] = useState([]);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);

  const { customerId } = useParams();
  const navigate = useNavigate();


  //login validation
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
  }, []);


  //getting categories
  useEffect(() => {
    axios
      .get(
        `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/MealMatcher/${customerId}`
      )
      .then((response) => {
        console.log(response);
        setRestaurantItems(response.data.items);
      });
  }, [customerId]);




  // handling functions
  const touchStart = (e) => {
    setStartX(e.touches[0].clientX);
  };

  const touchMove = (e) => {
    setCurrentX(e.touches[0].clientX);
  };

  const touchEnd = () => {
    const distance = currentX - startX;

    if (distance < -100) {
      swipe("left", restaurantItems[0]);
    } else if (distance > 100) {
      swipe("right", restaurantItems[0]);
    } else {
      setCurrentX(startX);
    }
  };


  //doing animation and adding to matched items
  const swipe = (direction, item) => {
    const itemElement = document.querySelector(`.${styles.item}`);

    if (itemElement) {
      const animationDistance = direction === "left" ? -500 : 500;
      itemElement.animate(
        [
          { transform: `translateX(0)` },
          { transform: `translateX(${animationDistance}px)` },
        ],
        {
          duration: 300,
          easing: "ease-out",
        }
      ).onfinish = () => {
        if (direction === "left") {
          setSwipedLeftItems([...swipedLeftItems, item]);
        } else if (direction === "right") {
          setSwipedRightItems([...swipedRightItems, item]);
        }

        setRestaurantItems(
          restaurantItems.filter((restItem) => restItem !== item)
        );
      };
    }
  };

  //returning item back
  const undoSwipe = () => {
    let lastSwipedItem = null;

    if (swipedLeftItems.length > 0) {
      lastSwipedItem = swipedLeftItems[swipedLeftItems.length - 1];
      setSwipedLeftItems(swipedLeftItems.slice(0, -1));
    } else if (swipedRightItems.length > 0) {
      lastSwipedItem = swipedRightItems[swipedRightItems.length - 1];
      setSwipedRightItems(swipedRightItems.slice(0, -1));
    }

    if (lastSwipedItem) {
      setRestaurantItems([lastSwipedItem, ...restaurantItems]);
    }
  };

  return (
    <div className={styles.container}>
      <header>
        <NavBar
          loggedIn={loggedIn}
          matchedItems={swipedRightItems}
          customerId={customerId}
        />
      </header>
      {console.log(restaurantItems)}
      <main className={styles.main}>
        <section className={styles.section_side}>
          <Sidebar loggedIn={loggedIn} customerId={customerId} />
        </section>

        <section className={styles.section_middle}>
          <h1>Match with your meal!</h1>
          {restaurantItems.length > 0 ? (
            restaurantItems.slice(0, 1).map((item, index) => (
              <div
                key={index}
                className={styles.item}
                style={{ transform: `translateX(${currentX - startX}px)` }}
                onTouchStart={touchStart}
                onTouchMove={touchMove}
                onTouchEnd={touchEnd}
              >
                <h1>{item.restaurant_name}</h1>
                <img
                  src={item.item_image}
                  alt={item.item_name}
                  className={styles.itemImage}
                />
                <h2>{item.item_name}</h2>
                <h3>price: {item.item_price}$</h3>
                <p>{item.item_description}</p>
              </div>
            ))
          ) : (
            <div className={styles.noItemsMessage}>
              <h2>Oops!</h2>
              <p>
                If you got here, it means we have nothing to show you anymore.
                Try to explore more items on the explore page!
              </p>
              <p>
                Try to change you category preferences at the settings page!
              </p>
            </div>
          )}
          <div className={styles.buttons}>
            <button
              disabled={restaurantItems.length === 0}
              onClick={() => swipe("left", restaurantItems[0])}
            >
              &#8592;
            </button>
            <button onClick={undoSwipe}>Undo Swipe</button>
            <button
              disabled={restaurantItems.length === 0}
              onClick={() => swipe("right", restaurantItems[0])}
            >
              &#8594;
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CustomerMealMatcher;
