const User = require("../models/user")

const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs")

const passport = require("passport");
const { locals } = require("../app");


exports.index = function (req, res, next) {
    res.render('index', {user: req.user});
}
exports.user_create_get = function (req, res, next) {
    res.render("sign-up")
}
exports.user_create_post = [
    // Validate and sanitize fields.
    body("username")
        .trim()
        .isLength({ min: 1 })
        .isLength({ max: 30 })
        .withMessage("Username must be specified."),
    body("password")
        .isLength({ min: 1 }),
    body("confirmPassword")
        .isLength({min: 1})
        .custom((value, {req}) => value === req.body.password),
  
    // Process request after validation and sanitization.
    async (req, res, next) => {
      // Extract the validation errors from a request.
      const errors = validationResult(req);
  
      if (!errors.isEmpty()) {
        // There are errors. Render form again with sanitized values/errors messages.
        res.render("sign-up", {
          username: req.body.username,
          errors: errors.array(),
        });
        return;
      } 
      // Data from form is valid.

      try {
        const isUsernameTaken = await User.find({username: req.body.username})
        if (isUsernameTaken.length > 0) {
          res.render("sign-up", {error: "username already exists"})
          return
        }
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
          if(err) return next(err)
          const user = new User({
            username: req.body.username,
            password: hashedPassword,
            membership_status: false,
          }).save(err => err ? next(err) : res.redirect("/"))
        })
      } catch (err) {
        return next(err)
      }
    }
];
exports.user_login_get = function (req, res, next) {
  res.render("log-in")
}
exports.user_login_post = passport.authenticate("local", { 
      successRedirect: '/',
      failureRedirect: '/log-in',
      failureFlash: true 
  })




exports.user_logout_get = function (req, res, next) {
  req.logout(function (err) {
    if(err) {
      next(err)
    }
    res.redirect("/")
  })
}

exports.secret_code_get = function (req, res, next) {
  res.render("secret-code", {error: false})
}
exports.secret_code_post = async function (req, res, next) {
  if (req.body.secretcode === process.env.MembershipCode) {
    const docs = await User.findByIdAndUpdate(
      req.user._id, 
      {membership_status: true}, )
    console.log(docs.membership_status)
    res.redirect("/")

  } else {
    res.render("secret-code", {error: true})
  }
}
