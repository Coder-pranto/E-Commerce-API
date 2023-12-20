const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //* first user is an admin
  const isFirstAccount = await User.countDocuments({});
  const role = isFirstAccount === 0 ? 'admin':'user';

  const user = await User.create({ name, email, password, role });
  res.status(StatusCodes.CREATED).json({user});
};

const login = async (req, res) => {
  res.send('login');
};
const logout = async (req, res) => {
  res.send('logout');
};

module.exports = {
  register,
  login,
  logout,
};
