"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("Bookings", {
            id: {
                type: Sequelize.UUID,
                allowNull: false,
                primaryKey: true,
            },
            courseId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: "Courses",
                    key: "id",
                },
            },
            userEmail: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: "Users",
                    key: "email",
                },
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
        await queryInterface.dropTable("Bookings");
    },
};
