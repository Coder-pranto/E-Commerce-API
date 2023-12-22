const {isTokenValid} = require('../utils');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const authenticateUser = async(req,res,next)=>{
    const token = req.signedCookies.cookieName;
    if(!token){
        throw new CustomError.UnauthenticatedError("Authentication Invalid!");
    }
    try {
        const {name, userID, role} = isTokenValid(token);
        // console.log({name,userID, role});
        req.user = {name,userID, role}
        next();
    } catch (error) {
        throw new CustomError.UnauthenticatedError("Authentication Invalid!");
    }
}
const authorizePermissions = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            throw new CustomError.UnauthorizedError('Unauthorized Access!');
        }
        next();
    }
}
module.exports = {authenticateUser, authorizePermissions};