import dotenv from "dotenv";
dotenv.config();
import orderModel from "../../models/orderModel.js";
import mongoose from "mongoose";
import productModel from "../../models/productModel.js";

const handleSuccess = async (req, res) => {
    try {
        // Retrieve mock payment/session info from client
        const { sessionId, orderItems, shippingInfo, paymentInfo } = req.body;
        console.log("sessionId, orderItems: ", sessionId, orderItems);

        // Validate order items
        if (!orderItems || !orderItems.length) {
            return res.status(400).send({
                success: false,
                message: "No order items received from client!",
            });
        }

        // Instead of retrieving Stripe session, we’ll just simulate payment success
        const paymentIntentId = paymentInfo?.id || `mock_payment_${Date.now()}`;
        const amount =
            paymentInfo?.amount ||
            orderItems.reduce(
                (acc, item) => acc + item.discountPrice * item.quantity,
                0
            );

        // Map order items to database format
        const orderObject = orderItems.map((product) => ({
            name: product.name,
            image: product.image,
            brandName: product.brandName,
            price: product.price,
            discountPrice: product.discountPrice,
            quantity: product.quantity,
            productId: new mongoose.Types.ObjectId(product.productId),
            seller: new mongoose.Types.ObjectId(product.seller),
        }));

        // Construct shipping info
        const shippingObject = {
            address: shippingInfo?.address || "Unknown",
            city: shippingInfo?.city || "Unknown",
            state: shippingInfo?.state || "Unknown",
            country: shippingInfo?.country || "Unknown",
            pincode: shippingInfo?.pincode || "000000",
            phoneNo: shippingInfo?.phoneNo || "Not Provided",
            landmark: shippingInfo?.landmark || "N/A",
        };

        // Create and save the order in MongoDB
        const combinedOrder = {
            paymentId: paymentIntentId,
            products: orderObject,
            buyer: req.user._id,
            shippingInfo: shippingObject,
            amount,
        };

        const order = new orderModel(combinedOrder);
        await order.save();

        // Reduce stock for each product
        for (const item of orderItems) {
            const product = await productModel.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            } else {
                console.warn(`Product with ID ${item.productId} not found`);
            }
        }

        // Respond with success
        return res.status(200).send({
            success: true,
            message: "Order successfully created (Stripe removed).",
            order,
        });
    } catch (error) {
        console.error("Error in handling payment success:", error);
        return res.status(500).send({
            success: false,
            message: "Error in handling payment success",
            error,
        });
    }
};

export default handleSuccess;
