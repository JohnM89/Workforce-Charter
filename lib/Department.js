const inquirer = require('inquirer');
const db = require('../config/connection');

class Department {
    // fetch all departments
    static async findAll() {
        try {
            const [rows] = await db.promise().query('SELECT * FROM department');
            console.table(rows); // display the fetched rows in a table format
            return rows; 
        } catch (err) {
            console.error(err);
        }
    }

    // prompt for adding a department
    static async addDepartmentPrompt() {
        try {
            const answer = await inquirer.prompt([{
                type: 'input',
                name: 'name',
                message: 'What is the name of the department?'
            }]);

            await this.addDepartment(answer.name);
        } catch (err) {
            console.error(err);
        }
    }

    // add a new department to the database
    static addDepartment(name) {
        return db.promise().query('INSERT INTO department (name) VALUES (?)', [name])
            .then(() => console.log(`Added ${name} to the database.`))
            .catch(err => console.error(err));
    }

    // prompting the user to delete a department
    static async deleteDepartmentPrompt() {
        try {
            // fetch all departments to display
            const departments = await this.findAll().catch(err => {
                console.error(err);
                return [];
            });

            if (departments.length === 0) {
                console.log("There are no departments available to delete.");
                return;
            }

            const choices = departments.map(dept => ({ name: dept.name, value: dept.id }));

            // prompt the user to select one of the departments
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Which department would you like to delete?',
                    choices: choices
                }
            ]);

            // check if the selected department has associated roles
            const departmentId = answer.departmentId;
            const hasAssociatedRoles = await this.hasAssociatedRoles(departmentId);

            // if there are associated roles, warn the user!
            if (hasAssociatedRoles) {
                const confirmDelete = await inquirer.prompt([
                    {
                        type: 'confirm',
                        name: 'confirm',
                        message: 'This department has associated roles. Deleting it will also delete all associated roles! Are you sure you want to proceed???',
                        default: false
                    }
                ]);

                //if the user confirms, perform cascade delete
                if (confirmDelete.confirm) {
                    await this.deleteDepartmentCascade(departmentId);
                    console.log(`Deleted department with ID ${departmentId} and associated roles from the database.`);
                } else {
                    console.log('Delete operation canceled!');
                }
            } else {
                // if there are no associated roles, perform regular delete
                await this.deleteDepartment(departmentId);
            }
        } catch (err) {
            console.error(err);
        }
    }

    // check if a department has associated roles
    static async hasAssociatedRoles(departmentId) {
        try {
            const [rows] = await db.promise().query('SELECT * FROM role WHERE department_id = ?', [departmentId]);
            return rows.length > 0;
        } catch (err) {
            console.error(err);
            return false;
        }
    }

    // delete a department from the database
    static async deleteDepartment(departmentId) {
        try {
            await db.promise().query('DELETE FROM department WHERE id = ?', [departmentId]);
            console.log(`Deleted department with ID ${departmentId} from the database.`);
        } catch (err) {
            console.error(err);
        }
    }


// delete associated roles and employees when deleting a department
static async deleteDepartmentCascade(departmentId) {
    try {
        // delete associated employees
        await db.promise().query('DELETE FROM employee WHERE role_id IN (SELECT id FROM role WHERE department_id = ?)', [departmentId]);
        // delete associated roles
        await db.promise().query('DELETE FROM role WHERE department_id = ?', [departmentId]);
        // delete the department itself
        await this.deleteDepartment(departmentId);
    } catch (err) {
        console.error(err);
    }
}

}

// export the Department class
module.exports = Department;
