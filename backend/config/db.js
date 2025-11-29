const {Sequelize} = require('sequelize');

const sequelize = new Sequelize({
dialect:'sqlite',
storage: process.env.DB_PATH || './database.sqlite',
logging : false

});


const ConnectDB = async () => {
  try{
    await sequelize.authenticate();
    console.log('connected successfully');
    await sequelize.sync();
    console.log('database synchronized done')

  }
  catch(error){
       console.error('connection error',error.message);
       process.exit(1);
  }
};
module.exports = {connectDB,sequelize};