import productModel from "../../models/productModel.js";

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productModel.findById(productId);

        if (!product) {
            return res.status(401).send({
                success: false,
                message: "No Product Found",
                errorType: "productNotFound",
            });
        }

        // --- Handle removed images ---
        let removedImages = req.body.removedImages;
        if (typeof removedImages === "string") {
            removedImages = [removedImages];
        }

        if (Array.isArray(removedImages) && removedImages.length > 0) {
            product.images = product.images.filter(
                (img) => !removedImages.includes(img.public_id || img.url)
            );
        }

        // --- Handle new images (no upload, just accept provided URLs or paths) ---
        let newImages = [];
        if (req.body.images) {
            newImages = Array.isArray(req.body.images)
                ? req.body.images
                : [req.body.images];
        }

        const imagesLink = newImages.map((image) => ({
            url: image, // treat as URL or local path
            public_id: image, // dummy id or can omit entirely
        }));

        // Combine old and new images
        const oldImages = req.body.oldImages
            ? JSON.parse(req.body.oldImages)
            : product.images || [];

        product.images = [...oldImages, ...imagesLink];

        // --- Handle brand info ---
        let brandLogo = null;
        const oldLogo = req.body.oldLogo ? JSON.parse(req.body.oldLogo) : null;
        if (req.body.logo && req.body.logo !== "null") {
            brandLogo = {
                url: req.body.logo, // URL or local path
            };
        }

        product.brand = {
            name: req.body.brandName || product.brand?.name,
            logo: brandLogo || oldLogo || product.brand?.logo,
        };

        // --- Update other product fields ---
        product.name = req.body.name || product.name;
        product.warranty = req.body.warranty || product.warranty;
        product.stock = req.body.stock || product.stock;
        product.category = req.body.category || product.category;
        product.description = req.body.description || product.description;
        product.price = req.body.price || product.price;
        product.discountPrice = req.body.discountPrice || product.discountPrice;
        product.ratings = req.body.ratings || product.ratings;
        product.highlights = req.body.highlights || product.highlights;

        // --- Update specifications ---
        if (Array.isArray(req.body.specifications)) {
            product.specifications = req.body.specifications.map((s) => {
                try {
                    return typeof s === "string" ? JSON.parse(s) : s;
                } catch {
                    return s;
                }
            });
        }

        // --- Save updated product ---
        const updatedProduct = await product.save();
        res.status(201).send({
            success: true,
            updatedProduct,
        });
    } catch (error) {
        console.error("Updating Product Error:", error);
        res.status(500).send({
            success: false,
            message: "Error in Updating Product",
            error,
        });
    }
};

export default updateProduct;
