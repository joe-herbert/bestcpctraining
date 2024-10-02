"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Users", {
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                primaryKey: true,
            },
            firstName: {
                type: Sequelize.STRING,
            },
            surname: {
                type: Sequelize.STRING,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            permissions: {
                type: Sequelize.STRING,
                defaultValue: "user",
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
        await queryInterface.dropTable("Users");
    },
};
