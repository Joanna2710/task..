import { db } from "../../Firebase/firebase";
import {doc,setDoc,deleteDoc,getDoc,updateDoc,getDocs,} from "firebase/firestore";


export const addToCart = async (userId, product, quantity = 1) => {
  if (quantity < 1) throw new Error("Quantity must be at least 1"); 
  const ref = doc(db, `users/${userId}/cart/${product.id}`);

  const existingDoc = await getDoc(ref);
  if (existingDoc.exists()) throw new Error("ALREADY_EXISTS");


  const totalPrice = product.price?.amount * quantity;

  await setDoc(ref, {
    id: product.id,
    title: product.title,
    image: product.image?.src,
    price: totalPrice, 
    category: product.category || "unknown",
    quantity,
  });
};


export const removeFromCart = async (userId, productId) => {
  const ref = doc(db, `users/${userId}/cart/${productId}`);
  await deleteDoc(ref);
};


export const updateCartQuantity = async (userId, productId, newQty) => {
  if (newQty < 1 || isNaN(newQty)) return; 

  const ref = doc(db, `users/${userId}/cart/${productId}`);
  const docSnap = await getDoc(ref);

  if (docSnap.exists()) {
    const productData = docSnap.data();
    const originalPrice = productData.price; 
    const updatedPrice = (originalPrice / productData.quantity) * newQty; 

   
    await updateDoc(ref, {
      quantity: newQty,
      price: updatedPrice, 
    });
  }
};

export const getCartItems = async (userId) => {
  const snapshot = await getDocs(collection(db, `users/${userId}/cart`));
  return snapshot.docs.map((doc) => doc.data());
};

export const addToWishlist = async (userId, product) => {
  const ref = doc(db, `users/${userId}/favorites/${product.id}`);

  const existingDoc = await getDoc(ref);
  if (existingDoc.exists()) throw new Error("ALREADY_EXISTS");

  await setDoc(ref, {
    id: product.id,
    title: product.title,
    image: product.image?.src,
    price: product.price?.amount,
    category: product.category || "unknown",
    addedAt: new Date().toISOString(),
  });
};

export const removeFromWishlist = async (userId, productId) => {
  const ref = doc(db, `users/${userId}/favorites/${productId}`);
  await deleteDoc(ref);
};

export const getWishlistItems = async (userId) => {
  const snapshot = await getDocs(collection(db, `users/${userId}/favorites`));
  return snapshot.docs.map((doc) => doc.data());
};
