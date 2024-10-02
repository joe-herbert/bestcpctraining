"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.addColumn(
                    "Users",
                    "licenseNumber",
                    {
                        type: Sequelize.STRING,
                        allowNull: false,
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    "Users",
                    "hgvLicense",
                    {
                        type: Sequelize.BOOLEAN,
                        allowNull: true,
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    "Users",
                    "pcvLicense",
                    {
                        type: Sequelize.BOOLEAN,
                        allowNull: true,
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    "Users",
                    "mobileNumber",
                    {
                        type: Sequelize.STRING,
                        allowNull: true,
                    },
                    { transaction: t }
                ),
                queryInterface.addColumn(
                    "Users",
                    "postcode",
                    {
                        type: Sequelize.STRING,
                        allowNull: true,
                    },
                    { transaction: t }
                ),
            ]);
        });
    },

    async down(queryInterface, Sequelize) {
        return queryInterface.sequelize.transaction((t) => {
            return Promise.all([
                queryInterface.removeColumn("Users", "licenseNumber", { transaction: t }),
                queryInterface.removeColumn("Users", "hgvLicense", { transaction: t }),
                queryInterface.removeColumn("Users", "pcvLicense", { transaction: t }),
                queryInterface.removeColumn("Users", "mobileNumber", { transaction: t }),
                queryInterface.removeColumn("Users", "postcode", { transaction: t }),
            ]);
        });
    },
};
