"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Orders", {
            id: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            items: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            discounts: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("Orders");
    },
};
