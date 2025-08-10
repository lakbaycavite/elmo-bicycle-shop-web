import { useState, useEffect } from 'react';
import { database } from '../firebase/firebase';
import { ref, set } from 'firebase/database';
import { toast } from 'sonner';

export function useStockManagement(products) {
  const [stockMap, setStockMap] = useState({});

  useEffect(() => {
    const initialStock = {};
    products.forEach(product => {
      initialStock[product.id] = product.stock ?? 0;
    });
    setStockMap(initialStock);
  }, [products]);

  const updateStockInFirebase = async (productId, newStock) => {
    try {
      await set(ref(database, `products/${productId}/stock`), newStock);
      setStockMap(prev => ({
        ...prev,
        [productId]: newStock
      }));
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error(`Error updating stock: ${error.message}`);
    }
  };

  const handleAddToCart = async (product) => {
    const currentStock = stockMap[product.id] ?? product.stock ?? 0;
    if (currentStock <= 0) return;

    // ...add to cart logic...

    await updateStockInFirebase(product.id, currentStock - 1);
  };

  return { stockMap, setStockMap, updateStockInFirebase, handleAddToCart };
}