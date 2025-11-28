// models/Service.js
const mongoose = require ('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. Internet Services
  subservices: [{ type: String }]         // e.g. ['Internet Installation', 'Network Expansion']
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
