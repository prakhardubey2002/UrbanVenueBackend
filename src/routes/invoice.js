const express = require('express')
const router = express.Router()
const Invoice = require('../models/Invoice')

// Create a new invoice
router.post('/create', async (req, res) => {
  try {
    const { _id, ...invoiceData } = req.body

    // Validate input data
    const validationErrors = validateInvoiceData(invoiceData)
    if (validationErrors.length > 0) {
      return res
        .status(400)
        .json({ error: 'Invalid data', details: validationErrors })
    }

    const newInvoice = new Invoice(invoiceData)
    await newInvoice.save()

    res.status(201).json(newInvoice)
  } catch (error) {
    console.error('Error creating invoice:', error)
    res.status(400).json({ error: error.message })
  }
})

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find()
    res.status(200).json(invoices)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get a single invoice by ID
router.get('/find/:id', async (req, res) => {
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

// Update invoice by ID
router.put('/update/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }
    res.status(200).json(invoice)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

module.exports = router
