const express = require('express')
const router = express.Router()
const Invoice = require('../models/Invoice')
const Calender = require('../models/Calender')
const multer = require('multer')
// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Directory for storing photos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, file.originalname)
  },
})

const upload = multer({ storage: storage })
// Create a new invoice

// POST route to create an invoice and add the event to the farm
router.post('/invoices', upload.single('photo'), async (req, res) => {
  try {
    const photo = req.file
    // if (!photo) {
    //   return res.status(400).json({ error: 'No photo uploaded' })
    // }

    const {
      bookingId,
      guestName,
      email,
      phoneNumber,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfAdults,
      numberOfKids,
      occasion,
      bookingpartnerid,
      bookingPartnerName,
      bookingPartnerPhoneNumber,
      hostOwnerName,
      hostNumber,
      totalBooking,
      farmTref,
      otherServices,
      advance,
      advanceCollectedBy,
      advanceMode,
      balancePayment,
      securityAmount,
      urbanvenuecommission,
      venue, // This is the farm name inside details
      addressLine1,
      addressLine2,
      country,
      citySuburb,
      state,
      zipCode,
      eventAddOns,
      termsConditions,
      status,
      pendingCollectedBy,
      surplus,
      deficit,
      fullcloser,
      maplink,
      cancellledby,
      cancelreason,
    } = req.body

    // Log the incoming request body for debugging
    console.log('Request Body:', req.body)

    // Construct the event object based on the booking information
    const event = {
      title: occasion,
      start: `${checkInDate}T${checkInTime}`,
      end: `${checkOutDate}T${checkOutTime}`,
      _id: bookingId, // Add bookingId to the event
    }

    // Prepare the invoice data
    const invoiceData = {
      bookingId,
      guestName,
      email,
      phoneNumber,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfAdults,
      numberOfKids,
      occasion,
      bookingpartnerid,
      bookingPartnerName,
      bookingPartnerPhoneNumber,
      hostOwnerName,
      hostNumber,
      totalBooking,
      farmTref,
      otherServices,
      advance,
      advanceCollectedBy,
      advanceMode,
      balancePayment,
      securityAmount,
      urbanvenuecommission,
      venue,
      addressLine1,
      addressLine2,
      country,
      citySuburb,
      state,
      zipCode,
      eventAddOns,
      termsConditions,
      status,
      pendingCollectedBy,
      photo: req.file ? req.file.filename : null, // Store the photo filename
      surplus,
      deficit,
      fullcloser,
      maplink,
      cancellledby,
      cancelreason,
    }

    // Save the invoice first
    const invoice = new Invoice(invoiceData)
    const savedInvoice = await invoice.save()

    // Now add the event to the specified farm in the calendar
    const updatedCalendar = await Calender.findOneAndUpdate(
      {
        name: state,
        'places.name': citySuburb,
        'places.farms.details.name': venue, // Accessing farm name inside details
      },
      {
        $push: { 'places.$.farms.$[farm].events': event },
      },
      {
        arrayFilters: [{ 'farm.details.name': venue }], // Accessing farm name inside details
        new: true,
      }
    )

    if (!updatedCalendar) {
      // Rollback invoice if the event creation fails
      await Invoice.findByIdAndDelete(savedInvoice._id)
      return res
        .status(404)
        .json({ error: 'Farm not found, invoice not saved' })
    }

    // Check if the saved invoice exists in the database
    const verifiedInvoice = await Invoice.findById(savedInvoice._id)
    const verifiedCalendar = await Calender.findOne({
      name: state,
      'places.name': citySuburb,
      'places.farms.details.name': venue,
    })

    // Ensure both the invoice and calendar updates were successful
    if (verifiedInvoice && verifiedCalendar) {
      // Return the saved invoice and success message
      return res.status(201).json({
        message: 'Invoice and event created successfully',
        invoice: verifiedInvoice,
      })
    } else {
      // Rollback if verification fails
      await Invoice.findByIdAndDelete(savedInvoice._id)
      return res.status(500).json({ error: 'Failed to verify saved data' })
    }
  } catch (error) {
    console.error('Error creating invoice:', error.message)
    res.status(500).json({ error: error.message, stack: error.stack })
  }
})

// Get all invoices
// router.get('/invoices', async (req, res) => {
//   try {
//     const invoices = await Invoice.find();

//     // Construct base URL based on the request
//     const baseUrl = `${req.protocol}://${req.get('host')}`;

//     // Map through the invoices and add the full photo URL
//     const invoicesWithPhotoUrl = invoices.map(invoice => {
//       if (invoice.photo) {
//         invoice.photo = `${baseUrl}/uploads/${invoice.photo}`;
//       }
//       return invoice;
//     });

//     res.status(200).json(invoicesWithPhotoUrl);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });
router.get('/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find()
    res.status(200).json(invoices)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

//booking partner parmetreised apis start
router.get('/invoicesbybookingid/:bookingpartnerid', async (req, res) => {
  try {
    const bookingPartnerId = req.params.bookingpartnerid

    // Find invoices where bookingpartnerid matches the URL parameter
    const invoices = await Invoice.find({ bookingpartnerid: bookingPartnerId })

    if (invoices.length === 0) {
      return res.status(200).json([]);
    }
    

    res.status(200).json(invoices)
  } catch (error) {
    console.error('Error retrieving invoices:', error)
    res.status(500).json({ message: 'Server error' })
  }
})
router.get('/guestsbybookingid/:bookingpartnerid', async (req, res) => {
  try {
    const bookingPartnerId = req.params.bookingpartnerid

    // Find all invoices for the given bookingpartnerid, and select only the guestName field
    const guests = await Invoice.find(
      { bookingpartnerid: bookingPartnerId },
      'guestName'
    )

    // Create a Set to store unique guest names
    const uniqueGuestNames = new Set(guests.map((guest) => guest.guestName))

    // Convert the Set back to an array
    const guestNamesArray = Array.from(uniqueGuestNames)

    // Send the unique guest names as a response
    res.status(200).json(guestNamesArray)
  } catch (err) {
    console.error('Error fetching guest names:', err)
    res.status(500).json({ message: 'Server Error' })
  }
})
router.get('/ownersbybookingid/:bookingpartnerid', async (req, res) => {
  try {
    const bookingPartnerId = req.params.bookingpartnerid

    // Find distinct hostOwnerName for the given bookingpartnerid
    const ownerNames = await Invoice.distinct('hostOwnerName', {
      bookingpartnerid: bookingPartnerId,
    })

    res.status(200).json(ownerNames)
  } catch (error) {
    console.error('Error fetching owner names:', error)
    res.status(500).json({ error: 'Failed to fetch owner names' })
  }
})
router.get('/venuesbybookingid/:bookingpartnerid', async (req, res) => {
  try {
    const bookingPartnerId = req.params.bookingpartnerid

    // Find distinct venue for the given bookingpartnerid
    const propertyNames = await Invoice.distinct('venue', {
      bookingpartnerid: bookingPartnerId,
    })

    res.status(200).json(propertyNames)
  } catch (error) {
    console.error('Error fetching property names:', error)
    res.status(500).json({ error: 'Failed to fetch property names' })
  }
})
router.get(
  '/unique-phone-numbersbybookingid/:bookingpartnerid',
  async (req, res) => {
    try {
      const bookingPartnerId = req.params.bookingpartnerid

      // Find distinct phone numbers for the given bookingpartnerid
      const phoneNumbers = await Invoice.distinct('phoneNumber', {
        bookingpartnerid: bookingPartnerId,
      })

      res.status(200).json(phoneNumbers)
    } catch (error) {
      console.error('Error fetching phone numbers:', error)
      res.status(500).json({ message: 'Error fetching phone numbers', error })
    }
  }
)

//booking partner parmetreised apis  end

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
function createISODateTime(date, time) {
  // Convert date to 'YYYY-MM-DD' format
  const formattedDate = new Date(date).toISOString().split('T')[0]
  // Combine date and time into an ISO 8601 date-time string
  return new Date(`${formattedDate}T${time}`).toISOString()
}

function convertTo24HourFormat(time12h) {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  if (modifier === 'PM' && +hours < 12) hours = +hours + 12
  if (modifier === 'AM' && +hours === 12) hours = 0
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}
// Update invoice
router.put('/invoices/:id', async (req, res) => {
  try {
    // Check if the invoice exists
    const existingInvoice = await Invoice.findById(req.params.id)
    if (!existingInvoice) {
      console.log('Invoice not found')
      return res.status(404).json({ message: 'Invoice not found' })
    }
    console.log('Invoice found:', existingInvoice)

    // Update the invoice with new values from the request body
    const updatedInvoiceData = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body, // req.body should include all fields that need to be updated
      { new: true, runValidators: true } // Enforce schema validation and return the updated document
    )
    console.log('Updated invoice data:', updatedInvoiceData)
 
    // Extract relevant fields from the updated invoice
    const {
      bookingId,
      guestName,
      email, // Added email field
      phoneNumber,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      numberOfAdults, // Added number of adults field
      numberOfKids, // Added number of kids field
      occasion,
      bookingPartnerName, // Added booking partner name field
      bookingPartnerPhoneNumber, // Added booking partner phone number field
      hostOwnerName,
      hostNumber,
      totalBooking,
      farmTref, // Added farm reference field
      otherServices,
      advance,
      advanceCollectedBy,
      pendingCollectedBy,
      advanceMode,
      balancePayment,
      securityAmount,
      urbanvenuecommission, // Added urban venue commission field
      venue: farmName,
      addressLine1,
      addressLine2,
      country,
      state,
      citySuburb: placeName,
      zipCode,
      termsConditions, // Added terms and conditions field
      eventAddOns, // Added event add-ons field
      status, // Enum field: ['Canceled', 'Paid', 'Upcoming', 'Completed']
      photo, // Added photo field
      cancellledby,
      cancelreason,
    } = updatedInvoiceData
   // If the status is 'Cancelled', delete the event from the calendar
   if (status === 'Cancelled') {
    const updatedCalendar = await Calender.findOneAndUpdate(
      {
        name: state,
        'places.name': placeName,
        'places.farms.details.name': farmName,
      },
      {
        $pull: {
          'places.$.farms.$[farm].events': { _id: bookingId },
        },
      },
      {
        arrayFilters: [{ 'farm.details.name': farmName }],
        new: true,
      }
    )

    if (!updatedCalendar) {
      console.log('Calendar event not found or failed to delete')
      return res
        .status(404)
        .json({ error: 'Calendar event not found or failed to delete' })
    }

    console.log('Deleted calendar event:', updatedCalendar)

    return res.status(200).json({
      message: 'Invoice updated and event deleted successfully',
      invoice: updatedInvoiceData,
    })
  }
    // Convert times to 24-hour format
    const checkInTime24 = convertTo24HourFormat(checkInTime)
    const checkOutTime24 = convertTo24HourFormat(checkOutTime)

    console.log('Converted check-in time (24-hour):', checkInTime24)
    console.log('Converted check-out time (24-hour):', checkOutTime24)

    // Create ISO date-time strings
    const startDateTime = createISODateTime(checkInDate, checkInTime24)
    const endDateTime = createISODateTime(checkOutDate, checkOutTime24)

    console.log('Converted start date-time:', startDateTime)
    console.log('Converted end date-time:', endDateTime)

    // Construct the updated event object
    const updatedEvent = {
      _id: bookingId,
      title: occasion,
      start: startDateTime,
      end: endDateTime,
    }
    console.log('Updated event object:', updatedEvent)

    // Update the event in the calendar
    const updatedCalendar = await Calender.findOneAndUpdate(
      {
        name: state,
        'places.name': placeName,
        'places.farms.details.name': farmName, // Accessing farm name inside details
        'places.farms.events._id': bookingId,
      },
      {
        $set: {
          'places.$.farms.$[farm].events.$[event]': updatedEvent,
        },
      },
      {
        arrayFilters: [
          { 'farm.details.name': farmName }, // Accessing farm name inside details
          { 'event._id': bookingId },
        ],
        new: true,
      }
    )

    if (!updatedCalendar) {
      console.log('Calendar event not found or failed to update')
      return res
        .status(404)
        .json({ error: 'Calendar event not found or failed to update' })
    }
    console.log('Updated calendar:', updatedCalendar)

    // Return the updated invoice and success message
    res.status(200).json({
      message: 'Invoice and event updated successfully',
      invoice: updatedInvoiceData,
    })
  } catch (error) {
    console.error('Error updating the invoice:', error.message)
    res.status(500).json({ error: error.message })
  }
})

// Delete invoice
router.delete('/invoices/:id', async (req, res) => {
  try {
    // Find and delete the invoice
    const deletedInvoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!deletedInvoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    console.log('Deleted invoice:', deletedInvoice);

    // Extract necessary fields from the deleted invoice
    const {
      bookingId,
      state,
      citySuburb:placeName,
      venue: farmName, // Ensure this maps correctly to the calendar schema
    } = deletedInvoice;

    // Remove the event from the calendar
    const updatedCalendar = await Calender.findOneAndUpdate(
      {
        name: state,
        'places.name': placeName,
        'places.farms.details.name': farmName,
        
      },
      {
        $pull: {
          'places.$.farms.$[farm].events': { _id: bookingId },
        },
      },
      {
        arrayFilters: [{ 'farm.details.name': farmName }],
        new: true,
      }
    );

    if (!updatedCalendar) {
      console.log('Calendar event not found or failed to delete');
      return res
        .status(404)
        .json({ error: 'Calendar event not found or failed to delete' });
    }

    console.log('Deleted calendar event:', updatedCalendar);

    res.status(200).json({
      message: 'Invoice and associated calendar event deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting the invoice:', error.message);
    res.status(500).json({ error: error.message });
  }
});

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
      selectedCategory,
      bookingpartnerid,
      totalBookingValue,
      totalBookingOperator,
      bookingId,          // Add bookingId
      bookingPartnerName, // Add bookingPartnerName
      numberOfAdults,     // Add numberOfAdults
      numberOfKids,       // Add numberOfKids
    } = req.query;

    let filter = {};
    let missingParams = [];

    // Build filter object dynamically based on provided query parameters
    if (selectedGuest && selectedGuest.trim()) {
      filter.guestName = { $regex: new RegExp(selectedGuest.trim(), 'i') }; // Case-insensitive search
    }

    if (selectedOwner && selectedOwner.trim()) {
      filter.hostOwnerName = { $regex: new RegExp(selectedOwner.trim(), 'i') }; // Case-insensitive search
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

    // Filter by bookingpartnerid
    if (bookingpartnerid && bookingpartnerid.trim()) {
      filter.bookingpartnerid = bookingpartnerid.trim();
    }

    // Total Booking filter
    if (totalBookingValue && totalBookingOperator) {
      const bookingValue = parseFloat(totalBookingValue); // Convert to number
      if (!isNaN(bookingValue)) {
        switch (totalBookingOperator) {
          case 'gte':
            filter.totalBooking = { $gte: bookingValue }; // Greater than or equal to
            break;
          case 'lte':
            filter.totalBooking = { $lte: bookingValue }; // Less than or equal to
            break;
          case 'eq':
            filter.totalBooking = { $eq: bookingValue }; // Equal to
            break;
          default:
            break;
        }
      }
    }

    // Filter by bookingId
    if (bookingId && bookingId.trim()) {
      filter.bookingId = { $regex: new RegExp(bookingId.trim(), 'i') }; // Case-insensitive search
    }

    // Filter by bookingPartnerName
    if (bookingPartnerName && bookingPartnerName.trim()) {
      filter.bookingPartnerName = { $regex: new RegExp(bookingPartnerName.trim(), 'i') }; // Case-insensitive search
    }

    // Filter by numberOfAdults
    if (numberOfAdults && !isNaN(parseInt(numberOfAdults))) {
      filter.numberOfAdults = parseInt(numberOfAdults);
    }

    // Filter by numberOfKids
    if (numberOfKids && !isNaN(parseInt(numberOfKids))) {
      filter.numberOfKids = parseInt(numberOfKids);
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


router.get('/owner/:hostOwnerName', async (req, res) => {
  try {
    const hostOwnerName = req.params.hostOwnerName

    // Query the database for invoices with the provided hostOwnerName
    const invoices = await Invoice.find({ hostOwnerName })

    if (invoices.length === 0) {
      return res
        .status(404)
        .json({ message: 'No invoices found for this owner.' })
    }

    res.status(200).json(invoices)
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving invoices', error })
  }
})
router.get('/count/:venue', async (req, res) => {
  const { venue } = req.params

  try {
    // Count the invoices matching the venue
    const invoiceCount = await Invoice.countDocuments({ venue })

    // Respond with the count
    res.status(200).json({
      venue,
      invoiceCount,
    })
  } catch (error) {
    console.error(error)
    res
      .status(500)
      .json({ error: 'An error occurred while counting invoices.' })
  }
})
module.exports = router
