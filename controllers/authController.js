const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {createTokenUser, attachCookiesToResponse, sendVerificationEmail, sendResetPasswordEmail} = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
  const { name, email, password } = req.body;

  //* first user is an admin
  const isFirstAccount = await User.countDocuments({});
  const role = isFirstAccount === 0 ? 'admin':'user';

  const verificationToken = crypto.randomBytes(40).toString("hex");
  // const origin = 'http://localhost:5000'; // do use this origin for frontend
  const origin = 'http://localhost:5000/api/v1';

  // const tempOrigin = req.get('origin'); // this is indicate for server
  // const protocol = req.protocol; // this is indicate for server
  // const host = req.get('host'); // this is indicate for server

  // const clientOrigin = req.get('referer');// this is indicate for client
  // const forwardedHost = req.get('x-forwarded-host'); // this is indicate for  client
  // const forwardedProtocol = req.get('x-forwarded-proto'); // this is indicate for  client

  // console.log("temporigin : ",tempOrigin);
  // console.log("protocol", protocol);
  // console.log("host :", host);
  // console.log("forwardedHost", forwardedHost);
  // console.log("forwardedProtocol", forwardedProtocol);
  // console.log("clientOrigin:", clientOrigin);


  const user = await User.create({ name, email, password, role, verificationToken });

  await sendVerificationEmail({name:user.name, email:user.email, verificationToken:user.verificationToken, origin});

  res.status(StatusCodes.CREATED).json({msg:"Success! Please check your email to verify your account"});
};



const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new CustomError.BadRequestError('Email and Password are required!');
  }

  const user = await User.findOne({ email });
  const checkPassword = await user.comparePassword(password); //important
  if (!user || !checkPassword) {
    throw new CustomError.BadRequestError('Invalid Credentials!');
  }

  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError(
      'Please verify your email to log in!'
    );
  }

  const tokenUser = createTokenUser(user); // user basic info

  let refreshToken = ' ';

  //check existing token
  const existingToken = await Token.findOne({ user: user._id });

  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('invalid crediential');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    return res.status(StatusCodes.OK).json({ user: tokenUser });
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];

  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);

  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res.status(StatusCodes.OK).json({ user: tokenUser });
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
  await Token.findOneAndDelete({user:req.user.userId});

  res.cookie('accessToken', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.cookie('refreshToken', 'logout', {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(StatusCodes.OK).json({msg: "logout successfully."});
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please Provide Valid Email!');
  }

  const user = await User.findOne({ email });

  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    //send email
     await sendResetPasswordEmail({
      name : user.name,
      email: user.email,
      token:passwordToken,
      origin: 'http://localhost:5000/api/v1'
     })
    const tenMinutes = 1000 * 60 * 10;

    user.passwordToken = passwordToken;
    user.passwordExpirationDate = tenMinutes;

    await user.save();
  }
  res.status(StatusCodes.OK).json({ msg: 'please check your email.' });
};

const resetPassword = async(req, res) =>{
  res.send("reset password");
}

module.exports = {
  register,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword
};
