import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Wishlist from "./Pages/Wishlist";
import ProductList from "./Pages/ProductList";
import CartPage from "./Pages/CartPage";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CheckoutForm from "./Components/Checkoutform";

const App = () => {
  const userId = "u1234567890"; 

  return (
    <Router>
      {/* Navbar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Shop
          </Typography>
          <Box>
            <Button component={Link} to="/" color="inherit">
              Products
            </Button>
            <Button component={Link} to="/wishlist" color="inherit">
              Favorites
            </Button>
            <Button component={Link} to="/cart" color="inherit">
              Cart
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Routes */}
      <Routes>
        <Route path="/" element={<ProductList userId={userId} />} />
        <Route path="/wishlist" element={<Wishlist userId={userId} />} />
        <Route path="/cart" element={<CartPage userId={userId} />} />
        <Route path="/Checkout" element={<CheckoutForm userId={userId} />} />
        

      </Routes>
      <ToastContainer />
    </Router>
  );
};

export default App;
