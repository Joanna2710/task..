import { db } from "../../Firebase/firebase";
import { doc, setDoc, deleteDoc, getDoc, getDocs, collection } from "firebase/firestore";

export const addToFavorites = async (userId, product) => {
  const ref = doc(db, `users/${userId}/favorites/${product.id}`);
  await setDoc(ref, { id: product.id, title: product.title, image: product.image?.src, price: product.price?.amount, category: product.category || "unknown" });
};

export const removeFromFavorites = async (userId, productId) => {
  const ref = doc(db, `users/${userId}/favorites/${productId}`);
  await deleteDoc(ref);
};

export const getFavorites = async (userId) => {
  const favRef = collection(db, `users/${userId}/favorites`);
  const snapshot = await getDocs(favRef);
  return snapshot.docs.map(doc => doc.data());
};

export const isFavorite = async (userId, productId) => {
  const ref = doc(db, `users/${userId}/favorites/${productId}`);
  const snapshot = await getDoc(ref);
  return snapshot.exists();
};
