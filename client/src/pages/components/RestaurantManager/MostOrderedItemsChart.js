import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement } from 'chart.js';
import socketIOClient from 'socket.io-client';

Chart.register(CategoryScale, LinearScale, BarElement);

function MostOrderedItemsChart() {
  const { restaurantId } = useParams();
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);


  useEffect(() => {
    const socket = socketIOClient('http://ec2-35-169-139-56.compute-1.amazonaws.com:5000');
    socket.on('newOrder', (data) => {
      setOrders((prevItems) => [...prevItems, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  useEffect(() => {
    fetch(`http://ec2-35-169-139-56.compute-1.amazonaws.com/api/restaurant/Orders/mostOrderedItems/${restaurantId}`)
      .then((response) => response.json())
      .then((data) => {
        setItems(data);
      })
      .catch((error) => console.error(error));
  }, [restaurantId,orders]);

  const chartData = {
    labels: items.map(item => item.name),
    datasets: [
      {
        label: 'Most Ordered Items',
        data: items.map(item => item.count),
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderWidth: 1,
        hoverBackgroundColor: 'rgba(75,192,192,0.6)',
        hoverBorderColor: 'rgba(75,192,192,1)',
      },
    ],
  };

  return (
    <div>
      <h2>Most Ordered Items</h2>
      <div>
        <Bar
          data={chartData}
          options={{
            // aspectRatio: 'auto',
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default MostOrderedItemsChart;
