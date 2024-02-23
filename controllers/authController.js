const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {attachCookiesToResponse, sendVerificationEmail} = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //* first user is an admin
  const isFirstAccount = await User.countDocuments({});
  const role = isFirstAccount === 0 ? 'admin':'user';

  const verificationToken = crypto.randomBytes(40).toString("hex");
  // const origin = 'http://localhost:5000'; // do use this origin for frontend
  const origin = 'http://localhost:5000/api/v1';

  const user = await User.create({ name, email, password, role, verificationToken });

  await sendVerificationEmail({name:user.name, email:user.email, verificationToken:user.verificationToken, origin});

  res.status(StatusCodes.CREATED).json({msg:"Success! Please check your email to verify your account"});
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

  if(!user.isVerified){
    throw new CustomError.UnauthenticatedError('Please verify your email to log in!')
  }

  const tokenUser = {name: user.name, userId:user._id, role: user.role};
  attachCookiesToResponse({res, user:tokenUser});

  res.status(StatusCodes.OK).json({user});

};


const verifyEmail = async(req,res)=>{
  const {verificationToken, email} = req.body;

  const user = await User.findOne({email});
  if(!user){
    throw new CustomError.UnauthenticatedError('Verification Failed');
  }
  if(user.verificationToken !== verificationToken){
    throw new CustomError.UnauthenticatedError('Invalid Token');
  }

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";
  await user.save();

  res.status(StatusCodes.OK).json({msg:"Email Verified!"});
}



const logout = async (req, res) => {
  res.cookie('cookieName', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({msg: "logout successfully."});
};

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
};
