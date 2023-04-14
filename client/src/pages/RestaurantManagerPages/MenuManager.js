import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import Sidebar from '../components/RestaurantManager/Sidebar';
import styles from '../../styles/MenuManager.module.css';
import axios from 'axios';
import { uploadFileToS3, deleteFileFromS3, getImageUrl } from './s3bucket_control';

function MenuManager(props) {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedItem, setEditedItem] = useState({
    item_id: '',
    name: '',
    description: '',
    price: 0,
    item_status: 'available',
    item_category: '',
    item_image:''
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    item_status: 'available',
    item_category: '',
    item_image:''
  });
  const { restaurantId } = useParams();
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();
  const [cacheBustingKey, setCacheBustingKey] = useState(Date.now());//to update image after edit
  
  useEffect(() => {
    axios
      .get('http://ec2-50-17-11-178.compute-1.amazonaws.com/api/SellerLogin')
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




  async function handleEditSubmit(event) {
    event.preventDefault();
  
    const handleImageUpdate = async () => {
      // Delete current file
      await deleteFileFromS3(`${editedItem.item_id}.png`);
  
      // Upload new image to S3
      const imageUrl = await uploadFileToS3(
        `${editedItem.item_id}.png`,
        editedItem.imageFile
      );
  
      // Update the cache-busting key
      setCacheBustingKey(Date.now());
  
      return imageUrl;
    };
  
    const updateItemInDatabase = async (imageUrl) => {
      // Send a PUT request to update the item in the database
      const response = await fetch(
        `http://ec2-50-17-11-178.compute-1.amazonaws.com/api/restaurant/MenuSet/${selectedItem.item_id}`,
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
            item_image: imageUrl,
          }),
        }
      );
  
      if (!response.ok) {
        throw new Error(
          `Failed to update menu item: ${response.status} ${response.statusText}`
        );
      }
  
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(
          'Invalid content-type, expected application/json, but received: ' +
            contentType
        );
      }
  
      return response.json();
    };
  
    try {
      const imageUrl = await handleImageUpdate();
      const data = await updateItemInDatabase(imageUrl);
  
      // Update the menu item with the new data and image URL
      setMenuItems((prevMenuItems) =>
        prevMenuItems.map((item) =>
          item.item_id === editedItem.item_id
            ? {
                ...item,
                item_name: editedItem.name,
                item_description: editedItem.description,
                item_price: editedItem.price,
                item_status: editedItem.item_status,
                item_category: editedItem.item_category,
                item_image: `${imageUrl}?v=${cacheBustingKey}`,
              }
            : item
        )
      );

  
      // Reset the edited item state
      setEditedItem({
        item_id: '',
        name: '',
        description: '',
        price: 0,
        item_status: 'available',
        item_category: '',
        item_image: '',
      });
      setSelectedItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  }

  function handleEditCancel() {
    // Reset the selected item state variable
    setSelectedItem(null);

    // Reset the edited item state variable if an item was selected
    if (selectedItem) {
      setEditedItem({
        item_id: selectedItem.item_id,
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
      item_id: item.item_id,
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
    const file = event.target.files[0];
  
    if (file) {
      const imageURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageURL;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        // Convert the image to PNG format
        canvas.toBlob((blob) => {
          setEditedItem({ ...editedItem, imageFile: blob });
  
          // Release the object URL to free up memory
          URL.revokeObjectURL(imageURL);
        }, 'image/png');
      };
    }
  }
  


async function handleAddSubmit(event) {
    event.preventDefault();
  
 // Check if all required fields have a value
 if (!newItem.name || !newItem.description || newItem.price === 0 || !newItem.item_category || !newItem.imageFile) {
  const alertContainer = document.createElement('div');
  alertContainer.classList.add(styles.alert);

  const alertMessage = document.createElement('p');
  alertMessage.textContent = 'Please fill out all required fields';

  const closeButton = document.createElement('button');
  closeButton.textContent = 'X';
  closeButton.addEventListener('click', () => alertContainer.remove());

  alertContainer.appendChild(alertMessage);
  alertContainer.appendChild(closeButton);

  if (!showAddForm) {
    alertContainer.classList.add(styles.alertFullWidth);
  }

  document.body.appendChild(alertContainer);

  // Remove the alert after 10 seconds
  setTimeout(() => {
    alertContainer.remove();
  }, 10000);

  return;
}
try {
  // First, create the new menu item without the image URL
  const response = await fetch(
    `http://ec2-50-17-11-178.compute-1.amazonaws.com/api/restaurant/MenuAdd/${restaurantId}`,
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
        item_image: null, // Set item_image to null initially
      }),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to add new menu item: ${response.status} ${response.statusText}`
    );
  }

  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    throw new Error(
      'Invalid content-type, expected application/json, but received: ' +
        contentType
    );
  }

  const newItemId = data.insertId;

  // Upload the image to S3
  const imageUrl = await uploadFileToS3(
    `${newItemId}.png`,
    newItem.imageFile
  );

  // Update the menu item in the database with the image URL
  const putResponse = await fetch(
    `http://ec2-50-17-11-178.compute-1.amazonaws.com/api/restaurant/ImageSet/${newItemId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_image: `https://mealmatch.s3.amazonaws.com/${newItemId}.png`,
      }),
    }
  );

  if (!putResponse.ok) {
    throw new Error(
      `Failed to update item image: ${putResponse.status} ${putResponse.statusText}`
    );
  }

  // Add the new item to the menu page after both the image is uploaded and data is posted to the db
  setMenuItems((prevMenuItems) => [
    ...prevMenuItems,
    {
      item_id: newItemId,
      item_name: newItem.name,
      item_description: newItem.description,
      item_price: newItem.price,
      item_status: newItem.item_status,
      item_category: newItem.item_category,
      item_image: `https://mealmatch.s3.amazonaws.com/${newItemId}.png`,
    },
  ]);

  // Reset form fields and show success message
  setNewItem({
    name: '',
    description: '',
    price: 0,
    item_status: 'available',
    item_category: '',
    item_image: '',
  });
  setShowAddForm(false);
} catch (error) {
  console.error('Error adding new menu item:', error);
  // Create error message
  // ...
}
}
  
  
  
  

  function handleAddCancel() {
    // Reset the new item state variable
    setNewItem({
      name: '',
      description: '',
      price: 0,
      item_status: 'available',
      item_category: '',
      item_image:''
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
    const file = event.target.files[0];

    if (file) {
      const imageURL = URL.createObjectURL(file);
      const img = new Image();
      img.src = imageURL;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        // Convert the image to PNG format
        canvas.toBlob((blob) => {
          setNewItem({ ...newItem, imageFile: blob });

          // Release the object URL to free up memory
          URL.revokeObjectURL(imageURL);
        }, 'image/png');
      };
    }
  }


  async function handleRemove() {
    try {
      // Delete the image file from S3
      await deleteFileFromS3(`${selectedItem.item_id}.png`);
  
      const response = await fetch(
        `http://ec2-50-17-11-178.compute-1.amazonaws.com/api/restaurant/MenuItemDelete/${selectedItem.item_id}`,
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
  
      // ... rest of the function remains unchanged
    } catch (error) {
      console.error('Error removing menu item:', error);
    }
  }
  
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`http://ec2-50-17-11-178.compute-1.amazonaws.com/api/restaurant/MenuGet/${restaurantId}`);
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchMenuItems();
  }, [menuItems]);
  

  // Get a list of unique categories
  const categories = [...new Set(menuItems.map((item) => item.item_category))];

  //Check if logged in
  useEffect(() => {
      axios.get("http://ec2-50-17-11-178.compute-1.amazonaws.com/api/SellerLogin").then((response) => {
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
                          {/* {console.log(getImageUrl(item.item_image))} */}
                          {/* <img src={getImageUrl(item.item_image)} alt={item.item_name} /> */}
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
                      <option value="Available">Available</option>
                      <option value="Unavailable">Unavailable</option>
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