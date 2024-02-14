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

    // prompt for adding a department, now async
    static async addDepartmentPrompt() {
        try {
            const answer = await inquirer.prompt([{
                type: 'input',
                name: 'name',
                message: 'What is the name of the department?'
            }]);

            await this.addDepartment(answer.name);
            console.log(`Added ${answer.name} to the database.`);
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
            const departments = await this.findAll()
                .then(([rows]) => rows.map(dept => ({ name: dept.name, value: dept.id })))
                .catch(err => { console.error(err); return []; });

            // prompt the user to select one of the departments
            const answer = await inquirer.prompt([
                {
                    type: 'list',
                    name: 'departmentId',
                    message: 'Which department would you like to delete?',
                    choices: departments
                }
            ]);

            // delete selected department
            await this.deleteDepartment(answer.departmentId);
            console.log(`Deleted department with ID ${answer.departmentId} from the database.`);
        } catch (err) {
            console.error(err);
        }
    }
}
// export the Department class
module.exports = Department;
