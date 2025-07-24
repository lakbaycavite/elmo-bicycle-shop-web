import { database } from '../firebase/firebase';

import {
    ref,
    set,
    push,
    get,
    remove,
    update,
    query,
    orderByChild,
    equalTo
} from 'firebase/database';

const productsRef = ref(database, 'products');

export const productService = {
    // Create a new product
    createProduct: async (product) => {
        const newProductRef = push(productsRef);
        product.id = newProductRef.key;
        await set(newProductRef, product);
        return product;
    },

    // Get all products
    getAllProducts: async () => {
        const snapshot = await get(productsRef);
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        } else {
            return [];
        }
    },

    // Get a product by ID
    getProductById: async (id) => {
        const productRef = ref(database, `products/${id}`);
        const snapshot = await get(productRef);
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    },

    // Update a product
    updateProduct: async (id, updates) => {
        const productRef = ref(database, `products/${id}`);
        await update(productRef, updates);
        return { id, ...updates };
    },

    // Delete a product
    deleteProduct: async (id) => {
        const productRef = ref(database, `products/${id}`);
        await remove(productRef);
        return id;
    },

    // Get products by category
    getProductsByCategory: async (category) => {
        const categoryQuery = query(productsRef, orderByChild('category'), equalTo(category));
        const snapshot = await get(categoryQuery);
        if (snapshot.exists()) {
            return Object.values(snapshot.val());
        } else {
            return [];
        }
    },

    // Get products by brand
    // getProductsByBrand: async (brand) => {
    //     const brandQuery = query(productsRef, orderByChild('brand'), equalTo(brand));
    //     const snapshot = await get(brandQuery);
    //     if (snapshot.exists()) {
    //         return Object.values(snapshot.val());
    //     } else {
    //         return [];
    //     }
    // }
};