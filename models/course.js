"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Course extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            Course.hasMany(models.Booking, {
                foreignKey: "courseId",
                onDelete: "CASCADE",
            });
            Course.belongsTo(models.CourseType, {
                foreignKey: "code",
            });
        }
    }
    Course.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false,
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false,
                model: "CourseType",
                key: "code",
            },
        },
        {
            sequelize,
            modelName: "Course",
            paranoid: true,
        }
    );
    return Course;
};
