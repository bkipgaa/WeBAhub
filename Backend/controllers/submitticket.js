const upload = require('../multerconfig'); // Import Multer config
const Ticket = require("../models/Tickets"); // Ensure the model path is correct

exports.submitTicketDetails = [
  upload.fields([
    { name: 'speedtestScreenshot', maxCount: 1 },
    { name: 'wanPhoto', maxCount: 1 },
    { name: 'lanPhoto', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log('Request Body:', req.body); // Log the request body
      console.log('Request Files:', req.files); // Log the uploaded files
      const { macAddress, signalReceived, bomUsed, additionalNotes } = req.body;

      // Get file paths for uploaded images
      const speedtestScreenshot = req.files['speedtestScreenshot']
        ? `/Uploads/${req.files['speedtestScreenshot'][0].filename}`
        : null;
      const wanPhoto = req.files['wanPhoto']
        ? `/Uploads/${req.files['wanPhoto'][0].filename}`
        : null;
      const lanPhoto = req.files['lanPhoto']
        ? `/Uploads/${req.files['lanPhoto'][0].filename}`
        : null;

      // Update the ticket with the provided details
      const ticket = await Ticket.findByIdAndUpdate(
        req.params.ticketId,
        {
          speedtestScreenshot,
          wanPhoto,
          lanPhoto,
          macAddress,
          signalReceived,
          bomUsed,
          additionalNotes,
        },
        { new: true }
      );

      if (!ticket) {
        return res.status(404).json({ message: 'Ticket not found' });
      }

      res.json(ticket); // Send the updated ticket as a JSON response
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error submitting details' }); // Handle any errors
    }
  },
];