import React, { useState, useEffect } from "react";
import { useProducts } from "../../hooks/useProduct";
import { ShoppingCart, Minus, Plus, X, Search, Download } from "lucide-react";
import AdminLayout from "./AdminLayout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const usePersistentCart = () => {
  const [cartItems, setCartItems] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("pos-cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('pos-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  return [cartItems, setCartItems];
};

const useCart = () => {
  const [cartItems, setCartItems] = usePersistentCart();

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => 
      sum + (item.discountedPrice || item.price) * item.quantity, 0);
    
    const totalDiscount = cartItems.reduce((sum, item) => 
      item.discount > 0 
        ? sum + (item.price - item.discountedPrice) * item.quantity 
        : sum, 0);
    
    return {
      subtotal,
      totalDiscount,
      grandTotal: subtotal,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
    };
  };

const addToCart = (product, updateProduct) => {
  if (product.stock <= 0) {
    toast.error(`${product.name} is out of stock`);
    return;
  }
  setCartItems(prevItems => {
    const existingItem = prevItems.find(item => item.id === product.id);
    const newStock = product.stock - (existingItem ? 0 : 1);
    
    updateProduct(product.id, { ...product, stock: newStock });

    if (existingItem) {
      // Remove the quantity >= stock check completely
      return prevItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }
    
    const discountedPrice = product.discount > 0 
      ? product.price * (1 - product.discount / 100)
      : product.price;

    toast.success(`${product.name} added to cart`);
    return [...prevItems, { 
      ...product, 
      quantity: 1,
      discountedPrice,
      originalStock: product.stock
    }];
  });
};

const increaseQuantity = (productId, products, updateProduct) => {
  setCartItems(prevItems =>
    prevItems.map(item => {
      if (item.id === productId) {
        const product = products.find(p => p.id === productId);
        // Remove the quantity < stock check
        updateProduct(productId, { ...product, stock: product.stock - 1 });
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    })
  );
};

  const decreaseQuantity = (productId, products, updateProduct) => {
    setCartItems(prevItems => {
      const item = prevItems.find(i => i.id === productId);
      if (item) {
        if (item.quantity > 1) {
          const product = products.find(p => p.id === productId);
          updateProduct(productId, { ...product, stock: product.stock + 1 });
          return prevItems.map(i =>
            i.id === productId
              ? { ...i, quantity: i.quantity - 1 }
              : i
          );
        } else {
          const product = products.find(p => p.id === productId);
          updateProduct(productId, { ...product, stock: product.stock + 1 });
          return prevItems.filter(i => i.id !== productId);
        }
      }
      return prevItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return { 
    cartItems, 
    addToCart, 
    increaseQuantity, 
    decreaseQuantity,
    clearCart,
    calculateTotals
  };
};

const POS = () => {
  const { products, updateProduct } = useProducts();
  const { 
    cartItems, 
    addToCart, 
    increaseQuantity, 
    decreaseQuantity,
    clearCart,
    calculateTotals
  } = useCart();
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [receiptNumber] = useState(Math.floor(100000 + Math.random() * 900000));

  const categories = ["All", "Bikes", "Gears", "Parts", "Accessories"];
  const { subtotal, totalDiscount, grandTotal, itemCount } = calculateTotals();

  const generateReceiptPDF = async () => {
    try {
      // First update all product stocks permanently
      const updatePromises = cartItems.map(item => {
        const newStock = item.stock - item.quantity;
        if (newStock < 0) {
          throw new Error(`Insufficient stock for ${item.name}`);
        }
        return updateProduct(item.id, { 
          ...item, 
          stock: newStock 
        });
      });

      await Promise.all(updatePromises);

      // Then generate the receipt
      const doc = new jsPDF();
      
      // Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('ELMO BIKE SHOP', 105, 20, { align: 'center' });
      
      // Receipt details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Receipt #: ${receiptNumber}`, 20, 35);
      doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 40);
      
      // Items table
      const itemTableRows = cartItems.map(item => [
        item.name,
        item.quantity.toString(),
        `PHP ${item.discountedPrice?.toFixed(2) || item.price.toFixed(2)}`,
        `PHP ${((item.discountedPrice || item.price) * item.quantity).toFixed(2)}`
      ]);
      
      autoTable(doc, {
        head: [['Item', 'Qty', 'Price', 'Total']],
        body: itemTableRows,
        startY: 50,
        theme: 'grid',
        headStyles: {
          fillColor: [255, 165, 0],
          textColor: 255,
          fontStyle: 'bold'
        },
        margin: { horizontal: 20 }
      });
      
      // Totals
      const finalY = doc.lastAutoTable.finalY + 10;
      
      doc.setFontSize(12);
      doc.text(`Subtotal: PHP ${subtotal.toFixed(2)}`, 140, finalY);
      doc.text(`Discounts: -PHP ${totalDiscount.toFixed(2)}`, 140, finalY + 6);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: PHP ${grandTotal.toFixed(2)}`, 140, finalY + 12);
      
      // Footer
      doc.setFontSize(10);
      doc.text("Thank you for your purchase!", 105, finalY + 25, { align: 'center' });
      
      // Save and clear
      doc.save(`receipt_${receiptNumber}.pdf`);
      setShowReceiptModal(false);
      clearCart();
      toast.success("Order completed successfully!");
      
    } catch (error) {
      console.error("Order processing failed:", error);
      toast.error(error.message || "Failed to complete order");
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || 
                          product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <AdminLayout>
      <div className="flex justify-between items-center p-4 bg-gray-100">
        <h1 className="text-2xl font-bold">Point of Sale</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <ShoppingCart size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowCheckoutModal(true)}
            disabled={itemCount === 0}
            className={`px-4 py-2 rounded shadow ${
              itemCount > 0
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            }`}
          >
            Checkout
          </button>
        </div>
      </div>

      <div className="p-4 bg-white border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-orange-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">No products found</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-2 text-orange-600 hover:text-orange-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const isInCart = cartItems.some(item => item.id === product.id);
              const outOfStock = product.stock <= 0;
              const lowStock = product.stock > 0 && product.stock <= 5;
              const cartItem = cartItems.find(item => item.id === product.id);
              const maxReached = cartItem ? cartItem.quantity >= product.stock : false;

              return (
                <div
                  key={product.id}
                  className={`bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition duration-300 flex flex-col ${
                    outOfStock ? "opacity-70" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-40 object-cover rounded mb-3"
                    />
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
                      outOfStock ? "bg-red-100 text-red-800" :
                      lowStock ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {outOfStock ? "Out of Stock" : 
                       lowStock ? `Low Stock: ${product.stock}` : 
                       `In Stock: ${product.stock}`}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-gray-400 line-through">
                            ₱{product.price.toFixed(2)}
                          </span>
                          <span className="text-orange-600 font-bold">
                            ₱{(product.price * (1 - product.discount / 100)).toFixed(2)}
                          </span>
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                            {product.discount}% OFF
                          </span>
                        </>
                      ) : (
                        <span className="text-orange-600 font-bold">
                          ₱{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => !isInCart && addToCart(product, updateProduct)}
                    disabled={outOfStock || isInCart}
                    className={`mt-3 px-3 py-2 rounded w-full transition ${
                      outOfStock ? "bg-gray-300 text-gray-500 cursor-not-allowed" :
                      isInCart ? "bg-gray-400 text-gray-600 cursor-not-allowed" :
                      "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {outOfStock ? "Out of Stock" : 
                     isInCart ? "Added to Cart" : 
                     "Add to Cart"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4 shadow-lg relative">
            <button
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-lg font-semibold mb-4">Checkout Summary</h3>

            {cartItems.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                <div className="max-h-[50vh] overflow-y-auto mb-4 border-b pb-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="mb-4">
                      <div className="flex justify-between">
                        <h4 className="font-bold">{item.name}</h4>
                        <p className="font-bold">
                          ₱{(item.discountedPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <button 
                          onClick={() => decreaseQuantity(item.id, products, updateProduct)}
                          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => increaseQuantity(item.id, products, updateProduct)}
                          disabled={item.quantity >= item.stock}
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            item.quantity >= item.stock
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          <Plus size={16} />
                        </button>
                        {item.discount > 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded ml-2">
                            {item.discount}% OFF
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600">{item.category}</p>
                      <p className="font-bold">
                        {item.discount > 0 ? (
                          <>
                            <span className="text-gray-400 line-through mr-2">
                              ₱{item.price.toFixed(2)}
                            </span>
                            ₱{item.discountedPrice.toFixed(2)} each
                          </>
                        ) : (
                          `₱${item.price.toFixed(2)} each`
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        Available: {item.stock}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₱{subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Total Discounts:</span>
                      <span>-₱{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 my-2"></div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₱{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="flex-1 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={generateReceiptPDF}
                    className="flex-1 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Confirm Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showReceiptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
          <div className="bg-white p-6 rounded-lg w-full max-w-md mx-4 shadow-lg relative">
            <button
              onClick={() => {
                setShowReceiptModal(false);
                clearCart();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold">ELMO BIKE SHOP</h3>
              <p className="text-sm text-gray-600">Receipt #{receiptNumber}</p>
              <p className="text-sm text-gray-600">
                {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
              </p>
            </div>

            <div className="border-t border-b border-gray-300 py-3 my-3">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between mb-2">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x ₱{item.discountedPrice?.toFixed(2) || item.price.toFixed(2)}
                      {item.discount > 0 && (
                        <span className="text-xs text-red-500 ml-2">
                          (Discount: {item.discount}%)
                        </span>
                      )}
                    </p>
                  </div>
                  <p className="font-medium">
                    ₱{(item.discountedPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Discounts:</span>
                  <span>-₱{totalDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 my-2"></div>
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>₱{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center text-sm text-gray-500 mb-4">
              Thank you for your purchase!
            </div>

            <button
              onClick={generateReceiptPDF}
              className="w-full py-2 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download Receipt
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default POS;