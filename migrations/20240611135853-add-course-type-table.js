"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("CourseTypes", {
            code: {
                type: Sequelize.STRING,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            descriptionA: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            descriptionB: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("CourseTypes");
    },
};
