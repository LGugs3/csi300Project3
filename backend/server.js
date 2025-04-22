const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Auth
app.post('/login', (req, res) => {
    console.log('🛠️ LOGIN ATTEMPT RECEIVED');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
  
    const { user, password } = req.body;
    if (user === 'ADMIN' && password === 'ADMIN') {
      console.log('✅ Login success');
      res.json({ success: true });
    } else {
      console.log('❌ Invalid credentials');
      res.status(401).json({ success: false });
    }
  });
  
  
  
  
// CRUD endpoints for Category

//----------------------STUDENTS---------------------------------------------
//get all students
app.get('/students', (req, res) => {
  db.all('SELECT * FROM Students', [], (err, rows) => res.json(rows));
});

//add new student
app.post('/students', (req, res) => {
  const { firstName, lastName, email, major, gradYear } = req.body;
  db.run('INSERT INTO Students (FirstName, LastName, Email, Major, GradYear) VALUES (?, ?, ?, ?, ?)',
    [firstName, lastName, email, major, gradYear], function(err) {
    res.json({ id: this.lastID });
  });
});

// update existing student
app.put('/students/:id', (req, res) => {
    const { firstName, lastName, email, major, gradYear } = req.body;
    db.run('UPDATE Students SET FirstName = ?, LastName = ?, Email = ?, Major = ?, GradYear = ? WHERE StudentID = ?', 
      [firstName, lastName, email, major, gradYear, req.params.id],
      function(err) {
        if (err) return res.status(500).json(err);
        res.json({ updated: this.changes });
      }
    );
  });
  
  // delete student
  app.delete('/students/:id', (req, res) => {
    db.run('DELETE FROM Students WHERE StudentID = ?', [req.params.id], function(err) {
      if (err) return res.status(500).json(err);
      res.json({ deleted: this.changes });
    });
  });
  
  //------------------------Courses--------------------------
  // GET all courses
app.get('/courses', (req, res) => {
    db.all('SELECT * FROM Courses', [], (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    });
  });
  
  // ADD Course
  app.post('/courses', (req, res) => {
    const { coursePrefix, courseNumber, courseSection, courseRoom, startTime, classDays } = req.body;
    db.run('INSERT INTO Product (CoursePrefix, CourseNumber, CourseSection, CourseRoom, StartTime, ClassDays) VALUES (?, ?, ?, ?, ?, ?)', 
      [coursePrefix, courseNumber, courseSection, courseRoom, startTime, classDays], 
      function(err) {
        if (err) return res.status(500).json(err);
        res.json({ id: this.lastID });
      }
    );
  });
  
  // UPDATE existing course
  app.put('/courses/:id', (req, res) => {
    const { coursePrefix, courseNumber, courseSection, courseRoom, startTime, classDays } = req.body;
    db.run('UPDATE Product SET CoursePrefix = ?, CourseNumber = ?, CourseSection = ?, CourseRoom = ?, StartTime = ?, ClassDays = ? WHERE product_id = ?', 
      [coursePrefix, courseNumber, courseSection, courseRoom, startTime, classDays, req.params.id], 
      function(err) {
        if (err) return res.status(500).json(err);
        res.json({ updated: this.changes });
      }
    );
  });
  
  // DELETE course
  app.delete('/courses/:id', (req, res) => {
    db.run('DELETE FROM Courses WHERE CourseID = ?', [req.params.id], function(err) {
      if (err) return res.status(500).json(err);
      res.json({ deleted: this.changes });
    });
  });
  
  //-----------------------------------StudentCourses-----------------
  //get all courses for one student
  app.get('/studentcourses/:id', (req, res) => {
    db.run(`SELECT c.*
      FROM Students s
      INNER JOIN StudentCourses sc ON s.StudentID = sc.StudentID
      INNER JOIN Courses c ON sc.CourseID = c.CourseID
      WHERE s.StudentID = ?`), [req.params.id],
      function(err, rows) {
        if (err) return res.status(500).json(err);
        res.json(rows)
      }
  });

  //add course for one student
  app.post('/studentcourses/', (req, res) => {
    const { studentID, courseID } = req.body;
    db.run('INSERT OR IGNORE INTO StudentCourses(StudentID, CourseID) Values(?, ?)', [studentID, courseID],
      function(err) {
        if (err) return res.json(500),json(err);
        res.json({id: this.lastID});
      }
    )
  });

  //delete course for one student
  app.delete('/studentcourses/:sid:cid')

app.listen(5000, () => console.log('Backend running on port 5000'));
