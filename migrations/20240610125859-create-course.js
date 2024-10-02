"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Courses", {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.UUID,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            date: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            price: {
                type: Sequelize.FLOAT,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
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
        await queryInterface.dropTable("Courses");
    },
};
