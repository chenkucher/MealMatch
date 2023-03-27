import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import styles from '../../styles/MenuManager.module.css';
import axios from 'axios';
;

function MenuManager(props) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedItem, setEditedItem] = useState({
    name: '',
    description: '',
    price: 0,
    item_status: 'available',
    item_category: '',
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    item_status: 'available',
    item_category: '',
  });
  const { restaurantId } = useParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  
  useEffect(() => {
    axios
      .get('http://vmedu265.mtacloud.co.il/api/SellerLogin')
      .then((response) => {
        console.log(response);
        setLoggedIn(response.data.loggedIn);
        if (response.data.loggedIn === false) {
          // Redirect to login page if not logged in
          navigate('/Login');
        } else if (
          response.data.loggedIn === true &&
          response.data.userId != restaurantId
        ) {
          // Redirect to login page if not logged in
          navigate('/Login');
        }
      });
  }, []);

  function handleEditSubmit(event) {
    event.preventDefault();

    // Send a PUT request to update the item in the database
    fetch(
      `http://vmedu265.mtacloud.co.il/api/restaurant/MenuSet/${selectedItem.item_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_name: editedItem.name,
          item_description: editedItem.description,
          item_price: editedItem.price,
          item_status: editedItem.item_status,
          item_category: editedItem.item_category,
        }),
      }
    )
      .then((response) => {
        setShowAddForm(false);
        if (response.ok) {
          // Update the menu items state with the new data
          setMenuItems(
            menuItems.map((item) => {
              if (item.item_id === selectedItem.item_id) {
                return {
                  ...item,
                  item_name: editedItem.name,
                  item_description: editedItem.description,
                  item_price: editedItem.price,
                  item_status: editedItem.item_status,
                  item_category: editedItem.item_category,
                };
              } else {
                return item;
              }
            })
          );
          // Hide the add form

          // Reset the selected item and edited item state variables
          setSelectedItem(null);
          setEditedItem({
            name: '',
            description: '',
            price: 0,
            item_status: 'available',
            item_category: '',
          });
        } else {
          console.error(
            'Failed to update menu item:',
            response.status,
            response.statusText
          );
        }
      })
      .catch((error) =>
        console.error('Error updating menu item:', error)
      );
  }

  function handleEditCancel() {
    // Reset the selected item state variable
    setSelectedItem(null);

    // Reset the edited item state variable if an item was selected
    if (selectedItem) {
      setEditedItem({
        name: selectedItem.item_name,
        description: selectedItem.item_description,
        price: selectedItem.item_price,
        item_status: selectedItem.item_status,
        item_category: selectedItem.item_category,
      });
    }
  }

  function handleEditNow(item) {
    // Set the selected item state variable
    setSelectedItem(item);

    // Set the edited item state variable to the values of the selected item
    setEditedItem({
      name: item.item_name,
      description: item.item_description,
      price: item.item_price,
      item_status: item.item_status,
      item_category: item.item_category,
    });
  }

  function handleNameChange(event) {
    setEditedItem({ ...editedItem, name: event.target.value });
  }

  function handleDescriptionChange(event) {
    setEditedItem({ ...editedItem, description: event.target.value });
  }

  function handlePriceChange(event) {
    setEditedItem({
      ...editedItem,
      price: parseFloat(event.target.value),
    });
  }

  function handleStatusChange(event) {
    setEditedItem({ ...editedItem, item_status: event.target.value });
  }

  function handleCategoryChange(event) {
    setEditedItem({ ...editedItem, item_category: event.target.value });
  }
  function handleImageChange(event) {
    setSelectedImage(event.target.files[0]);
  }
  function handleAddSubmit(event) {
    event.preventDefault();
    fetch(
      `http://vmedu265.mtacloud.co.il/api/restaurant/MenuAdd/${restaurantId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_name: newItem.name,
          item_description: newItem.description,
          item_price: newItem.price,
          item_status: newItem.item_status,
          item_category: newItem.item_category,
          item_image: 'https://via.placeholder.com/300x225?text=No+Image+Available',
        }),
      }
    )
      .then((response) => {
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return response.json();
          } else {
            throw new Error(
              'Invalid content-type, expected application/json, but received: ' +
                contentType
            );
          }
        } else {
          throw new Error(
            `Failed to add new menu item: ${response.status} ${response.statusText}`
          );
        }
      })
      .then((data) => {
        setMenuItems((prevMenuItems) => [
          ...prevMenuItems,
          {
            item_id: data.insertId,
            item_name: newItem.name,
            item_description: newItem.description,
            item_price: newItem.price,
            item_status: newItem.item_status,
            item_category: newItem.item_category,
            item_image: 'https://via.placeholder.com/300x225?text=No+Image+Available',
          },
        ]);
  
        setNewItem({
          name: '',
          description: '',
          price: 0,
          item_status: 'available',
          item_category: '',
        });
        setShowAddForm(false);
      })
      .catch((error) => console.error('Error adding new menu item:', error));
  }
  
  
  

  function handleAddCancel() {
    // Reset the new item state variable
    setNewItem({
      name: '',
      description: '',
      price: 0,
      item_status: 'available',
      item_category: '',
    });
    setShowAddForm(false);
  }

  function handleNewNameChange(event) {
    setNewItem({ ...newItem, name: event.target.value });
  }

  function handleNewDescriptionChange(event) {
    setNewItem({ ...newItem, description: event.target.value });
  }

  function handleNewPriceChange(event) {
    setNewItem({
      ...newItem,
      price: parseFloat(event.target.value),
    });
  }

  function handleNewStatusChange(event) {
    setNewItem({ ...newItem, item_status: event.target.value });
  }

  function handleNewCategoryChange(event) {
    setNewItem({ ...newItem, item_category: event.target.value });
  }
  function handleNewImageChange(event) {
    setNewItem({ ...newItem, item_category: event.target.value });
  }


  function handleRemove() {
    // Send a DELETE request to remove the item from the database
    fetch(
      `http://vmedu265.mtacloud.co.il/api/restaurant/MenuItemDelete/${selectedItem.item_id}`,
      {
        method: 'DELETE',
      }
    )
      .then((response) => {
        setShowAddForm(false);
        if (response.ok) {
          // Remove the item from the menu items state
          setMenuItems(menuItems.filter((item) => item.item_id !== selectedItem.item_id));
          // Hide the edit form
          setSelectedItem(null);
        } else {
          console.error(
            'Failed to remove menu item:',
            response.status,
            response.statusText
          );
        }
      })
      .catch((error) =>
        console.error('Error removing menu item:', error)
      );
  }
  
  useEffect(() => {
    // Fetch menu items data from the server
    fetch(`http://vmedu265.mtacloud.co.il/api/restaurant/MenuGet/${restaurantId}`)
      .then((response) => response.json())
      .then((data) => {
        setMenuItems(data);
      })
      .catch((error) => console.error(error));
  }, [menuItems]);

  // Get a list of unique categories
  const categories = [...new Set(menuItems.map((item) => item.item_category))];
  useEffect(() => {
      axios.get("http://vmedu265.mtacloud.co.il/api/SellerLogin").then((response) => {
        console.log(response);
        setLoggedIn(response.data.loggedIn);
      });
    }, []);
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
              <h1>Menu Management</h1>
              <button onClick={() => setShowAddForm(true)}>Add Item</button>
            </div>
            {categories.map((category) => (
              <div key={category}>
                <h3>{category}</h3>
                <div className={styles.menu_items_container}>
                  {menuItems
                    .filter((item) => item.item_category === category)
                    .map((item) => (
                      <div className={styles.menu_item_box} key={item.item_id}>
                        <div className={styles.menu_item_image}>
                        <img src={planFoodImage} alt={item.item_name} />
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
                            <button onClick={() => handleEditNow(item)}>
                              Edit
                            </button>
                            <p className={styles.menu_item_price}>
                              Price: ${item.item_price}
                            </p>
                            <p className={styles.menu_item_status}>
                              Status: {item.item_status}
                            </p>

                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}

            {selectedItem && (
              <div className={styles.edit_form}>
                <div className={styles.box_up}>
                  
                  <h2>Edit Menu Item</h2>
                  <button className={styles.remove_button} type="button" onClick={handleRemove}>
                    Remove
                  </button>
                </div>
                <form onSubmit={handleEditSubmit}>

                  <label>
                      Name:
                      <input
                        type="text"
                        value={editedItem.name}
                        onChange={handleNameChange}
                      />
                    </label>
                  
                  <label>
                    Description:
                    <textarea
                      value={editedItem.description}
                      onChange={handleDescriptionChange}
                    />
                  </label>
                  <label>
                    Price:
                    <input
                      type="number"
                      value={editedItem.price}
                      onChange={handlePriceChange}
                    />
                  </label>
                  <label>
                    Status:
                    <select
                      value={editedItem.item_status}
                      onChange={handleStatusChange}
                    >
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </label>
                  <label>
                    Category:
                    <input
                      type="text"
                      value={editedItem.item_category}
                      onChange={handleCategoryChange}
                    />
                  </label>
                  <label>
                    Upload Image:
                    <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleImageChange} />
                  </label>
                  <button type="submit">Save</button>
                  <button type="button" onClick={handleEditCancel}>
                    Cancel
                  </button>
                </form>
              </div>
            )}
            {showAddForm && (
              <div className={styles.edit_form}>
                <h2>Add Menu Item</h2>
                <form onSubmit={handleAddSubmit}>
                  <label>
                    Name:
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={handleNewNameChange}
                    />
                  </label>
                  <label>
                    Description:
                    <textarea
                      value={newItem.description}
                      onChange={handleNewDescriptionChange}
                    />
                  </label>
                  <label>
                    Price:
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={handleNewPriceChange}
                    />
                  </label>
                  <label>
                    Status:
                    <select className={styles.dropdown} value={newItem.item_status} onChange={handleNewStatusChange}>
                      <option value="available">Available</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </label>
                  <label>
                    Category:
                    <input
                      type="text"
                      value={newItem.item_category}
                      onChange={handleNewCategoryChange}
                    />
                  </label>
                  <label>
                    Upload Image:
                    <input type="file" accept="image/jpeg, image/png, image/jpg" onChange={handleNewImageChange} />
                  </label>
                  <button type="submit">Add</button>
                  <button type="button" onClick={handleAddCancel}>
                    Cancel
                  </button>
                </form>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default MenuManager;