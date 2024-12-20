const User= require('../models/user');


const jwt = require('jsonwebtoken');



// ... existing imports ...

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
    const { email, password } = req.body;
    
    try {
      const user = await User.create({ email, password });
      const token = createToken(user._id);
      
      // Set cookie
      res.cookie('jwt', token, {
        httpOnly: true,
        maxAge: maxAge * 1000 // convert to milliseconds
      });
      
      res.status(201).json({ user: user._id });
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
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
    // Set jwt cookie to empty string and expire in 1 millisecond
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  }
};

module.exports = { authController };