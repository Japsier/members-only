const Message = require("../models/message")

const { body, validationResult } = require("express-validator")
exports.index = function (req, res, next) {
    Message.find({})
        .exec(function (err, message_list) {
            if(err) {
                return next(err)
            } else {
                res.render("index", { messages: message_list })
            }
        })
}

exports.create_message_get = function (req, res, next) {
    res.render("create-message", {user: req.user})
}
exports.create_message_post = [
  
    // Validate and sanitize fields.
    body("title", "Title must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body("text", "text must not be empty.")
      .trim()
      .isLength({ min: 1 })
      .escape(),
    // Process request after validation and sanitization.
    (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      // Create a Message object with escaped and trimmed data.
      var message = new Message({
        title: req.body.title,
        text: req.body.text,
        timestamp: new Date(),
        user: req.user._id,
        username: req.user.username,
      });
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/error messages.
  
        res.render("create-message", {
            message: message,
            errors: errors.array(),
        });
        return;
      } else {
        // Data from form is valid. Save message.
        message.save(function (err) {
          if (err) {
            return next(err);
          }
          // Successful - redirect to homepage
          res.redirect("/");
        });
      }
    },
  ];
