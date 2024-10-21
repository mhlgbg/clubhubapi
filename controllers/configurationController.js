const Configuration = require('../models/Configuration');
// Get configuration by key
exports.getConfigByKey = async (req, res) => {
    try {
        const configKey = req.params.key;
        const config = await Configuration.findOne({ configKey });

        if (!config) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.status(200).json({ configValue: config.configValue });
    } catch (error) {
        console.error('Error fetching configuration by key:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

// Lấy danh sách cấu hình
exports.getConfigurations = async (req, res) => {
    try {
        const configurations = await Configuration.find();
        res.status(200).json(configurations);
    } catch (error) {
        console.error('Error fetching configurations:', error);
        res.status(500).json({ message: 'Error fetching configurations', error });
    }
};

// Thêm mới cấu hình
exports.createConfiguration = async (req, res) => {
    console.log("createConfiguration: ", req.body);
    try {
        const { configKey, configValueType, configValue } = req.body;

        // Kiểm tra nếu configKey đã tồn tại
        const existingConfig = await Configuration.findOne({ configKey });
        if (existingConfig) {
            return res.status(400).json({ message: 'ConfigKey already exists' });
        }

        const newConfig = new Configuration({
            configKey,
            configValueType,
            configValue,
        });

        const savedConfig = await newConfig.save();
        res.status(201).json(savedConfig);
    } catch (error) {
        console.error('Error creating configuration:', error);
        res.status(500).json({ message: 'Error creating configuration', error });
    }
};

// Cập nhật cấu hình
exports.updateConfiguration = async (req, res) => {
    try {
        const { id } = req.params;
        const { configKey, configValueType, configValue } = req.body;

        const updatedConfig = await Configuration.findByIdAndUpdate(
            id,
            { configKey, configValueType, configValue },
            { new: true }
        );

        if (!updatedConfig) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.status(200).json(updatedConfig);
    } catch (error) {
        console.error('Error updating configuration:', error);
        res.status(500).json({ message: 'Error updating configuration', error });
    }
};

// Xóa cấu hình
exports.deleteConfiguration = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedConfig = await Configuration.findByIdAndDelete(id);

        if (!deletedConfig) {
            return res.status(404).json({ message: 'Configuration not found' });
        }

        res.status(200).json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        console.error('Error deleting configuration:', error);
        res.status(500).json({ message: 'Error deleting configuration', error });
    }
};
