'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AllCourses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static getchapters(coursename,author){
      return this.findAll({where:{coursename,author}});
    }

    static getmycourses(author){
      return this.findAll({where:{author},group:['coursename','author'],attributes: ['coursename','author'],});
    }

    static getcourses(){
      return this.findAll({
        attributes: ['coursename','author'],
        group:['coursename','author'],});
    }

    static getdes(coursename,chapter){
      return this.findOne({where:{coursename,chapter}})
    }


  }
  AllCourses.init({
    coursename: DataTypes.STRING,
    author: DataTypes.STRING,
    chapter: DataTypes.STRING,
    chapterdescription: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'AllCourses',
  });
  return AllCourses;
};