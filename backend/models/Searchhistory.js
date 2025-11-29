const {sequelize} = require('../config/db');
const {DataTypes} = require('sequelize');

const  SearchHistory = sequelize.define('SearchHistory',{
 
  userId:{
      type : DataTypes.INTEGER,
      allowNull :false
  },
  query:{
       type  : DataTypes.STRING,
       allowNull:false
  },
  timestamp:{

    type : DataTypes.DATE,
    defaultValue:DataTypes.NOW
  }



});
module.exports  = SearchHistory;