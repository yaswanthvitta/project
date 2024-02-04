'use strict';
const {
  Model, where
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

    static getcourses(){
      return this.findAll();
    }

    static getdes(coursename,chapter){
      return this.findOne({where:{coursename,chapter}})
    }


  }
  AllCourses.init({
    coursename: DataTypes.STRING,
    author: DataTypes.STRING,
    chapter: DataTypes.STRING,
    chapterdescription: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AllCourses',
  });
  return AllCourses;
};