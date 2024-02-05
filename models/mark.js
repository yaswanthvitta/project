'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Mark extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    
    static getstatus(userid,coursename,chapter,author,pagename){
      return this.findAll({where:{userid,coursename,chapter,author,pagename}})
    }

  }
  Mark.init({
    userid: DataTypes.INTEGER,
    coursename: DataTypes.STRING,
    chapter: DataTypes.STRING,
    author: DataTypes.STRING,
    pagename: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Mark',
  });
  return Mark;
};