import React, { useState, useEffect } from 'react';
import '../../../styles/StatisticsComponents.css'

function BestSellingItemsTable() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Fetch data from the server
    fetch('http://127.0.0.1:5000/api/best-selling-items')
      .then((response) => response.json())
      .then((data) => setItems(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div className="best-selling-items-table">
      {/* <h2>Best Selling Items</h2> */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BestSellingItemsTable;
