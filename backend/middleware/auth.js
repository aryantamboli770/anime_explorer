const jwt = require('jsonwebtoken');
const authMiddleware = (req,res,next) => {
  try {
      const token = req.cookies.token;
      if(!token){
        return res.status(401).json({message : 'Unauthorized'});

      }

      const decoded= 
  }catch(error){

  }
};
module.exports = authMiddleware;