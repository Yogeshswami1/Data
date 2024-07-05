
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  const { username, password, usertype } = req.body;

  try {
    const user = new User({ username, password, usertype });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
};

const login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: user._id, usertype: user.usertype }, 'saumic', {
        expiresIn: '1h'
      });
  
      res.json({ token, usertype: user.usertype });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  };
  

module.exports = { signup, login };
