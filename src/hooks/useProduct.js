import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';
import { addGlobalNotification } from '../services/notificationService';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load all products
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError(err.message);
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Get a product by ID
    const getProduct = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            const product = await productService.getProductById(id);
            return product;
        } catch (err) {
            setError(err.message);
            console.error(`Error getting product ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create a new product
    const createProduct = useCallback(async (productData) => {
        setLoading(true);
        setError(null);
        try {
            const newProduct = await productService.createProduct(productData);
            setProducts(prevProducts => [...prevProducts, newProduct]);

            // --- GLOBAL NOTIFICATION LOGIC FOR NEW PRODUCT ---
            const notification = {
                title: `🎉 New Product: ${newProduct.name}!`,
                message: `Check out our latest addition: ${newProduct.name} - ${newProduct.description?.substring(0, 50) || 'No description available.'}...`,
                type: 'new_product',
                link: `/products/${newProduct.id}` // Link to the new product page
            };
            // Call the GLOBAL notification function
            addGlobalNotification(notification).catch(e => console.error(`Failed to send global new product notification:`, e));
            // --- END GLOBAL NOTIFICATION LOGIC ---

            return newProduct;
        } catch (err) {
            setError(err.message);
            console.error('Error creating product:', err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update a product
    const updateProduct = useCallback(async (id, updates) => {
        setLoading(true);
        setError(null);
        try {
            let existingProduct = products.find(p => p.id === id);
            if (!existingProduct) {
                const fetchedProduct = await getProduct(id);
                if (fetchedProduct) {
                    existingProduct = fetchedProduct;
                } else {
                    throw new Error("Product not found for update.");
                }
            }

            const updatedProduct = await productService.updateProduct(id, updates);

            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, ...updates } : product
                )
            );

            // --- GLOBAL NOTIFICATION LOGIC FOR DISCOUNT/LABEL CHANGE ---
            const oldDiscount = Number(existingProduct.discount) || 0;
            const newDiscount = Number(updates.discount) || 0;
            const oldDiscountLabel = String(existingProduct.discountLabel || '').trim();
            const newDiscountLabel = String(updates.discountLabel || '').trim();

            const discountApplied = (oldDiscount <= 0 || isNaN(oldDiscount)) && (newDiscount > 0 && !isNaN(newDiscount));
            const discountLabelChangedAndRelevant =
                (newDiscount > 0 || oldDiscount > 0) &&
                (newDiscountLabel !== oldDiscountLabel) &&
                (newDiscountLabel !== '');

            if (discountApplied || discountLabelChangedAndRelevant) {
                const productName = updatedProduct.name || existingProduct.name;
                let notificationTitle = '';
                let notificationMessage = '';
                let notificationType = 'discount_update';

                if (discountApplied) {
                    notificationTitle = `🔥 Deal Alert: ${productName} is now discounted!`;
                    notificationMessage = `Get ${productName} for ${newDiscount}% off! Original price: ₱${Number(existingProduct.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}.`;
                }

                if (discountLabelChangedAndRelevant) {
                    if (discountApplied) {
                        notificationMessage += ` Also, it's: "${newDiscountLabel}".`;
                    } else {
                        notificationTitle = `Update: ${productName} - "${newDiscountLabel}"`;
                        notificationMessage = `${productName} now has an updated special offer: "${newDiscountLabel}".`;
                    }
                }

                const notification = {
                    title: notificationTitle,
                    message: notificationMessage,
                    type: notificationType,
                    link: `/products/${id}`
                };

                // Call the GLOBAL notification function
                addGlobalNotification(notification).catch(e => console.error(`Failed to send global discount notification:`, e));
            }
            // --- END GLOBAL NOTIFICATION LOGIC ---

            return updatedProduct;
        } catch (err) {
            setError(err.message);
            console.error(`Error updating product ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, [products, getProduct]); // Removed getAllUserUids from dependencies

    // Delete a product
    const deleteProduct = useCallback(async (id) => {
        setLoading(true);
        setError(null);
        try {
            await productService.deleteProduct(id);
            setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
            return id;
        } catch (err) {
            setError(err.message);
            console.error(`Error deleting product ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get products by category
    const getProductsByCategory = useCallback(async (category) => {
        setLoading(true);
        setError(null);
        try {
            const categoryProducts = await productService.getProductsByCategory(category);
            return categoryProducts;
        } catch (err) {
            setError(err.message);
            console.error(`Error getting products for category ${category}:`, err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Get products by brand
    // const getProductsByBrand = useCallback(async (brand) => {
    //     setLoading(true);
    //     setError(null);
    //     try {
    //         const brandProducts = await productService.getProductsByBrand(brand);
    //         return brandProducts;
    //     } catch (err) {
    //         setError(err.message);
    //         console.error(`Error getting products for brand ${brand}:`, err);
    //         return [];
    //     } finally {
    //         setLoading(false);
    //     }
    // }, []);

    // Load products on initial render
    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return {
        products,
        loading,
        error,
        loadProducts,
        getProduct,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductsByCategory,
        // getProductsByBrand
    };
};