INSERT INTO department (name) 
VALUES  ('Finance'),
        ('Engineering'),
        ('Procurement'),
        ('Human Ressources');

INSERT INTO role (title, salary, department_id)  
VALUES  ('CFO', 80000, 1),
        ('Director Engineering', 90000, 2),
        ('Software Engineer', 60000, 2),
        ('Purchasing Agent', 60000, 3),
        ('Procurement Manager', 60000, 3),
        ('HR Admin', 70000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id) 
VALUES  ('Heather', 'Ash', 1, null),
        ('Tom', 'Lumia', 2, null),
        ('Souad', 'Hassen', 3, 2),
        ('Ali', 'Garner', 6, 1),
        ('Vanessa', 'Marshall', 4, 6),
        ('Martin', 'Ineichen', 5, null);
