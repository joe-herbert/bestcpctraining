"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Order extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of DataTypes lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Order.init(
        {
            id: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            items: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            discounts: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
        },
        {
            sequelize,
            modelName: "Order",
        }
    );
    return Order;
};
