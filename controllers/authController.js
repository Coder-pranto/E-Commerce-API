const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {attachCookiesToResponse} = require('../utils');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //* first user is an admin
  const isFirstAccount = await User.countDocuments({});
  const role = isFirstAccount === 0 ? 'admin':'user';

  const user = await User.create({ name, email, password, role });

  const tokenUser = {name: user.name, userId:user._id, role: user.role};

  attachCookiesToResponse({res, user:tokenUser});

  res.status(StatusCodes.CREATED).json({user});
};

const login = async (req, res) => {
  const { email, password } =req.body;
  if(!email || !password){
    throw new CustomError.BadRequestError("Email and Password are required!");
  }

  const user = await User.findOne({email});
  const checkPassword = await user.comparePassword(password); //important
  if(!user || !checkPassword){
    throw new CustomError.BadRequestError('Invalid Credentials!')
  }

  const tokenUser = {name: user.name, userId:user._id, role: user.role};
  attachCookiesToResponse({res, user:tokenUser});

  res.status(StatusCodes.OK).json({user});

};


const logout = async (req, res) => {
  res.cookie('cookieName', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({msg: "logout successfully."});
};

module.exports = {
  register,
  login,
  logout,
};
