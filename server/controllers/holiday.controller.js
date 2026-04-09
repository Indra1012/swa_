const Holiday = require('../models/Holiday')

const getHolidays = async (req, res, next) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 })
    res.status(200).json(holidays)
  } catch (err) {
    next(err)
  }
}

const addHoliday = async (req, res, next) => {
  try {
    const { date, name } = req.body
    if (!date) return res.status(400).json({ error: 'Date is required' })
    const holiday = await Holiday.create({ date, name: name || 'Holiday' })
    res.status(201).json(holiday)
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Holiday for this date already exists' })
    next(err)
  }
}

const deleteHoliday = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Holiday.findByIdAndDelete(id)
    res.status(200).json({ message: 'Holiday deleted' })
  } catch (err) {
    next(err)
  }
}

module.exports = { getHolidays, addHoliday, deleteHoliday }
