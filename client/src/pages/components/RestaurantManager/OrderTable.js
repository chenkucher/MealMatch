import React  , { useState, useEffect }from 'react';
import '../../../styles/OrderTable.css'
function OrderTable(props) {
    const [items, setItems] = useState([]);

    useEffect(() => {
        fetch('/orders')
          .then((res) => res.json())
          .then((data) => setItems(data));
      }, []);
    return (
        <div>
            <table className="table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                </tr>
                </thead>
                <tbody>
                {items.map((item) => (
                    <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.description}</td>
                    <td>{item.price}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default OrderTable;