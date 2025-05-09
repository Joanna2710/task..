import React, { useEffect, useState } from "react";
import { Box, Card, CardMedia, CardContent, Typography, Button, Stack } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "../../Firebase/firebase";
import { addToCart } from "../../Components/cart/cartUtils";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const [selectedSize] = useState(null);
  const [hoveredSize, setHoveredSize] = useState(null);
  const [randomPrice, setRandomPrice] = useState(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const userId = "u1234567890";
  const navigate = useNavigate();

  useEffect(() => {
    const basePrice = parseFloat(product.price?.amount);
    const generatedPrice = basePrice || Math.floor(Math.random() * 900 + 1000);
    setRandomPrice(generatedPrice.toFixed(2));
  }, [product.price]);

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const favRef = doc(db, "favorites", userId, "items", product.id);
        const docSnap = await getDoc(favRef);
        setInWishlist(docSnap.exists());
      } catch (error) {
        console.error("Error checking favorite:", error);
      }
    };
    checkFavorite();
  }, [product.id]);

  const toggleWishlist = async () => {
    const favRef = doc(db, "favorites", userId, "items", product.id);
    try {
      if (inWishlist) {
        await deleteDoc(favRef);
        setInWishlist(false);
        toast.success("❌ Product removed from wishlist");
      } else {
        await setDoc(favRef, {
          ...product,
          addedAt: new Date().toISOString(),
        });
        setInWishlist(true);
        toast.success("✅ Product added to wishlist");
      }
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  const handleImageMouseEnter = () => setIsHovered(true);
  const handleImageMouseLeave = () => setIsHovered(false);
  const handleSizeMouseEnter = (size) => setHoveredSize(size);
  const handleSizeMouseLeave = () => setHoveredSize(null);

  const extraSizes = 3;

  return (
    <Card className="product-card">
      <Box className="sale-tag">Sale 70%</Box>

      <Box
        className={`wishlist-container ${isWishlistHovered ? "hovered" : ""} ${inWishlist ? "active" : ""}`}
        onClick={toggleWishlist}
        onMouseEnter={() => setIsWishlistHovered(true)}
        onMouseLeave={() => setIsWishlistHovered(false)}
      >
        {inWishlist ? (
          <FavoriteIcon className="wishlist-icon" style={{ color: "red" }} />
        ) : (
          <FavoriteBorderIcon className="wishlist-icon" style={{ color: "black" }} />
        )}
        {(isWishlistHovered || inWishlist) && (
          <span className="wishlist-text">
            {inWishlist ? "Added To Wishlist" : "Add To Wishlist"}
          </span>
        )}
      </Box>

      <Box
        className="image-container"
        onMouseEnter={handleImageMouseEnter}
        onMouseLeave={handleImageMouseLeave}
      >
        <CardMedia
          component="img"
          className="product-image"
          image={product.image?.src}
          alt={product.title}
          onClick={() => navigate("/productDetails", { state: { product } })}
        />

        {isHovered && (
          <Box className="size-options-container">
            <Box className="size-options">
              {product.sizes.map((size) => (
                <Box
                  key={size}
                  onMouseEnter={() => handleSizeMouseEnter(size)}
                  onMouseLeave={handleSizeMouseLeave}
                  className="size-circle"
                  sx={{
                    backgroundColor:
                      hoveredSize === size || selectedSize === size
                        ? "white"
                        : "black",
                    color:
                      hoveredSize === size || selectedSize === size
                        ? "black"
                        : "white",
                  }}
                >
                  {size}
                </Box>
              ))}
              <Box
                className="extra-sizes"
                onMouseEnter={() => handleSizeMouseEnter("extra")}
                onMouseLeave={handleSizeMouseLeave}
                sx={{ color: hoveredSize === "extra" ? "black" : "white" }}
              >
                +{extraSizes}
              </Box>
            </Box>
          </Box>
        )}

        {isHovered && (
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            className="quick-add-button"
            onClick={async () => {
              if (!isAddedToCart) {
                try {
                  await addToCart(userId, product);
                  setIsAddedToCart(true);
                  toast.success("✅ Added to cart!");
                } catch (error) {
                  toast.error(error.message || "❌ Failed to add to cart");
                }
              }
            }}
            sx={{ mt: 1 }}
          >
            QUICK ADD 🛒
          </Button>
        )}
      </Box>

      <CardContent className="product-info">
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
          <Typography
            variant="h6"
            component="a"
            className="product-title"
            sx={{
              fontSize: "16px",
              textDecoration: "none",
              cursor: "pointer",
              color: "black",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {product.title}
          </Typography>
          <Typography variant="h6" sx={{ fontSize: "16px", color: "black" }}>
            - {product?.colors[0]}
          </Typography>
        </Box>

        <Box className="price-container">
          <Typography variant="body2" className="original-price">
            {randomPrice} EGP
          </Typography>
          <Typography variant="body1" className="sale-price">
            {product.price?.amount || (randomPrice * 0.6).toFixed(2)}{" "}
            {product.price?.currencyCode || "EGP"}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} className="product-thumbnails" sx={{ mt: 1, px: 2, justifyContent: "center" }}>
          {product.colors.map((color, index) => (
            <Box
              key={index}
              sx={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                backgroundColor: color,
                border: "1px solid #ccc",
                cursor: "pointer",
                "&:hover": { border: "1px solid #000" },
              }}
            />
          ))}
        </Stack>
      </CardContent>
      <ToastContainer position="top-center" />
    </Card>
  );
};

export default ProductCard;
