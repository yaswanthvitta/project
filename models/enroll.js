'use strict';
const {
  Model
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

    static getenrollstatus(userid,coursename,author){
      return this.findAll({where:{userid,coursename,author}});
    }

    static getenrolled(userid){
      return this.findAll({where:{userid},
        attributes: ['coursename','author'],
        group:['coursename','author']})
    }

    static getnumber(){
      return this.findAll({
        attributes: ['coursename', [sequelize.fn('COUNT', sequelize.col('userid')), 'studentcount'],'author'],
        group: ['coursename','author'],
    })
  }
    
    static getmynumber(coursename){
      return this.findAll({ where:{coursename},
        attributes: ['coursename', [sequelize.fn('COUNT', sequelize.col('userid')), 'studentcount'],'author'],
        group: ['coursename','author'],
    })

  }

  }
  Enroll.init({
    userid: DataTypes.INTEGER,
    coursename: DataTypes.STRING,
    enroll: DataTypes.STRING,
    author: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Enroll',
  });
  return Enroll;
};