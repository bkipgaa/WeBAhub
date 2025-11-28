const User = require("../models/users"); // Import the User model
const Ticket = require("../models/Tickets"); // Ensure the model path is correct
const StatusLog = require("../models/Statuslog"); // Import the StatusLog model

exports.createTicket = async (req, res) => {
  try {
    // Fetch the creator's user details based on the username in the request body, populating the role
    const createdByUser = await User.findOne({
      username: req.body.createdBy,
    }).populate("role");

    // Log the found creator user, if any
    if (createdByUser) {
      console.log(
        `User found: ${createdByUser.username} with role: ${createdByUser.role.name}`
      );
    } else {
      console.log("Creator user not found.");
    }

    // Check if the user is found and if they have the required role
    if (
      !createdByUser ||
      !["Admin", "Customer-Service"].includes(createdByUser.role.name)
    ) {
      return res
        .status(403)
        .json({
          message:
            "Access denied. Only admins and customer service can create tickets.",
        });
    }

    // Fetch the ObjectId for the assigned technician, also populating the role
    const assignedTechnician = await User.findOne({
      username: req.body.assignedTechnician,
    }).populate("role");

    if (!assignedTechnician) {
      return res
        .status(404)
        .json({ message: "Assigned technician not found." });
    }

    // Create a ticket instance including both ID and username
    const ticket = new Ticket({
      ticketType: req.body.ticketType,
      clientName: req.body.clientName,
      mobileNumber: req.body.mobileNumber,
      installationType: req.body.installationType,
      assignedTechnician: {
        id: assignedTechnician._id, // Store the technician's ObjectId
        username: assignedTechnician.username, // Store the technician's username
      },
      createdBy: {
        id: createdByUser._id, // Store the creator's ObjectId
        username: createdByUser.username, // Store the creator's username
      },
      pppoeCredentials: {
        username: req.body.pppoeUsername,
        password: req.body.pppoePassword,
      },
      location: req.body.location,
      createdAt: req.body.createdAt || Date.now(),
    });

    // Save the ticket to the database
    await ticket.save();
    res.status(201).json(ticket); // Respond with the created ticket
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ message: error.message }); // Respond with an error message
  }
};

// Add this to your ticket controller to update tickets in admin panel
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate({
        path: "createdBy.id", // Populate the creator's details
        populate: { path: "role", select: "name" }, // Populate the role of the creator
      })
      .populate({
        path: "assignedTechnician.id", // Populate the technician's details
        populate: { path: "role", select: "name" }, // Populate the role of the technician
      });

    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tickets." });
  }
};

// Fetch closed tickets for the admin panel
exports.fetchClosedTickets = async (req, res) => {
  try {
    const closedTickets = await Ticket.find({ status: 'Complete' })
      .populate({
        path:"createdBy.id", //populate the technicians details
        populate: { path: "role", select: "name" }, // Populate the role of the creator
      })
      .populate({
        path: "assignedTechnician.id", // Populate the technician's details
        populate: { path: "role", select: "name" }, // Populate the role of the technician
      });
      //  assignedTechnician'); // Include technician and creator details

    res.json(closedTickets);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching closed tickets' });
  }
};

// Controller function to fetch tickets for a specific technician
exports.getTechnicianTickets = async (req, res) => {
  try {
    const { username } = req.params; // Technician's username from the route parameter

    // Fetch tickets where the assigned technician matches the username
    const tickets = await Ticket.find({
      "assignedTechnician.username": username,
      status: { $ne:"Complete" } // Exclude completed tickets
    });

    res.status(200).json(tickets);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch tickets for technician." });
  }
};
// Fetch a single ticket by ID
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId)
      .populate({
        path: "createdBy.id", // Populate the creator's details
        populate: { path: "role", select: "name" }, // Populate the role of the creator
      })
      .populate({
        path: "assignedTechnician.id", // Populate the technician's details
        populate: { path: "role", select: "name" }, // Populate the role of the technician
      });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching ticket" });
  }
};

// Function to update status based on the current state
exports.updateTicketStatus = async (req, res) => {
  try {
    // Get the current ticket
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Define the allowed status transitions
    const statusFlow = [
      "Seen",
      "Leaving for Site",
      "Enroute",
      "Arrived on Site",
      "Submit Details",
      "Complete",
    ];

    // Find the next status in the sequence
    const currentIndex = statusFlow.indexOf(ticket.status);
    if (currentIndex === -1 || currentIndex === statusFlow.length - 1) {
      return res.status(400).json({ message: "Cannot update status further" });
    }

    // Update the status to the next step
    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      { status: statusFlow[currentIndex + 1] }, // Move to next status
      { new: true }
    );

    res.json(updatedTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating status" });
  }
};

// Submit additional details for a ticket
exports.submitTicketDetails = async (req, res) => {
  const {
    speedtestScreenshot,
    wanPhoto,
    lanPhoto,
    macAddress,
    signalReceived,
    bomUsed,
    additionalNotes,
  } = req.body; // Extract details from the request body
  try {
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
    res.json(ticket); // Send the updated ticket as a JSON response
  } catch (err) {
    res.status(500).json({ message: "Error submitting details" }); // Handle any errors
  }
};

exports.closeTicket = async (req, res) => {
  try {
    // Mark the ticket as complete without requiring req.user.id
    const ticket = await Ticket.findByIdAndUpdate(
      req.params.ticketId,
      {
        status: "Complete",
      },
      { new: true }
    ).populate({
      path: "createdBy.id", // Populate the creator's details
      populate: { path: "role", select: "name" }, // Populate the role of the creator
    })
    .populate({
      path: "assignedTechnician.id", // Populate the technician's details
      populate: { path: "role", select: "name" }, // Populate the role of the technician
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Log the status change in the StatusLog collection (without user ID)
    await StatusLog.create({
      ticket: ticket._id,
      status: "Complete",
    });

    res.json(ticket); // Send the updated ticket as a JSON response
  } catch (err) {
    res.status(500).json({ message: "Error closing ticket" }); // Handle any errors
  }
};
