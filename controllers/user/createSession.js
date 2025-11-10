// No stripe imports needed
import dotenv from "dotenv";
dotenv.config();

const createSession = async (req, res) => {
    try {
        const {
            products,
            frontendURL,
            customerEmail,
            customerPhone,
            customerName,
        } = req.body;

        // Instead of creating a Stripe checkout session,
        // just simulate a success/failure response for testing.

        const successPath = "/shipping/confirm";
        const cancelPath = "/shipping/failed";

        const successURL = frontendURL + successPath;
        const cancelURL = frontendURL + cancelPath;

        // You can calculate total amount manually if needed
        const totalAmount = products?.reduce((acc, item) => {
            return acc + item.discountPrice * item.quantity;
        }, 0);

        // Mock session data (just to mimic a real payment session)
        const session = {
            id: "fake_session_" + Date.now(),
            amount_total: totalAmount * 100, // in paise
            currency: "inr",
            customer: {
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
            },
            products,
            success_url: successURL,
            cancel_url: cancelURL,
            payment_status: "unpaid", // can be updated to "paid" manually after mock checkout
        };

        console.log("Mock payment session created:", session);

        // Send mock session back to frontend
        res.status(200).send({
            success: true,
            session,
            message: "Payment session simulated (Stripe removed).",
        });
    } catch (error) {
        console.log("Error in creating session: " + error);
        res.status(500).send({
            success: false,
            message: "Error in creating mock payment session",
            error,
        });
    }
};

export default createSession;
