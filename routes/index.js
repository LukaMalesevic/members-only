var express = require('express');
var router = express.Router();
const Message = require('../models/message');

router.get("/", async(req, res) => {
  const allMessages = await Message.find({}).sort({created_at: 1}).populate("author").exec();
  res.render("index", { user: req.user, messages: allMessages});
});

module.exports = router;
