import Asset from "../models/asset.model.js";
import AssetLog from "../models/assetLog.model.js";

// @desc    Fetch all assets
// @route   GET /api/assets
// @access  Public (for simplicity)
export const getAssets = async (req, res) => {
    try {
        const assets = await Asset.find({}).populate("assignedTo", "name email");
        res.json(assets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new asset
// @route   POST /api/assets
// @access  Public
export const createAsset = async (req, res) => {
    try {
        const { assetCode, name, category, description, conditionStatus, purchasePrice, purchaseDate } = req.body;

        const assetExists = await Asset.findOne({ assetCode });
        if (assetExists) {
            return res.status(400).json({ message: "Asset Code already exists" });
        }

        const asset = new Asset({
            assetCode,
            name,
            category,
            description,
            conditionStatus,
            purchasePrice: purchasePrice || 0,
            currentValue: purchasePrice || 0,
            purchaseDate,
        });

        const createdAsset = await asset.save();

        // Create log
        await AssetLog.create({
            asset: createdAsset._id,
            action: 'create',
            message: `Asset created: ${name}`,
            user: req.user?._id
        });

        res.status(201).json(createdAsset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get recent asset activity (e.g., recently updated/created assets)
// @route   GET /api/assets/activity
// @access  Public (or protected, depending on requirements)
export const getRecentActivity = async (req, res) => {
    try {
        const activities = await AssetLog.find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("asset", "name assetCode")
            .populate("user", "name");

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an asset
// @route   PATCH /api/assets/:id
// @access  Private
export const updateAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (asset) {
            const oldStatus = asset.status;
            asset.name = req.body.name || asset.name;
            asset.assetCode = req.body.assetCode || asset.assetCode;
            asset.category = req.body.category || asset.category;
            asset.description = req.body.description || asset.description;
            asset.status = req.body.status || asset.status;
            asset.conditionStatus = req.body.conditionStatus || asset.conditionStatus;
            asset.purchasePrice = req.body.purchasePrice !== undefined ? req.body.purchasePrice : asset.purchasePrice;
            asset.currentValue = req.body.currentValue !== undefined ? req.body.currentValue : asset.currentValue;

            const updatedAsset = await asset.save();

            // Log if status changed
            if (oldStatus !== updatedAsset.status) {
                await AssetLog.create({
                    asset: updatedAsset._id,
                    action: 'update',
                    message: `Status changed from ${oldStatus} to ${updatedAsset.status}`,
                    user: req.user?._id
                });
            } else {
                await AssetLog.create({
                    asset: updatedAsset._id,
                    action: 'update',
                    message: `Asset details updated`,
                    user: req.user?._id
                });
            }

            res.json(updatedAsset);
        } else {
            res.status(404).json({ message: "Asset not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete an asset
// @route   DELETE /api/assets/:id
// @access  Private
export const deleteAsset = async (req, res) => {
    try {
        const asset = await Asset.findById(req.params.id);
        if (asset) {
            await Asset.findByIdAndDelete(req.params.id);
            res.json({ message: "Asset removed" });
        } else {
            res.status(404).json({ message: "Asset not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAssetByCode = async (req, res) => {
    try {
        const asset = await Asset.findOne({ assetCode: req.params.code }).populate("assignedTo", "name email");
        if (asset) {
            res.json(asset);
        } else {
            res.status(404).json({ message: "Asset not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
