import React, { useState, useEffect } from 'react';
import { useApi } from '../contexts/ApiContext';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.purchaseOrders.getAll();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading purchase orders...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Purchase Orders</h3>
        <button className="btn btn-primary">Create New Order</button>
      </div>
      <div className="card-body">
        <table className="table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.order_number}</td>
                <td>{order.supplier_name}</td>
                <td><span className="badge bg-warning">{order.status}</span></td>
                <td>${order.total_amount}</td>
                <td>{new Date(order.order_date).toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm btn-success">Receive</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrders;
