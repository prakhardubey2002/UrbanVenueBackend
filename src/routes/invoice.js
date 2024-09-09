const express = require('express')
const router = express.Router()
const Invoice = require('../models/Invoice')

// Create a new invoice
router.post('/invoices', async (req, res) => {
  try {
    const invoice = new Invoice(req.body)
    const savedInvoice = await invoice.save()
    res.status(201).json(savedInvoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find()
    res.status(200).json(invoices)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get invoice by ID
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    res.status(200).json(invoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update invoice
router.put('/invoices/:id', async (req, res) => {
  try {
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    if (!updatedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    res.status(200).json(updatedInvoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete invoice
router.delete('/invoices/:id', async (req, res) => {
  try {
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id)
    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    res.status(200).json({ message: 'Invoice deleted' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
router.get('/guests', async (req, res) => {
  try {
    const guests = await Invoice.find({}, 'guestName')

    const uniqueGuestNames = new Set(guests.map((guest) => guest.guestName))

    // Convert Set back to Array
    const guestNamesArray = Array.from(uniqueGuestNames)

    // Send the unique guest names as a response
    res.json(guestNamesArray)
  } catch (err) {
    console.error('Error fetching guest names:', err)
    res.status(500).json({ message: 'Server Error' })
  }
})
// Route to get all unique property (venue) names from invoices
router.get('/venues', async (req, res) => {
  try {
    const propertyNames = await Invoice.distinct('venue')

    res.status(200).json(propertyNames)
  } catch (error) {
    console.error('Error fetching property names:', error)
    res.status(500).json({ error: 'Failed to fetch property names' })
  }
})
// Route to get all unique owner (hostOwnerName) names from invoices
router.get('/owners', async (req, res) => {
  try {
    const ownerNames = await Invoice.distinct('hostOwnerName')

    res.status(200).json(ownerNames)
  } catch (error) {
    console.error('Error fetching owner names:', error)
    res.status(500).json({ error: 'Failed to fetch owner names' })
  }
})
// Route to search invoices by status
// router.get('/search', async (req, res) => {
//   try {
//     // Get the 'status' query parameter from the request
//     const { status } = req.query

//     // Check if the status is provided and valid
//     if (!status || !['Canceled', 'Paid', 'Upcoming'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid or missing status' })
//     }

//     // Find invoices that match the provided status
//     const invoices = await Invoice.find({ status })

//     // Send the invoices as a response
//     res.status(200).json(invoices)
//   } catch (error) {
//     console.error('Error searching invoices by status:', error)
//     res.status(500).json({ error: 'Failed to search invoices by status' })
//   }
// })

router.get('/unique-phone-numbers', async (req, res) => {
  try {
    const phoneNumbers = await Invoice.distinct('phoneNumber')
    res.json(phoneNumbers)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching phone numbers', error })
  }
})
// Search invoices based on filters
router.get('/search', async (req, res) => {
  try {
    const {
      selectedGuest,
      selectedOwner,
      selectedProperty,
      selectedPhoneNumber,
      selectedStatus,
      startDate,
      endDate,
      selectedCategory // New category filter
    } = req.query;

    let filter = {};
    let missingParams = [];

    // Build filter object dynamically based on provided query parameters
    if (selectedGuest && selectedGuest.trim()) {
      filter.guestName = selectedGuest.trim();
    }

    if (selectedOwner && selectedOwner.trim()) {
      filter.hostOwnerName = selectedOwner.trim();
    }

    if (selectedProperty && selectedProperty.trim()) {
      filter.venue = selectedProperty.trim();
    }

    if (selectedPhoneNumber && selectedPhoneNumber.trim()) {
      filter.phoneNumber = selectedPhoneNumber.trim();
    }

    if (selectedStatus && selectedStatus.trim()) {
      filter.status = selectedStatus.trim();
    }

    // Category filtering
    if (selectedCategory && selectedCategory.trim()) {
      filter.occasion = selectedCategory.trim();
    }

    // Date filtering (inclusive of the date, ignores time)
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setUTCHours(0, 0, 0, 0); // Set time to midnight to ignore the time component

      const end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999); // Set time to end of day to ensure inclusivity

      // Check if either checkInDate or checkOutDate falls within the range
      filter.$or = [
        { checkInDate: { $gte: start, $lte: end } }, // Check if the checkInDate is within the range
        { checkOutDate: { $gte: start, $lte: end } }, // Check if the checkOutDate is within the range
        {
          checkInDate: { $lte: end }, // Check if the checkInDate is before the endDate
          checkOutDate: { $gte: start }, // Check if the checkOutDate is after the startDate
        },
      ];
    } else {
      missingParams.push('Start Date and End Date');
    }

    // Log missing parameters
    if (missingParams.length > 0) {
      console.log(`Missing Parameters: ${missingParams.join(', ')}`);
    }

    // Find invoices based on the constructed filter object
    const invoices = await Invoice.find(filter);

    // Return the filtered invoices
    res.status(200).json({
      success: true,
      data: invoices,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});




module.exports = router
