import express from 'express';
import { connectToDB } from './connection.js';
import inquirer from "inquirer";
import { viewAllDepartments, viewAllRoles, viewAllEmployees, addDepartment,addRole, addEmployee, updateRole, updateManager, employeeByManager, employeeByDepartment, deleteDepartment, deleteEmployee, viewBudgetByDepartment, Quit } from './services.js';

await connectToDB();

const PORT = process.env.PORT || 3001;
const app = express();

// Express middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ------------------------------------------
function employeeTracker () {
    inquirer
    .prompt ([
        {
        // begin command line with the list
           type: 'list',
           name: 'prompt',
           message: 'What would you like to do?',
           choices: ['View All Departments',
                    'View All Roles', 
                    'View All Employees', 
                    'Add a Department', 
                    'Add a Role', 
                    'Add an Employee', 
                    'Update an Employee Role', 
                    'Update Employee Manager', 
                    'View Employees by Manager',
                    'view Employees by Department', 
                    'Delete a Department',
                    'Delete an Employee',
                    'View Total utilized budget',
                    'Quit'
                    ],
        }
    ])
    .then ((answers) => {
        if (answers.prompt === 'View All Departments') {
            viewAllDepartments();
        }
        else if (answers.prompt === 'View All Roles') {
            viewAllRoles();
        }
        else if (answers.prompt === 'View All Employees') {
            viewAllEmployees();
        }
        else if (answers.prompt === 'Add a Department') {
            addDepartment();
        }
        else if (answers.prompt === 'Add a Role') {
            addRole();
        }
        else if (answers.prompt === 'Add an Employee') {
            addEmployee();
        }
        else if (answers.prompt === 'Update an Employee Role') {
            updateRole();
        }
        else if (answers.prompt === 'Update Employee Manager') {
            updateManager();
        }
        else if (answers.prompt === 'View Employees by Manager') {
            employeeByManager();
        }
        else if (answers.prompt === 'view Employees by Department') {
            employeeByDepartment();
        }
        else if (answers.prompt === 'Delete a Department') {
            deleteDepartment();
        }
        else if (answers.prompt === 'Delete an Employee') {
            deleteEmployee();
        }
        else if (answers.prompt === 'View Total utilized budget') {
            viewBudgetByDepartment();
        }
        else if (answers.prompt === 'Quit') {
        
            Quit();
        }

    })
    

}

employeeTracker();


// ------------------------------------------
// Default response for any other request (Not Found)
app.use((_req, res) => {
    res.status(404).end();
  });
  
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
  

export { employeeTracker };

// SELECT e.id, e.first_name, e.last_name, CONCAT(manager.first_name, ' ', manager.last_name) FROM employee 
// LEFT JOIN employee manager ON employee.manager_id = manager_id 
// ORDER BY id ASC