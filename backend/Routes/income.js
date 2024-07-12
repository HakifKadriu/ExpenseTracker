const express = require("express");
const router = express.Router();
const incomeController = require("../Controllers/income");

router.post('/', incomeController.createIncome);
router.get('/', incomeController.getAllIncomes);
router.get('/user/:userId', incomeController.getIncomesByUserId);
router.get('/:id', incomeController.getSingleIncome);
router.put('/:id', incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;