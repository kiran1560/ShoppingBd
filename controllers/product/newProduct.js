import productModel from "../../models/productModel.js";

const newProduct = async (req, res) => {
    try {
        // If images come as a string, convert to array
        let images = [];
        if (typeof req.body.images === "string") {
            images.push(req.body.images);
        } else {
            images = req.body.images || [];
        }

        // You can keep images as they are (maybe URLs or local file paths)
        req.body.images = images;

        // Brand info — skip uploading, just take from request
        req.body.brand = {
            name: req.body.brandName || "",
            logo: req.body.logo || "", // could be a URL or local path
        };

        // Seller info
        req.body.seller = req.user?._id || null;

        // Parse specifications if sent as strings
        let specs = [];
        if (req.body.specifications && Array.isArray(req.body.specifications)) {
            req.body.specifications.forEach((s) => {
                try {
                    specs.push(typeof s === "string" ? JSON.parse(s) : s);
                } catch (e) {
                    specs.push(s);
                }
            });
        }
        req.body.specifications = specs;

        // Create product
        const product = await productModel.create(req.body);

        res.status(201).send({
            success: true,
            product,
        });
    } catch (error) {
        console.log("New Product Error:", error);
        res.status(500).send({
            success: false,
            message: "Error in adding New Product",
            error,
        });
    }
};

export default newProduct;
