"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("CourseTypes", "deletedAt", {
            allowNull: true,
            type: Sequelize.DATE,
        });
        await queryInterface.addColumn("CourseTypes", "createdAt", {
            allowNull: false,
            type: Sequelize.DATE,
        });
        await queryInterface.addColumn("CourseTypes", "updatedAt", {
            allowNull: false,
            type: Sequelize.DATE,
        });
    },

    async down(queryInterface, Sequelize) {
        queryInterface.removeColumn("CourseTypes", "deletedAt");
        queryInterface.removeColumn("CourseTypes", "createdAt");
        queryInterface.removeColumn("CourseTypes", "updatedAt");
    },
};
