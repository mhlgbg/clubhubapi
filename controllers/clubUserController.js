const ClubUser = require('../models/ClubUser');

// Get all ClubUser records
exports.getClubUsers = async (req, res) => {
  try {
    const clubUsers = await ClubUser.find().populate('clubId userId createdBy'); // Populate references
    res.json(clubUsers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching club-user records' });
  }
};

// Create a new ClubUser record
exports.createClubUser = async (req, res) => {
  const { clubId, userId, createdBy } = req.body;
  try {
    const newClubUser = new ClubUser({
      clubId,
      userId,
      createdBy
    });
    const savedClubUser = await newClubUser.save();
    res.json(savedClubUser);
  } catch (error) {
    res.status(500).json({ error: 'Error creating club-user record' });
  }
};

// Update a ClubUser record
exports.updateClubUser = async (req, res) => {
  const { clubId, userId, createdBy } = req.body;
  try {
    const updatedClubUser = await ClubUser.findByIdAndUpdate(
      req.params.id,
      { clubId, userId, createdBy },
      { new: true }
    );
    res.json(updatedClubUser);
  } catch (error) {
    res.status(500).json({ error: 'Error updating club-user record' });
  }
};

// Delete a ClubUser record
exports.deleteClubUser = async (req, res) => {
  try {
    await ClubUser.findByIdAndDelete(req.params.id);
    res.json({ message: 'Club-user record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting club-user record' });
  }
};
