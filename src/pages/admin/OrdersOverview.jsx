import React from 'react';
import AdminLayout from './AdminLayout';
import { useOrder } from '../../hooks/useOrder';

// const orders = [
//   { id: 'ORD001', name: 'LANDING PAGE', payment: 'Credit Card', amount: '$120.00' },
//   { id: 'ORD002', name: 'HOME', payment: 'PayPal', amount: '$85.50' },
//   { id: 'ORD003', name: 'Add to cart A', payment: 'Bank Transfer', amount: '$45.00' },
//   { id: 'ORD004', name: 'Add to cart B', payment: 'Cash on Delivery', amount: '$67.25' },
//   { id: 'ORD005', name: 'Add to cart B', payment: 'Cash on Delivery', amount: '$67.25' },
// ];

function OrdersOverview() {
  const { adminOrders } = useOrder();

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <h1 className="text-3xl font-bold mb-6">ORDERS OVERVIEW</h1>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold text-orange-400 mb-6">CUSTOMERS ORDER</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-black text-orange-400">
                  <th className="py-3 px-4 text-left font-bold">ID</th>
                  <th className="py-3 px-4 text-left font-bold">Email</th>
                  <th className="py-3 px-4 text-left font-bold">Mode of Payment</th>
                  <th className="py-3 px-4 text-left font-bold">Amount</th>
                  <th className="py-3 px-4 text-left font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.map((order) => (
                  <tr key={order.id} className="bg-gray-800 text-white border-b border-gray-700">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.userEmail}</td>
                    <td className="py-3 px-4">{order.paymentMethod}</td>
                    <td className="py-3 px-4">{`₱${order.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}</td>
                    <td className="py-3 px-4">
                      <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-4 rounded shadow transition-colors duration-150">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrdersOverview; 