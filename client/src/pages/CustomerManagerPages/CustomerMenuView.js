import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import NavBar from "../components/CustomerManager/CustomerNavBar";
import Sidebar from "../components/CustomerManager/CustomerSidebar";
import ShoppingCartContext from "../../pages/components/CustomerManager/ShoppingCartContext";
import styles from "../../styles/MenuView.module.css";
import axios from "axios";

function AddToOrderCard({ item, onAddToOrder, onClose }) {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const { addToCart } = useContext(ShoppingCartContext);
  const [selectedAdditionalItems, setSelectedAdditionalItems] = useState([]);


  const handleAdditionalItemChange = (additionalItem, price, checked) => {
    setSelectedAdditionalItems((prevSelected) =>
      checked
        ? [...prevSelected, { name: additionalItem, price }]
        : prevSelected.filter((item) => item.name !== additionalItem)
    );
  };

  const handleAddToOrder = (orderItem) => {
    addToCart({
      ...item,
      itemDescription: item.item_description,
      itemPrice: item.item_price,
      selectedIngredients,
      selectedAdditionalItems,
      itemQuantity,
      restaurantId: item.restaurantId,
    });
    onAddToOrder({
      ...item,
      selectedIngredients,
      selectedAdditionalItems,
      itemQuantity,
      restaurantId: item.restaurantId,
    });
    onClose();
  };

  const totalPrice =
    item.item_price * itemQuantity +
    selectedAdditionalItems.reduce((sum, item) => sum + parseFloat(item.price), 0) * itemQuantity;


  return (
    <div className={styles.addToOrderCard}>
      <div className={styles.top}>
        <img src={item.item_image} alt={item.item_name} />
        <h2>{item.item_name}</h2>
        <p>{item.item_description}</p>
        <p>Price: ${item.item_price}</p>
      </div>

      <div className={styles.bottom}>
        <div>
          <label>
            Quantity:
            <input
              type="number"
              min="1"
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value, 10))}
            />
          </label>
          {Array.isArray(item.additionalProperties) &&
            item.additionalProperties.length > 0 && (
              <div className={styles.additionalItems}>
                <h3>Additional Items:</h3>
                <ul>
                  {item.additionalProperties.map((additionalItem) => (
                    <li key={additionalItem.name}>
                      <label>
                        <input
                          type="checkbox"
                          value={additionalItem.name}
                          onChange={(e) =>
                            handleAdditionalItemChange(
                              additionalItem.name,
                              additionalItem.price,
                              e.target.checked
                            )
                          }
                        />
                        {additionalItem.name} (+${additionalItem.price})
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
        <div>
          <button onClick={handleAddToOrder}>Add To Order</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function CustomerMenuView(props) {
  const [menuItems, setMenuItems] = useState([]);
  const { customerId, restaurantId } = useParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddToOrderCard, setShowAddToOrderCard] = useState(false);
  const [restaurantDetails, setRestaurantDetails] = useState({});


  useEffect(() => {
    axios
      .get(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/RestaurantDetails/${restaurantId}`)
      .then((response) => {
        console.log(response);
        setRestaurantDetails(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);


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
  }, [loggedIn]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
          `http://ec2-35-169-139-56.compute-1.amazonaws.com/api/customer/MenuGet/${restaurantId}`
        );
        const data = await response.json();

        // Map the data to parse item_optional_ingredience
        const parsedData = data.map((item) => {
          return {
            ...item,
            additionalItems: item.item_additional
              ? JSON.parse(item.item_additional)
              : null,
          };
        });

        setMenuItems(parsedData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMenuItems();
  }, [menuItems]);

  // Get a list of unique categories
  const types = [...new Set(menuItems.map((item) => item.item_type))];

  const handleClick = (item) => {
    console.log(item);
    setSelectedItem({
      ...item,
      restaurantId: restaurantId,
    });
    setShowAddToOrderCard(true);
  };



  return (
    <div>
      <header>
        <NavBar loggedIn={loggedIn} customerId={customerId}/>
      </header>

      <main className={styles.main}>
        <section className={styles.section_side}>
          <div className={styles.sidebar}>
            <Sidebar loggedIn={loggedIn} customerId={customerId}/>
          </div>
        </section>

        <section className={styles.section_middle}>
          <div className={styles.menu_page}>
          <div className={styles.head_btn}>
              {/* <h1>We Are {restaurantDetails.restaurant_name}-</h1> */}
              <h2>Opening Time: {restaurantDetails.start_opening_time}</h2> 
              <h2>Closing Time: {restaurantDetails.close_opening_time}</h2>
          </div>

            {types.map((category) => (
              <div key={category}>
                <h3>{category}</h3>
                <div className={styles.menu_items_container}>
                  {menuItems
                    .filter((item) => item.item_type === category)
                    .map((item) => (
                      <Link
                        key={item.item_id}
                        onClick={() => handleClick(item)}
                        className={styles.menu_item_box}
                      >
                        {/* <div key={item.item_id}> */}

                        <div className={styles.menu_item_image}>
                          <img src={item.item_image} alt={item.item_name} />
                        </div>
                        <div className={styles.menu_item_details}>
                          <p className={styles.menu_item_name}>
                            {item.item_name}
                          </p>
                          <div className={styles.description}>
                            <p className={styles.menu_item_description}>
                              {item.item_description}
                            </p>
                          </div>
                          <div className={styles.box_down}>
                            <p className={styles.menu_item_price}>
                              Price: ${item.item_price}
                            </p>
                          </div>
                        </div>
                        {/* </div> */}
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      {showAddToOrderCard && (
        <>
          <div
            className={styles.backgroundOverlay}
            onClick={() => setShowAddToOrderCard(false)}
          ></div>
          
          <AddToOrderCard
            item={{
              ...selectedItem,
              additionalProperties: selectedItem.additionalItems,
            }}
            onAddToOrder={(orderItem) => {
              console.log(orderItem);
              setShowAddToOrderCard(false);
            }}
            onClose={() => setShowAddToOrderCard(false)}
          />
        </>
      )}
    </div>
  );
}

export default CustomerMenuView;
