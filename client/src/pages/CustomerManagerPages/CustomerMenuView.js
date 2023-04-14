import React, { useState, useEffect,useContext } from 'react';
import { useNavigate, useParams,Link  } from 'react-router-dom';
import NavBar from '../components/CustomerManager/CustomerNavBar';
import Sidebar from '../components/CustomerManager/CustomerSidebar';
import ShoppingCartContext from '../../pages/components/CustomerManager/ShoppingCartContext'
import styles from '../../styles/MenuView.module.css';
import axios from 'axios';


function AddToOrderCard({ item, onAddToOrder, onClose }) {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const { addToCart } = useContext(ShoppingCartContext);

  const handleIngredientChange = (ingredient, price, checked) => {
    setSelectedIngredients((prevSelected) =>
      checked
        ? [...prevSelected, { name: ingredient, price }]
        : prevSelected.filter((ing) => ing.name !== ingredient),
    );
  };

  const handleAddToOrder = (orderItem) => {
    addToCart({
      ...item,
      itemDescription: item.item_description,
      itemPrice: item.item_price,
      selectedIngredients,
      itemQuantity,
    });
    onAddToOrder({
      ...item,
      selectedIngredients,
      itemQuantity,
    });
    onClose();
  };
  
  

  const totalPrice =
    item.item_price * itemQuantity +
    selectedIngredients.reduce((sum, ing) => sum + ing.price, 0) * itemQuantity;

  const hasOptionalIngredients = item.item_optional_ingredience && Object.keys(item.item_optional_ingredience).length > 0;

  return (
    <div className={styles.addToOrderCard}>
      <div className={styles.top}>
        <img src={item.item_image} alt={item.item_name}/>
        <h2>{item.item_name}</h2>
        <p>{item.item_description}</p>
        <p>Price: ${item.item_price}</p>
      </div>
      
      {hasOptionalIngredients && (
        <>
        <div className={styles.middle}>
          <h3>Optional Ingredients:</h3>
            <ul>
              {Object.entries(item.item_optional_ingredience).map(([ingredient, price]) => (
                <li key={ingredient}>
                  <label>
                    <input
                      type="checkbox"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(ingredient, price, e.target.checked)}
                    />
                    {ingredient} (+${price})
                  </label>
                </li>
              ))}
            </ul>
        </div>

        </>
      )}
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
  const {customerId,restaurantId} = useParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddToOrderCard, setShowAddToOrderCard] = useState(false);

  useEffect(() => {
    axios.get("http://ec2-50-17-11-178.compute-1.amazonaws.com/api/CustomerLogin").then((response) => {
      console.log(response);
      setLoggedIn(response.data.loggedIn);
      if (response.data.loggedIn===false) {
        // Redirect to login page if not logged in
        navigate('/CustomerLogin');
      }
      else if (response.data.loggedIn===true && response.data.userId!=customerId) {
        // Redirect to login page if not logged in
        console.log(response.data.userId,customerId);
        navigate('/CustomerLogin');
      }
    });

  }, [loggedIn]);



  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`http://ec2-50-17-11-178.compute-1.amazonaws.com/api/restaurant/MenuGet/${restaurantId}`);
        const data = await response.json();
        
        // Map the data to parse item_optional_ingredience
        const parsedData = data.map(item => {
          return {
            ...item,
            item_optional_ingredience: item.item_optional_ingredience ? JSON.parse(item.item_optional_ingredience) : null
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
  const categories = [...new Set(menuItems.map((item) => item.item_category))];

    
  const handleClick = (item) => {
    console.log(item);
    setSelectedItem(item);
    setShowAddToOrderCard(true);
  };



  const handleCloseAddToOrderCard = () => {
    setSelectedItem(null);
  };

  return (
    <div>
      <header>
        <NavBar loggedIn={loggedIn}/>
      </header>

      <main className={styles.main}>
        <section className={styles.section_side}>
          <div className={styles.sidebar}>
            <Sidebar loggedIn={loggedIn}/>
          </div>
        </section>

        <section className={styles.section_middle}>
          <div className={styles.menu_page}>
            <div className={styles.head_btn}>
              {/* <h1>Menu Management</h1> */}
            </div>
            {categories.map((category) => (
              <div key={category}>
                <h3>{category}</h3>
                <div className={styles.menu_items_container}>
                  {menuItems
                    .filter((item) => item.item_category === category)
                    .map((item) => (
                      <Link key={item.item_id} onClick={() => handleClick(item)}  className={styles.menu_item_box}>
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
    <div className={styles.backgroundOverlay} onClick={() => setShowAddToOrderCard(false)}></div>
    <AddToOrderCard
      item={selectedItem}
      onAddToOrder={(orderItem) => {
        // Add orderItem to the orders
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
