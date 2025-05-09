import React, { useEffect, useState } from "react";
import { db } from "../Firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Box, CircularProgress, Container, Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ProductCard from "../Components/products/ProductCard";


const theme = createTheme({
  palette: {
    primary: { main: "#ffeb3b" },
    secondary: { main: "#f44336" },
  },
});

const ProductList = ({ category, onProductClick }) => {
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizeFilterValue = (value) => {
    return String(value).toLowerCase().trim().replace(/['"]/g, "");
  };

  const filterProducts = (data, filters) => {
    if (!filters || !data.length) return data;

    return data.filter((product) => {
      if (filters.availability) {
        const inStock = product.in_stock || product.quantity > 0;
        if (filters.availability.inStock && !inStock) return false;
        if (filters.availability.outOfStock && inStock) return false;
      }

      if (filters.price) {
        const price = product.price?.amount || 0;
        if (price < (filters.price.min || 0)) return false;
        if (price > (filters.price.max || Infinity)) return false;
      }

      if (filters.brand) {
        const productBrands = Array.isArray(product.brand)
          ? product.brand.map(normalizeFilterValue)
          : [normalizeFilterValue(product.brand || "")];
        const activeBrands = Object.keys(filters.brand)
          .filter((b) => filters.brand[b])
          .map(normalizeFilterValue);
        if (activeBrands.length > 0) {
          if (!productBrands.some((brand) => activeBrands.includes(brand)))
            return false;
        }
      }

      if (filters.size) {
        const productSizes = (product.sizes || []).map(normalizeFilterValue);
        const activeSizes = Object.keys(filters.size)
          .filter((s) => filters.size[s])
          .map(normalizeFilterValue);
        if (activeSizes.length > 0) {
          if (!productSizes.some((size) => activeSizes.includes(size)))
            return false;
        }
      }

      if (filters.color) {
        const productColors = (product.colors || []).map(normalizeFilterValue);
        const activeColors = Object.keys(filters.color)
          .filter((c) => filters.color[c])
          .map(normalizeFilterValue);
        if (activeColors.length > 0) {
          if (!productColors.some((color) => activeColors.includes(color)))
            return false;
        }
      }

      return true;
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const collectionPath = ["kids", "closes", "Boys Pullovers"];

        const colRef = collection(db, ...collectionPath);
        const snapshot = await getDocs(colRef);

        if (snapshot.empty) {
          setError("No products found in this category");
          setRawProducts([]);
          return;
        }

        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            ...docData,
            brand: docData.brand || ["Unknown Brand"],
            colors: docData.colors || [],
            sizes: (docData.sizes || []).map((s) => s.replace(/['"]/g, "")),
            price: {
              amount: docData.price?.amount || 0,
              currencyCode: docData.price?.currencyCode || "USD",
            },
            in_stock: docData.in_stock || false,
            quantity: docData.quantity || 0,
            title: docData.title || "Untitled Product",
            image: docData.image || "",
          };
        });

        setRawProducts(data);
      } catch (error) {
        console.error("Firebase error:", error);
        setError(`Failed to load products: ${error.message}`);
        setRawProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);


  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {loading ? (
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flex: 1,
            }}
          >
            <CircularProgress thickness={4} size={100} color="inherit" />
          </Box>
        ) : error ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flex={1}
            p={4}
          >
            <Typography variant="h5" color="error">
              {error}
            </Typography>
          </Box>
        ) : (
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: "black",
                color: "white",
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Typography variant="h4">Products</Typography>
              <Typography variant="subtitle1">
                {rawProducts.length} products found
              </Typography>
            </Box>

            {rawProducts.length === 0 ? (
              <Typography variant="h5" textAlign="center" py={8}>
                No products match the current filters
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 3,
                }}
              >
                {rawProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={onProductClick}
                  />
                ))}
              </Box>
            )}
          </Container>
        )}
      </Box>
    </ThemeProvider>
  );
};

export default ProductList;