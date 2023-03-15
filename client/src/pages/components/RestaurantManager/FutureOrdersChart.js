import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

import '../../../styles/StatisticsComponents.css';

function FutureOrdersChart() {
  const [orders, setOrders] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    // Fetch data from the server
    fetch('http://vmedu265.mtacloud.co.il/api/future-orders')
      .then((response) => response.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    // Draw the chart
    if (orders.length > 0) {
      const chart = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: orders.map((order) => order.time),
          datasets: [
            {
              label: 'Number of Orders',
              data: orders.map((order) => order.count),
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            yAxes: [
              {
                ticks: {
                    beginAtZero: true,
                    min: 0,
                    precision: 0,
                },
              },
            ],
          },
        },
      });
  
      return () => chart.destroy();
    }
  }, [orders]);

  const totalOrders = orders.reduce((acc, order) => acc + order.count, 0);

  return (
    <div className="future-orders-chart">
      <p>Total orders: {isNaN(totalOrders) ? 0 : totalOrders}</p>
      <canvas ref={chartRef} />
    </div>
  );
}

export default FutureOrdersChart;
