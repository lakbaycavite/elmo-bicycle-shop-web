import { useState } from 'react';
import AdminLayout from './AdminLayout';
import { useOrder } from '../../hooks/useOrder';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import elmoLogo from '/images/logos/elmo.png';

function OrdersOverview() {
  const { adminOrders, updateOrderStatus } = useOrder();

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [editablePaymentMethod, setEditablePaymentMethod] = useState('');

  // Handle view button click
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setEditablePaymentMethod(order.paymentMethod || 'Cash on Delivery');
    setShowDetailsModal(true);
  };

  // Handle approve button click
  const handleApprove = () => {
    setConfirmAction('approve');
    setShowConfirmModal(true);
  };

  // Handle cancel button click
  const handleCancel = () => {
    setShowDetailsModal(false);
    setShowCancelModal(true);
  };

  // Handle confirm approval
  const handleConfirmApprove = async () => {
    try {
      await updateOrderStatus(selectedOrder.id, 'paid');
      setShowConfirmModal(false);
      setShowDetailsModal(false);
      setShowPDFPreview(true);
    } catch (error) {
      console.error('Error approving order:', error);
      alert('Error approving order. Please try again.');
    }
  };

  // Handle confirm cancellation
  const handleConfirmCancel = async () => {
    try {
      // Store the cancel reason in the selectedOrder for immediate UI update
      const updatedOrder = { ...selectedOrder, cancelReason };
      setSelectedOrder(updatedOrder);

      // Update order status - you might need to modify your updateOrderStatus to handle reason
      await updateOrderStatus(selectedOrder.id, 'cancelled', cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      setShowDetailsModal(false);
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Error cancelling order. Please try again.');
    }
  };

  // Convert image to base64 for PDF
  const getBase64Image = (img) => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  };

  // Generate and download PDF receipt
  const generatePDFReceipt = () => {
    const doc = new jsPDF();

    // Add logo
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      try {
        const imgData = getBase64Image(img);
        doc.addImage(imgData, 'PNG', 20, 10, 25, 25);
      } catch (error) {
        console.log('Could not add logo:', error);
      }

      // Complete the PDF generation
      completePDFGeneration(doc);
    };

    img.onerror = function () {
      console.log('Logo failed to load, continuing without logo');
      completePDFGeneration(doc);
    };

    img.src = elmoLogo;

    // Return the doc object for immediate use if needed
    return doc;
  };

  // Complete PDF generation (separated for async logo handling)
  const completePDFGeneration = (doc) => {
    // Add shop name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ELMO BIKE SHOP', 55, 25);

    // Add a line under the header
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);

    // Receipt details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${selectedOrder.userName || selectedOrder.userEmail}`, 20, 55);
    doc.text(`User ID: ${selectedOrder.userId}`, 20, 65);
    doc.text(`Date of Purchase: ${new Date(selectedOrder.createdAt).toLocaleDateString()}`, 20, 75);
    doc.text(`Order ID: ${selectedOrder.id}`, 20, 85);

    const tableRows = [];

    // Add items to table
    selectedOrder.items.forEach(item => {
      tableRows.push([
        item.quantity.toString(),
        item.name + ' (id: ' + item.id + ')',
        `PHP ${item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
      ]);
    });

    // Generate table
    autoTable(doc, {
      head: [['Quantity', 'Items', 'Amount']],
      body: tableRows,
      startY: 95,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 140, 0], // Orange color
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    // Add total
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: PHP ${selectedOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, 150, finalY);

    // Add footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Thank you for your purchase!', 105, finalY + 20, { align: 'center' });

    // Auto-download the PDF
    doc.save(`receipt-${selectedOrder.id}.pdf`);
  };

  // Download PDF (for the preview modal)
  const downloadPDF = () => {
    generatePDFReceipt();
  };

  // Reprint receipt for paid orders
  const handleReprintReceipt = () => {
    generatePDFReceipt();
  };

  // Calculate subtotal (without discount)
  const calculateSubtotal = (items) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Placeholder discount (0% for demo)
  const calculateDiscount = (subtotal) => {
    return subtotal * 0;
  };

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
                  <th className="py-3 px-4 text-left font-bold">Customer</th>
                  <th className="py-3 px-4 text-left font-bold">Mode of Payment</th>
                  <th className="py-3 px-4 text-left font-bold">Amount</th>
                  <th className="py-3 px-4 text-left font-bold">Status</th>
                  <th className="py-3 px-4 text-left font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {adminOrders.map((order) => (
                  <tr key={order.id} className="bg-gray-800 text-white border-b border-gray-700">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.userName || order.userEmail}</td>
                    <td className="py-3 px-4">{order.paymentMethod}</td>
                    <td className="py-3 px-4">{`₱${order.totalAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'paid' ? 'bg-green-500 text-white' :
                        order.status === 'cancelled' ? 'bg-red-500 text-white' :
                          'bg-yellow-500 text-black'
                        }`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-1 px-4 rounded shadow transition-colors duration-150"
                        onClick={() => handleViewOrder(order)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showDetailsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Order Information */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                  <p><strong>Customer:</strong> {selectedOrder.userName || selectedOrder.userEmail}</p>
                  <p><strong>User ID:</strong> {selectedOrder.userId}</p>
                </div>
                <div>
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><strong>Status:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${selectedOrder.status === 'paid' ? 'bg-green-500 text-white' :
                      selectedOrder.status === 'cancelled' ? 'bg-red-500 text-white' :
                        'bg-yellow-500 text-black'
                      }`}>
                      {selectedOrder.status?.toUpperCase()}
                    </span>
                  </p>
                  {/* Show cancellation reason if order is cancelled */}
                  {selectedOrder.status === 'cancelled' && (selectedOrder.cancelReason || selectedOrder.reason) && (
                    <p className="mt-2">
                      <strong>Cancellation Reason:</strong>
                      <span className="text-red-600 ml-1">
                        {selectedOrder.cancelReason || selectedOrder.reason}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Item</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Quantity</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Price</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2">₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                          <td className="border border-gray-300 px-4 py-2">₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Method Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Payment Method:</label>
                <select
                  value={editablePaymentMethod}
                  onChange={(e) => setEditablePaymentMethod(e.target.value)}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                  disabled={selectedOrder.status === 'paid' || selectedOrder.status === 'cancelled'}
                >
                  <option value="walkin">Walk-in</option>
                  <option value="gcash">GCash Payment</option>
                </select>
              </div>

              {/* Order Summary */}
              <div className="mb-6 bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-bold mb-3">Order Summary</h3>
                {(() => {
                  const subtotal = calculateSubtotal(selectedOrder.items);
                  const discount = calculateDiscount(subtotal);
                  const total = subtotal - discount;

                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-₱{discount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <hr className="my-2" />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                {/* Show Cancel and Approve buttons for pending orders */}
                {selectedOrder.status !== 'paid' && selectedOrder.status !== 'cancelled' && (
                  <>
                    <button
                      onClick={handleCancel}
                      className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded transition-colors duration-150"
                    >
                      Cancel Order
                    </button>
                    <button
                      onClick={handleApprove}
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition-colors duration-150"
                    >
                      Approve Order
                    </button>
                  </>
                )}

                {/* Show Reprint Receipt button for paid orders */}
                {selectedOrder.status === 'paid' && (
                  <button
                    onClick={handleReprintReceipt}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors duration-150"
                  >
                    Reprint Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
              <p className="mb-6">Are you sure you want to approve this order?</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmApprove}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition-colors duration-150"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Order Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">Cancel Order</h3>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Reason for cancellation:</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select a reason</option>
                  <option value="Out of stock">Out of stock</option>
                  <option value="Pricing error">Pricing error</option>
                  <option value="Payment issues">Payment issues</option>
                </select>
              </div>
              <p className="mb-6 text-red-600">Are you sure you want to cancel this order?</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancelReason('');
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
                >
                  No
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={!cancelReason}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPDFPreview && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Receipt Preview</h2>
                <button
                  onClick={() => setShowPDFPreview(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              {/* Receipt Preview */}
              <div className="border border-gray-300 p-6 bg-white">
                {/* Logo and Header */}
                <div className="flex items-center mb-4">
                  <img
                    src={elmoLogo}
                    alt="Elmo Bicycle Shop"
                    className="h-12 w-12 mr-4"
                  />
                  <h1 className="text-2xl font-bold">ELMO BIKE SHOP</h1>
                </div>
                <hr className="mb-4" />

                {/* Receipt Details */}
                <div className="mb-4">
                  <p><strong>Customer:</strong> {selectedOrder.userName || selectedOrder.userEmail}</p>
                  <p><strong>User ID:</strong> {selectedOrder.userId}</p>
                  <p><strong>Date of Purchase:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                </div>

                {/* Items Table */}
                <table className="w-full border-collapse border border-gray-300 mb-4">
                  <thead>
                    <tr className="bg-orange-500 text-white">
                      <th className="border border-gray-300 px-2 py-1 text-left">Quantity</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Items</th>
                      <th className="border border-gray-300 px-2 py-1 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-1">{item.quantity}</td>
                        <td className="border border-gray-300 px-2 py-1">{item.name}</td>
                        <td className="border border-gray-300 px-2 py-1">₱{item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div className="text-right">
                  <p className="text-lg font-bold">Total: ₱{selectedOrder.totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                </div>

                <div className="text-center mt-4">
                  <p className="text-sm">Thank you for your purchase!</p>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={downloadPDF}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition-colors duration-150"
                >
                  Download PDF Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default OrdersOverview;