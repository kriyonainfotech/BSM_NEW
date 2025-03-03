const express = require('express')
const { AddAccount, getAllAccounts, getAccountsByUser, updateAccount, deleteAccount } = require('../controllers/acountController')
const router = express.Router()
router.post('/AddAccount',AddAccount)
router.get('/getAllAccounts',getAllAccounts)
router.post('/getAccountsByUser',getAccountsByUser)
router.post('/updateAccount',updateAccount)
router.delete('/deleteAccount',deleteAccount)
module.exports = router