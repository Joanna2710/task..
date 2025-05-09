import React, { useEffect, useState } from "react";
import { addToFavorites, removeFromFavorites, isFavorite} from "./favUtils";

const FavoriteButton = ({ userId, product }) => {
const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (userId && product?.id) {
      isFavorite(userId, product.id).then(setIsFav);
    }
  }, [userId, product?.id]);

  const toggleFavorite = async () => {
    if (isFav) {
      await removeFromFavorites(userId, product.id);
      setIsFav(false);
    } else {
      await addToFavorites(userId, product);
      setIsFav(true);
    }
  };

  return (
    <button onClick={toggleFavorite} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: isFav ? "red" : "#ccc" }}
      title={isFav ? "Remove from favorites" : "Add to favorites"}>{isFav ? "❤️" : "🤍"}</button>
  );
};

export default FavoriteButton;
