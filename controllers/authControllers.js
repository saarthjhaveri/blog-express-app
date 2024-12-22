const User = require('../models/user');
const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60; // 3 days in seconds
const createToken = (id) => {
  return jwt.sign({ id }, 'randomsecret123', {
    expiresIn: maxAge,
  });
};

const authController = {
  signup_get: (req, res) => {
    res.render('signup', { 
        title: 'Sign Up',
        name: 'Guest',
        message: 'Please sign up to continue'
    });
  },

  signup_post: async (req, res) => {
    const { 
      email, 
      password, 
      name,
      profession,
      location,
      specialties,
      interests,
      experience,
      field,
      projects 
    } = req.body;
    
    try {
      const user = await User.create({ 
        email, 
        password,
        name,
        profession,
        location,
        specialties,
        interests,
        experience,
        field,
        projects
      });
      const token = createToken(user._id);
      
      // Set cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: maxAge * 1000 // convert to milliseconds
      });
      
      res.status(201).json({ user: user._id });
    } catch (err) {
      console.log(err);
      let errorMessage = err.message;
      if (err.code === 11000) {
        errorMessage = 'Email already registered';
      }
      res.status(400).json({ error: errorMessage });
    }
  },

  login_get: (req, res) => {
    res.render('login', {
      title: 'Login',
      name: 'Guest',
      message: 'Please login to continue'
    });
  },

  login_post: async (req, res) => {
    const { email, password } = req.body;

    try {
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(400).json({ error: 'Email not found' });
      }

      // Check if password matches
      if (user.password !== password) {
        return res.status(400).json({ error: 'Incorrect password' });
      }

      // Create and set JWT token
      const token = createToken(user._id);
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: maxAge * 1000
      });

      res.status(200).json({ user: user._id });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  },

  logout_get: (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  }
};
module.exports = {
  signup_get: authController.signup_get,
  signup_post: authController.signup_post,
  login_get: authController.login_get,
  login_post: authController.login_post,
  logout_get: authController.logout_get
};
