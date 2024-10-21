const Video = require('../models/Video');

exports.getVideosForMobile = async (req, res) => {
    try {        
        const { page = 1, limit = 10 } = req.query; // Lấy số trang và giới hạn từ query params

        // Tìm tất cả các huấn luyện viên với giới hạn và phân trang
        const videos = await Video.find()
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        // Đếm tổng số huấn luyện viên
        const totalVideos = await Video.countDocuments();

        res.json({
            totalPages: Math.ceil(totalVideos / limit),
            currentPage: parseInt(page),
            videos,
        });
    } catch (error) {
        console.log("getRefereesForMobile: ", error);
        res.status(500).json({ message: 'Có lỗi xảy ra khi lấy danh sách huấn trọng tài' });
    }
};

// Get videos with search and pagination
exports.getVideos = async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};

  try {
    const videos = await Video.find(query)
      .sort({ videoDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('sportId', 'name'); // Assuming you want to show the sport name
    
    const count = await Video.countDocuments(query);

    res.status(200).json({
      videos,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos', error });
  }
};

// Add a new video
exports.addVideo = async (req, res) => {
  const { sportId, name, youtubeLink, description, videoDate } = req.body;

  try {
    const newVideo = new Video({ sportId, name, youtubeLink, description, videoDate });
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (error) {
    res.status(400).json({ message: 'Error adding video', error });
  }
};

// Get video by ID
exports.getVideoById = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id).populate('sportId', 'name');
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching video', error });
  }
};

// Update video
exports.updateVideo = async (req, res) => {
  const { id } = req.params;
  const { sportId, name, youtubeLink, description, videoDate } = req.body;

  try {
    const updatedVideo = await Video.findByIdAndUpdate(id, { sportId, name, youtubeLink, description, videoDate }, { new: true });
    if (!updatedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json(updatedVideo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating video', error });
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedVideo = await Video.findByIdAndDelete(id);
    if (!deletedVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json({ message: 'Video deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video', error });
  }
};
// API route to get videos by a list of YouTube links
exports.getVideosByLinks = async (req, res) => {
  //console.log("getVideosByLinks", req.query.links);
  try {
    let links = req.query.links;

    // Ensure links is an array (in case it is passed as a string)
    if (typeof links === 'string') {
      links = links.split(',');
    }

    // Find videos with YouTube links in the provided array
    const videos = await Video.find({ youtubeLink: { $in: links } });
    
    res.status(200).json(videos);
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos', error });
  }
};

// API để lấy danh sách video với phân trang
exports.getVideosPaginated = async (req, res) => {
  try {
      const { page = 1, limit = 20 } = req.query;

      // Chuyển đổi page và limit thành số nguyên
      const pageNumber = parseInt(page);
      const limitNumber = parseInt(limit);

      // Tính toán để lấy dữ liệu phân trang
      const videos = await Video.find()
          .sort({ uploadedAt: -1 }) // Sắp xếp theo thời gian tải lên
          .skip((pageNumber - 1) * limitNumber)
          .limit(limitNumber);

      // Tính tổng số video
      const totalVideos = await Video.countDocuments();

      res.status(200).json({
          videos,
          totalPages: Math.ceil(totalVideos / limitNumber),
      });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching videos', error });
  }
};