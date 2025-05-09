import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Box, Typography } from '@mui/material';

const PayPalPayment = ({ cartItems, onApprove, onError, onCancel }) => {
    const paypalClientId = "AWODra9-SqR61F0eAe2HQ7UZuitQLDd-Rf5cycy5QGH7FWUdfzV6bFpSXPZoJaWRptTCmyinh3tWfTET";
    const conversionRate = 50; // 1 USD = 30 EGP
  
    // Enhanced order creation with validation
    const createOrder = async (data, actions) => {
      try {
        // Validate cart items
        if (!cartItems || cartItems.length === 0) {
          throw new Error("Your cart is empty");
        }
  
        // Calculate order details
        const { items, calculatedTotal } = calculateOrderDetails(cartItems, conversionRate);
  
        // Log for debugging
        console.log("Creating PayPal order with:", {
          items,
          total: calculatedTotal,
          currency: "USD"
        });
  
        // Create the order
        return actions.order.create({
          purchase_units: [{
            description: "Online Store Purchase",
            amount: {
              currency_code: "USD",
              value: calculatedTotal,
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: calculatedTotal
                }
              }
            },
            items
          }],
          application_context: {
            brand_name: "Your Store Name",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW"
          }
        });
      } catch (err) {
        console.error("Order creation failed:", err);
        throw new Error("Failed to create payment order. Please try again.");
      }
    };
  
    // Separate calculation function
    const calculateOrderDetails = (cartItems, rate) => {
      const items = cartItems.map(item => ({
        name: item.title.substring(0, 127),
        unit_amount: {
          currency_code: "USD",
          value: (item.price / item.quantity / rate).toFixed(2)
        },
        quantity: item.quantity.toString(),
        category: "PHYSICAL_GOODS",
        description: item.description?.substring(0, 127) || ""
      }));
  
      const total = items.reduce((sum, item) => {
        return sum + (parseFloat(item.unit_amount.value) * parseInt(item.quantity));
      }, 0).toFixed(2);
  
      return { items, calculatedTotal: total };
    };
  
    // Enhanced error handling
    const handleError = (err) => {
      const errorDetails = {
        message: err.message,
        ...(err.correlationId && { correlationId: err.correlationId }),
        ...(err.details && { details: err.details }),
        timestamp: new Date().toISOString()
      };
  
      console.error("PayPal Payment Error:", errorDetails);
      
      // User-friendly error messages
      let userMessage = "Payment processing failed";
      if (err.message.includes("unauthorized")) {
        userMessage = "Payment authorization failed. Please try again or use another method.";
      }
  
      onError({
        ...errorDetails,
        userMessage
      });
    };
  
    return (
      <Box sx={{ minHeight: '200px', mt: 2 }}>
        <PayPalScriptProvider 
          options={{
            "client-id": paypalClientId,
            currency: "USD",
            intent: "capture",
            "data-sdk-integration-source": "react-paypal-js"
          }}
        >
          <PayPalButtons 
            style={{ 
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal"
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            onError={handleError}
            onCancel={onCancel}
          />
        </PayPalScriptProvider>
      
     
     
      <Typography variant="body2" color="text.secondary" mt={1}>
        You'll be redirected to PayPal to complete your purchase securely.
      </Typography>
    </Box>
  );
};

export default PayPalPayment;