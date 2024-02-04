'use strict';
const {
  Model, where
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Enroll extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static getenrollstatus(userid,coursename){
      return this.findAll({where:{userid,coursename}});
    }

    static getEnrolled(userid){
      return this.findAll({where:{userid}})
    }

  }
  Enroll.init({
    userid: DataTypes.INTEGER,
    coursename: DataTypes.STRING,
    enroll: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Enroll',
  });
  return Enroll;
};