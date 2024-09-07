const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

// Create a new invoice
router.post('/invoices', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    const savedInvoice = await invoice.save();
    res.status(201).json(savedInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get invoice by ID
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update invoice
router.put('/invoices/:id', async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete invoice
router.delete('/invoices/:id', async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.status(200).json({ message: 'Invoice deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/guests', async (req, res) => {
  try {
    // Fetch only the 'guestName' field from the invoices collection
    const guests = await Invoice.find({}, 'guestName');

    // Use a Set to ensure unique guest names
    const uniqueGuestNames = new Set(guests.map(guest => guest.guestName));

    // Convert Set back to Array
    const guestNamesArray = Array.from(uniqueGuestNames);

    // Send the unique guest names as a response
    res.json(guestNamesArray);
  } catch (err) {
    console.error('Error fetching guest names:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});
module.exports = router;
