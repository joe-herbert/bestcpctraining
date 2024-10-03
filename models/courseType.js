"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class CourseType extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            CourseType.hasMany(models.Course, {
                foreignKey: "code",
                onDelete: "CASCADE",
            });
        }
    }
    CourseType.init(
        {
            code: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            descriptionA: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            descriptionB: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            spaces: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 20,
            },
        },
        {
            sequelize,
            modelName: "CourseType",
            paranoid: true,
        }
    );
    return CourseType;
};
