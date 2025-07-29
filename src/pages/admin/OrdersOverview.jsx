import { useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { useOrder } from '../../hooks/useOrder';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import elmoLogo from '/images/logos/elmo.png';
import { toast } from 'sonner';
import { useDiscount } from '../../hooks/useDiscount';

function OrdersOverview() {
  const { adminOrders, updateOrderStatus } = useOrder();
  const { returnVoucherOnCancel, deleteUsedVoucher } = useDiscount();

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmAction, setConfirmAction] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [editablePaymentMethod, setEditablePaymentMethod] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return adminOrders.filter(order => {
      // Search filter (customer name, email, or ID)
      const searchMatch = searchTerm === '' ||
        (order.userName && order.userName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.id.toString().includes(searchTerm) ||
        order.userId.toString().includes(searchTerm);

      // Status filter
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;

      // Payment method filter
      const paymentMatch = paymentFilter === 'all' || order.paymentMethod === paymentFilter;

      return searchMatch && statusMatch && paymentMatch;
    });
  }, [adminOrders, searchTerm, statusFilter, paymentFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to first page when filters change
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'payment':
        setPaymentFilter(value);
        break;
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setCurrentPage(1);
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Handle view button click
  const handleViewOrder = (order) => {

    setSelectedOrder(order);
    setEditablePaymentMethod(order.paymentMethod);
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

      const updatedOrder = { ...selectedOrder, status: 'paid', paymentMethod: editablePaymentMethod };

      await updateOrderStatus(selectedOrder.id, updatedOrder)
        .then(() => {
          toast.success('Order approved successfully!');
        })
      const usedVouchers = selectedOrder.products.filter(item => item.voucherId);

      await deleteUsedVoucher(usedVouchers.map(voucher => voucher.voucherId)); // Delete vouchers if used
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
      const updatedOrder = { ...selectedOrder, cancelReason: cancelReason, status: 'cancelled' };
      setSelectedOrder(updatedOrder);

      // Update order status - you might need to modify your updateOrderStatus to handle reason
      await updateOrderStatus(selectedOrder.id, updatedOrder)
        .then(() => {
          toast.success('Order cancelled successfully!');
        })

      await returnVoucherOnCancel(selectedOrder.products.map(item => item.voucherCode));

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
        toast.error('Failed to add logo to PDF. Please check the image URL.');
      }

      // Complete the PDF generation
      completePDFGeneration(doc);
    };

    img.onerror = function () {
      toast.error('Failed to load logo image. Please check the image URL.');
      completePDFGeneration(doc);
    };

    img.src = elmoLogo;

    // Return the doc object for immediate use if needed
    return doc;
  };

  // Complete PDF generation (separated for async logo handling)
  const completePDFGeneration = (doc) => {
    // Get page dimensions for dynamic positioning in landscape
    // These values will reflect the landscape A4 size (approx 297mm x 210mm)
    const pageWidth = doc.internal.pageSize.getWidth();
    // const pageHeight = doc.internal.pageSize.getHeight(); // Not strictly needed for this layout

    // Add shop name
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ELMO BIKE SHOP', 50, 25); // Start closer to left edge

    // Add a line under the header
    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40); // Line stretches across the page, with 20mm margin

    // Receipt details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Customer: ${selectedOrder.userName || selectedOrder.userEmail}`, 20, 55);
    doc.text(`User ID: ${selectedOrder.userId}`, 20, 65);
    doc.text(`Date of Purchase: ${new Date(selectedOrder.createdAt).toLocaleDateString()}`, 20, 75);
    doc.text(`Order ID: ${selectedOrder.id}`, 20, 85);

    const itemTableRows = [];

    const subtotal = selectedOrder.products.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = selectedOrder.products.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const total = subtotal - discount;

    // Add items to main table
    selectedOrder.products.forEach(item => {
      itemTableRows.push([
        item.quantity.toString(),
        item.name + ' (id: ' + item.id + ')',
        `PHP ${item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        `PHP ${(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`,
        item.discountAmount ? `PHP ${item.discountAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : 'PHP 0.00',
        item.finalPrice ? `PHP ${(item.finalPrice * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}` : `PHP ${(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`
      ]);
    });

    // Generate main items table
    autoTable(doc, {
      head: [['Quantity', 'Item', 'Price', 'Sub Total', 'Discount', 'Total']],
      body: itemTableRows,
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
      },
    });

    // --- Voucher Used Table ---
    const voucherTableRows = [];

    selectedOrder.products.forEach(item => {
      if (item.voucherCode) {
        voucherTableRows.push([
          'Voucher Used',
          item.voucherCode,
          `${item.discountPercentage}%`,
          item.name
        ]);
      } else {
        voucherTableRows.push([
          'No Voucher Used',
          '-',
          '-',
          item.name
        ]);
      }
    });

    // Add a heading for the voucher table
    let currentY = doc.lastAutoTable.finalY + 15; // Position after the first table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Voucher Details', 20, currentY);

    // Generate voucher table
    autoTable(doc, {
      head: [['Status', 'Code', 'Discount %', 'Applied To Item']],
      body: voucherTableRows,
      startY: currentY + 10, // Start below the "Voucher Details" heading
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [255, 140, 0], // Orange color
        textColor: 255,
        fontStyle: 'bold'
      },
    });



    // Add total
    const finalY = doc.lastAutoTable.finalY + 10; // Position after the last table (voucher table)
    doc.setFont('helvetica', 'bold');
    // Position "Total" using pageWidth to align it to the right
    doc.text(`Total: PHP ${total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, pageWidth - 60, finalY);

    // Add footer
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Thank you for your purchase!', pageWidth / 2, finalY + 20, { align: 'center' });

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
    if (items.finalPrice === 0) return items.reduce((sum, item) => sum + (item.finalPrice * item.quantity), 0);
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Placeholder discount (0% for demo)
  const calculateDiscount = (subtotal) => {
    return subtotal.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <h1 className="text-3xl font-bold mb-6">ORDERS OVERVIEW</h1>
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-2xl font-bold text-orange-400 mb-6">CUSTOMERS ORDER</h2>

          {/* Search and Filter Section */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 rounded-lg">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Customer
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentFilter}
                onChange={(e) => handleFilterChange('payment', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Gcash">GCash Payment</option>
              </select>
            </div>
          </div>

          {/* Clear Filters and Results Count */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Showing {Math.min(startIndex + 1, filteredOrders.length)} - {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                {filteredOrders.length !== adminOrders.length && ` (filtered from ${adminOrders.length} total)`}
              </span>
              {(searchTerm || statusFilter !== 'all' || paymentFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-800 underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>

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
                {currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                      {adminOrders.length === 0 ? 'No orders found.' : 'No orders match your search criteria.'}
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
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
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {getPageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' ? goToPage(page) : null}
                      disabled={page === '...'}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage
                        ? 'bg-orange-500 text-white'
                        : page === '...'
                          ? 'text-gray-400 cursor-default'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
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
                        <th className="border border-gray-300 px-4 py-2 text-left">Sub Total</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Discount</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                          <td className="border border-gray-300 px-4 py-2">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2">{
                            Number(item.discountedFinalPrice) > 0
                              ? <>
                                <span className="text-decoration-line-through">{`₱${new Intl.NumberFormat().format(item.price)}`}</span>
                                <span className="ms-2">{`₱${new Intl.NumberFormat().format(Number(item.discountedFinalPrice))}`}</span>
                              </>
                              : `₱${new Intl.NumberFormat().format(item.price)}`
                          }</td>
                          <td className="border border-gray-300 px-4 py-2">
                            {
                              Number(item.discountedFinalPrice) > 0
                                ? <>
                                  <span className="ms-2">{`₱${new Intl.NumberFormat().format(Number(item.discountedFinalPrice * item.quantity))}`}</span>
                                </>
                                : `₱${new Intl.NumberFormat().format(item.price)}`
                            }</td>

                          <td className="border border-gray-300 px-4 py-2">₱{item.discountAmount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>

                          {item.finalPrice === 0 ? (
                            <td className="border border-gray-300 px-4 py-2">₱{(item.price * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                          ) : (
                            <td className="border border-gray-300 px-4 py-2">

                              {/* ₱{((item.finalPrice) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })} */}
                              ₱{((item.discountedFinalPrice - item.discountAmount) * item.quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}

                            </td>
                          )}
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
                  <option value="Walk-in">Walk-in</option>
                  <option value="Gcash">GCash Payment</option>
                </select>

              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Vouchers Used:</label>
                <select
                  // value={editablePaymentMethod}
                  // onChange={(e) => setEditablePaymentMethod(e.target.value)}
                  className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-orange-500"
                >
                  {selectedOrder.products.map((item) => (
                    <option key={item.id} value={item.voucherCode}>
                      {item.voucherCode ? `Voucher Code: ${item.voucherCode} - ${item.discountPercentage}% for ${item.name}` : `No Voucher Used for ${item.name}`}
                    </option>
                  ))}
                </select>

              </div>


              {/* Order Summary */}
              <div className="mb-6 bg-gray-50 p-4 rounded">
                <h3 className="text-lg font-bold mb-3">Order Summary</h3>
                {(() => {
                  const subtotal = calculateSubtotal(selectedOrder.products);
                  const discount = calculateDiscount(selectedOrder.products);
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
              <div className="flex space-x-4 gap-2 justify-end">
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
              <div className="flex space-x-4 justify-end gap-2">
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
              <div className="flex space-x-4 justify-end gap-2">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="mx-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Receipt Preview</h2>
                <button
                  onClick={() => setShowPDFPreview(false)}
                  className="text-2xl font-bold text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              {/* Receipt Preview */}
              <div className="border border-gray-300 bg-white p-6">
                {/* Logo and Header */}
                <div className="mb-4 flex items-center">
                  <img
                    src={elmoLogo}
                    alt="Elmo Bicycle Shop"
                    className="mr-4 h-12 w-12"
                  />
                  <h1 className="text-2xl font-bold">ELMO BIKE SHOP</h1>
                </div>
                <hr className="mb-4" />

                {/* Receipt Details */}
                <div className="mb-4">
                  <p>
                    <strong>Customer:</strong> {selectedOrder.userName || selectedOrder.userEmail}
                  </p>
                  <p>
                    <strong>User ID:</strong> {selectedOrder.userId}
                  </p>
                  <p>
                    <strong>Date of Purchase:</strong>{" "}
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Order ID:</strong> {selectedOrder.id}
                  </p>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse border border-gray-300 mb-4">
                    <thead>
                      <tr className="bg-orange-500 text-white">
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Item
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Quantity
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Price
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Sub Total
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Discount
                        </th>
                        <th className="border border-gray-300 px-4 py-2 text-left">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.products.map((item, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.name}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {item.quantity}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            ₱{item.price.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            ₱{(item.price * item.quantity)?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </td>

                          <td className="border border-gray-300 px-4 py-2">
                            ₱{item.discountAmount?.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                          </td>

                          {item.finalPrice === 0 ? (
                            <td className="border border-gray-300 px-4 py-2">
                              ₱{(item.price * item.quantity).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </td>
                          ) : (
                            <td className="border border-gray-300 px-4 py-2">
                              ₱{(item.finalPrice * item.quantity).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="text-right">
                  <p className="text-lg font-bold">
                    Total: ₱
                    {selectedOrder.totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm">Thank you for your purchase!</p>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-4 text-center">
                <button
                  onClick={downloadPDF}
                  className="bg-orange-500 text-white font-bold py-2 px-6 rounded transition-colors duration-150 hover:bg-orange-600"
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