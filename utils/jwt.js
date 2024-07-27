//** this for multiple cookies */
const jwt = require('jsonwebtoken');

const createJWT = ({payload})=>{
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
}

const isTokenValid = (token)=>{
    return jwt.verify(token, process.env.JWT_SECRET);
}

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 1000 * 60 * 60 * 24;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.cookie('accessToken', accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    expires: new Date(Date.now() + oneDay),
    // maxAge:1000,
  });

  res.cookie('refreshToken', refreshTokenJWT, {
    httpOnly: true, // The cookie is only accessible by the web server
    secure: process.env.NODE_ENV === 'production', // The cookie is sent over HTTPS only in production
    signed: true, // The cookie is signed to prevent tampering
    expires: new Date(Date.now() + longerExp), // The expiration date of the cookie
  });
};

module.exports = {
    createJWT,
    isTokenValid,
    attachCookiesToResponse
}



















//** this for single cookies response

/* 

const jwt = require('jsonwebtoken');

const createJWT = (payload)=>{
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn : process.env.JWT_LIFETIME});
    return token;
}

const isTokenValid = (token)=>{
    return jwt.verify(token, process.env.JWT_SECRET);
}

const attachSingleCookieToResponse = ({res, user})=>{
    const token = createJWT(user);
    const oneDay = 1000*60*60*24;
  
    res.cookie('cookieName', token, {
      expires: new Date(Date.now() + oneDay),
      httpOnly: true,
      secure: process.env.NODE_ENV ==='production',
      signed: true,
    });
}

module.exports = {
    createJWT,
    isTokenValid,
    attachSingleCookieToResponse
}


*/