const inquirer = require('inquirer');
require('dotenv').config();
const db = require('./config/connection');
const { seedDatabase } = require('./seed/seed');

const Department = require('./lib/Department');
const Role = require('./lib/Role');
const Employee = require('./lib/Employee');

async function main() {
    // automated seeding!
    if (process.env.SEED_DB === 'true') {
        try {
            await seedDatabase();
        } catch (error) {
            console.error('Error during database seeding:', error);
        }
    }

    init();
}

function init() {
    // prompt for main menu
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Delete a department',
            'Exit'
        ]
    }]).then(answers => {
        switch (answers.action) {
            case 'View all departments':
                Department.findAll().then(([rows]) => {
                    init(); 
                }).catch(err => console.log(err));
                break;
            case 'Add a department':
                Department.addDepartmentPrompt().then(() => {
                    init(); // return to main menu
                }).catch(err => console.log(err));
                break;
            case 'View all roles':
                Role.findAll().then(([rows]) => {
                    init(); 
                }).catch(err => console.log(err));
                break;
            case 'Add a role':
                Role.addRolePrompt().then(() => {
                    init(); 
                }).catch(err => console.log(err));
                break;
            case 'View all employees':
                Employee.findAll().then(([rows]) => {
                    init(); 
                }).catch(err => console.log(err));
                break;
            case 'Add an employee':
                Employee.addEmployeePrompt().then(() => {
                    init(); 
                }).catch(err => console.log(err));
                break;
            case 'Update an employee role':
                Employee.updateEmployeeRolePrompt().then(() => {
                    init(); 
                }).catch(err => console.log(err));
                break;
            case 'Delete a department':
                Department.deleteDepartmentPrompt().then(() => {
                    init(); // return to main menu
                }).catch(err => console.log(err));
                break;
            case 'Exit':
                db.end();
                console.log('Goodbye!');
                break;
            default:
                console.log(`Invalid action: ${answers.action}`);
                init(); // restart prompt 
        }
    });
}

main();
