import { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

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
    const createProduct = useCallback(async (product) => {
        setLoading(true);
        setError(null);
        try {
            const newProduct = await productService.createProduct(product);
            setProducts(prevProducts => [...prevProducts, newProduct]);
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
            const updatedProduct = await productService.updateProduct(id, updates);
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === id ? { ...product, ...updates } : product
                )
            );
            return updatedProduct;
        } catch (err) {
            setError(err.message);
            console.error(`Error updating product ${id}:`, err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

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