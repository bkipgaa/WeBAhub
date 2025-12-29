import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './TechnicianTickets.css';

const TechnicianTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState(null);
  const [macAddress, setMacAddress] = useState('');
  const [signalReceived, setSignalReceived] = useState('');
  const [bomUsed, setBomUsed] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [speedtestScreenshot, setSpeedtestScreenshot] = useState(null);
const [wanPhoto, setWanPhoto] = useState(null);
const [lanPhoto, setLanPhoto] = useState(null);
const [speedtestScreenshotName, setSpeedtestScreenshotName] = useState('');
const [wanPhotoName, setWanPhotoName] = useState('');
const [lanPhotoName, setLanPhotoName] = useState('');


const handleSpeedtestScreenshotChange = (e) => {
  const file = e.target.files[0];
  setSpeedtestScreenshot(file);
  setSpeedtestScreenshotName(file ? file.name : '');
};

const handleWanPhotoChange = (e) => {
  const file = e.target.files[0];
  setWanPhoto(file);
  setWanPhotoName(file ? file.name : '');
};

const handleLanPhotoChange = (e) => {
  const file = e.target.files[0];
  setLanPhoto(file);
  setLanPhotoName(file ? file.name : '');
};
  // Function to fetch tickets
  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/fetchtickets/assigned', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data); // Update the tickets state
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tickets on component mount or when status changes
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/fetchtickets/assigned', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(response.data); // Update the tickets state
  
        // Log the fetched tickets
        console.log('Fetched Tickets:', response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching tickets');
      } finally {
        setLoading(false);
      }
    };
  
    fetchTickets();
  }, [status]);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status || null);
  };

  const statusFlow = ["Seen", "Leaving for Site", "Enroute", "Arrived on Site", "Submit Details", "Complete"];


  const submitDetails = async () => {
    try {
      if (!selectedTicket || !selectedTicket._id) {
        toast.error("No ticket selected");
        return;
      }

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("macAddress", macAddress);
      formData.append("signalReceived", signalReceived);
      formData.append("bomUsed", bomUsed);
      formData.append("additionalNotes", additionalNotes);
      if (speedtestScreenshot) formData.append("speedtestScreenshot", speedtestScreenshot);
      if (wanPhoto) formData.append("wanPhoto", wanPhoto);
      if (lanPhoto) formData.append("lanPhoto", lanPhoto);

      await axios.put(
        `http://localhost:5000/api/submitdetails/${selectedTicket._id}/submitTicketDetails`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Details submitted successfully!");

      setTimeout(() => {
        setMacAddress("");
        setSignalReceived("");
        setBomUsed("");
        setAdditionalNotes("");
        setSpeedtestScreenshot(null);
        setWanPhoto(null);
        setLanPhoto(null);
      }, 500);

      await completeTicket();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error submitting details");
    }
  };

  const completeTicket = async () => {
    try {
      if (!selectedTicket || !selectedTicket._id) {
        toast.error("No ticket selected");
        return;
      }
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/tickets/${selectedTicket._id}/status`,
        { status: "Complete" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets((prevTickets) => prevTickets.filter((ticket) => ticket._id !== selectedTicket._id));
      setSelectedTicket(null);
      toast.success("Ticket marked as Complete and removed from your list.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error completing the ticket");
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/tickets/${selectedTicket._id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div>Error: {error}</div>;


  return (
    <div className="p-4 border rounded shadow-md w-96">
      <ToastContainer />
      <h2 className="text-lg font-bold mb-2">Assigned Tickets</h2>
       {/* Add a Refresh Button */}
       <button onClick={fetchTickets} style={{ marginTop: '10px' }}>
                Refresh Tickets
              </button>

      {tickets.length === 0 ? (
        <p>No tickets assigned to you.</p>
      ) : (
        <div className="ticket-buttons">
         {tickets.map((ticket) => (
  <button key={ticket._id} className="ticket-button" onClick={() => handleTicketClick(ticket)}>
    <div className="ticket-info">
      <div><strong>Client:</strong> {ticket.clientName}</div>
      <div><strong>Phone:</strong> {ticket.mobileNumber}</div>
      <div><strong>Ticket:</strong> {ticket.ticketType}</div>
    </div>
  </button>

          ))}
        </div>
      )}

      {selectedTicket && (
        <div className="ticket-details">
          <h3>Ticket Details</h3>
          <p>
            <strong>Status:</strong>
            <select value={status || ''} onChange={handleStatusChange}>
              {statusFlow.slice(statusFlow.indexOf(status)).map((s, index) => (
                <option key={index} value={s}>{s}</option>
              ))}
            </select>
          </p>

          {status === "Arrived on Site" && (
            <div className="site-details">
              <p><strong>Client Name:</strong> {selectedTicket?.clientName}</p>
              <p><strong>Mobile Number:</strong> {selectedTicket?.mobileNumber}</p>
              <p><strong>Installation Type:</strong> {selectedTicket?.installationType}</p>
              <p><strong>Assigned Technician:</strong> {selectedTicket?.assignedTechnician?.username}</p>
              {selectedTicket?.pppoeCredentials && (
                <p>
                  <strong>PPPoE Credentials:</strong> <br />
                  <strong>Username:</strong> {selectedTicket.pppoeCredentials.username} <br />
                  <strong>Password:</strong> {selectedTicket.pppoeCredentials.password}
                </p>
              )}
              <p><strong>Location:</strong> {selectedTicket?.location}</p>
              <p><strong>Created At:</strong> {new Date(selectedTicket?.createdAt).toLocaleDateString()}</p>
            </div>
          )}

{status === "Submit Details" && (
  <div className="submit-details">
    <h4>Submit Installation Details</h4>

    {/* Speedtest Screenshot */}
    <label>
      Speedtest Screenshot:
      {speedtestScreenshotName ? (
        <div>
          <span>{speedtestScreenshotName}</span>
          <button onClick={() => {
            setSpeedtestScreenshot(null);
            setSpeedtestScreenshotName('');
          }}>Remove</button>
        </div>
      ) : (
        <input type="file" accept="image/*" onChange={handleSpeedtestScreenshotChange} />
      )}
    </label>

    {/* WAN Photo */}
    <label>
      WAN Photo:
      {wanPhotoName ? (
        <div>
          <span>{wanPhotoName}</span>
          <button onClick={() => {
            setWanPhoto(null);
            setWanPhotoName('');
          }}>Remove</button>
        </div>
      ) : (
        <input type="file" accept="image/*" onChange={handleWanPhotoChange} />
      )}
    </label>

    {/* LAN Photo */}
    <label>
      LAN Photo:
      {lanPhotoName ? (
        <div>
          <span>{lanPhotoName}</span>
          <button onClick={() => {
            setLanPhoto(null);
            setLanPhotoName('');
          }}>Remove</button>
        </div>
      ) : (
        <input type="file" accept="image/*" onChange={handleLanPhotoChange} />
      )}
    </label>

    {/* Other fields */}
    <label>
      MAC Address of Router:
      <input type="text" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} />
    </label>
    <label>
      Signal Received:
      <input type="text" value={signalReceived} onChange={(e) => setSignalReceived(e.target.value)} />
    </label>
    <label>
      BOM Used:
      <input type="text" value={bomUsed} onChange={(e) => setBomUsed(e.target.value)} />
    </label>
    <label>
      Additional Notes:
      <textarea value={additionalNotes} onChange={(e) => setAdditionalNotes(e.target.value)} />
    </label>
    <button onClick={submitDetails}>Submit</button>
  </div>
)}
        </div>
      )}
    </div>
  );
};

export default TechnicianTickets;