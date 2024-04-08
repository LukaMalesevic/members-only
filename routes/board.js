const express = require('express');
const router = express.Router();

router.get('/board', function(req, res, next) {
  res.render('board', { title: 'test' });
});

module.exports = router;
