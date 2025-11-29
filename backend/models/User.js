const bcrypt = require('bcrypt.js');
const {sequelize} = require('../config/db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('User',{
 id : {
     type: DataTypes.INTEGER,
     primaryKey : true,
     autoIncrement : true
 },
 email:{
     
type : DataTypes.STRING,
unique : true,
allowNull : false

 },
 password:{
type : DataTypes.STRING,
allowNull : false
 },
 joined:{
     type : DataTypes.DATE,
     defaultValue : DataTypes.NOW
 }




});

User.beforeCreate(async (user) => {

  user.password = await bcrypt.hash(user.password,10);
}); 

User.prototype.comparePassword = async function(password){
  return await bcrypt.compare(password,this.password);
};


module.exports = User;