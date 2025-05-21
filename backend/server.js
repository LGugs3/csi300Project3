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
  
  
  


//----------------------STUDENTS---------------------------------------------
//get all students
app.get('/students', (req, res) => {
  db.all('SELECT * FROM Students', [], (err, rows) => res.json(rows));
});

//add new student
app.post('/students', (req, res) => {
  const reqData = req.body;
  db.run('INSERT INTO Students (FirstName, LastName, Email, Major, GradYear) VALUES (?, ?, ?, ?, ?);',
    [reqData.FirstName, reqData.LastName, reqData.Email, reqData.Major, reqData.GradYear], function(err) {
      if (err) return res.status(500).json(err);
    res.json({ id: this.lastID });
  });
});

// update existing student
app.put('/students/:id', (req, res) => {
  const reqData = req.body;
  db.run('UPDATE Students SET FirstName = ?, LastName = ?, Email = ?, Major = ?, GradYear = ? WHERE StudentID = ?', 
    [reqData.FirstName, reqData.LastName, reqData.Email, reqData.Major, reqData.GradYear, req.params.id],
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
  db.all('SELECT * FROM Courses', [], (err, rows) => res.json(rows));
});
  
// ADD Course
app.post('/courses', (req, res) => {
  const reqData = req.body;
  db.run('INSERT INTO Courses (CoursePrefix, CourseNumber, CourseSection, CourseRoom, StartTime, ClassDays) VALUES (?, ?, ?, ?, ?, ?)', 
    [reqData.CoursePrefix, reqData.CourseNumber, reqData.CourseSection, reqData.CourseRoom, reqData.StartTime, reqData.ClassDays],   
    function(err) {
    if (err) {
        console.error("Error inserting course:", err);
        return res.status(500).json(err);
      }
      res.json({ id: this.lastID });
    }
  );
});
  
// UPDATE existing course
app.put('/courses/:id', (req, res) => {
  //DEBUGGING logs and tests    
  console.log("=== COURSE UPDATE ATTEMPT ===");
  console.log("Request params:", req.params);
  console.log("Request body:", JSON.stringify(req.body, null, 2));
  
  // Extract all fields individually for clearer logging
  const CoursePrefix = req.body.CoursePrefix;
  const CourseNumber = req.body.CourseNumber;
  const CourseSection = req.body.CourseSection;
  const CourseRoom = req.body.CourseRoom;
  const StartTime = req.body.StartTime;
  const ClassDays = req.body.ClassDays;
  
  console.log("Extracted data:", {
    CoursePrefix, CourseNumber, CourseSection, CourseRoom, StartTime, ClassDays
  });
  
  try {
    db.run(
      'UPDATE Courses SET CoursePrefix = ?, CourseNumber = ?, CourseSection = ?, CourseRoom = ?, StartTime = ?, ClassDays = ? WHERE CourseID = ?', 
      [CoursePrefix, CourseNumber, CourseSection, CourseRoom, StartTime, ClassDays, req.params.id], 
      function(err) {
        if (err) {
          console.error("DATABASE ERROR:", err);
          return res.status(500).json({ error: err.message || "Unknown database error" });
        }
        console.log("Update success, rows changed:", this.changes);
        res.json({ updated: this.changes });
      }
    );
  } catch (e) {
    console.error("SERVER ERROR:", e);
    res.status(500).json({ error: e.message || "Unknown server error" });
  }
});
  
// DELETE course
app.delete('/courses/:id', (req, res) => {
  db.run('DELETE FROM Courses WHERE CourseID = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ deleted: this.changes });
  });
});

//debugging get function
app.get('/debug', (req, res) => {
  const results = {};
  
  // Get Courses table schema
  db.all("PRAGMA table_info(Courses);", [], (err, rows) => {
    if (err) {
      results.coursesError = err.message;
    } else {
      results.coursesSchema = rows;
      
      // Get sample course data
      db.all("SELECT * FROM Courses LIMIT 1;", [], (err, rows) => {
        if (err) {
          results.sampleError = err.message;
        } else {
          results.sampleCourse = rows;
          res.json(results);
        }
      });
    }
  });
});
  
//-----------------------------------StudentCourses-----------------
// GET all courses for one student
app.get('/studentcourses/:id', (req, res) => {
  db.all(`SELECT c.*
    FROM Students s
    INNER JOIN StudentCourses sc ON s.StudentID = sc.StudentID
    INNER JOIN Courses c ON sc.CourseID = c.CourseID
    WHERE s.StudentID = ?`, [req.params.id],
    function(err, rows) {
      if (err) return res.status(500).json(err);
      res.json(rows);
    });
});

// ADD course for one student - with section validation
app.post('/studentcourses', (req, res) => {
  const { StudentID, CourseID } = req.body;
  console.log("Received enrollment request:", req.body);
  
  // First, get information about the course they're trying to enroll in
  db.get('SELECT CoursePrefix, CourseNumber FROM Courses WHERE CourseID = ?', 
    [CourseID],
    (err, courseInfo) => {
      if (err) {
        console.error("Error getting course info:", err);
        return res.status(500).json({ error: err.message });
      }
      
      if (!courseInfo) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      // Now check if student is already enrolled in any section of this course
      db.all(`
        SELECT c.*
        FROM StudentCourses sc
        JOIN Courses c ON sc.CourseID = c.CourseID
        WHERE sc.StudentID = ? AND c.CoursePrefix = ? AND c.CourseNumber = ?`,
        [StudentID, courseInfo.CoursePrefix, courseInfo.CourseNumber],
        (err, existingEnrollments) => {
          if (err) {
            console.error("Error checking existing enrollments:", err);
            return res.status(500).json({ error: err.message });
          }
          
          // If student is already enrolled in any section of this course, prevent enrollment
          if (existingEnrollments.length > 0) {
            const existingSection = existingEnrollments[0].CourseSection;
            return res.status(409).json({ 
              error: `Student is already enrolled in section ${existingSection} of ${courseInfo.CoursePrefix} ${courseInfo.CourseNumber}`
            });
          }
          
          // If not enrolled in any section, proceed with enrollment
          db.run('INSERT OR IGNORE INTO StudentCourses(StudentID, CourseID) VALUES(?, ?)', 
            [StudentID, CourseID],
            function(err) {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: err.message });
              }
              res.json({ id: this.lastID, changes: this.changes });
            }
          );
        }
      );
    }
  );
});

// DELETE course for one student
app.delete('/studentcourses/:sid&:cid', (req, res) => {
  db.run('DELETE FROM StudentCourses WHERE StudentID = ? AND CourseID = ?',
    [req.params.sid, req.params.cid],
    function(err) {
      if (err) return res.status(500).json(err);
      res.json({ deleted: this.changes });
    });
});

//update course for existing student
app.put('/studentcourses/:sid&:cid', (req, res) => {
  const reqData = req.body;
  //change params to reqData when form is created
  const { newCID } = req.body;
  db.run('UPDATE StudentCourses SET CourseID = ? WHERE StudentID = ? AND CourseID = ?',
  [newCID, req.params.sid, req.params.cid],
  function(err) {
    if (err) return res.status(500).json(err);
    res.json({ updated: this.changes });
  });
});

//-----------------------Grades----------------------------
//get grades for one student
app.get('/grades/:sid', (req, res) => {
  db.all(`SELECT g.*
    FROM Students s
    INNER JOIN StudentGrades sg ON s.StudentID = sg.StudentID
    INNER JOIN Grades g ON sg.GradeID = g.GradeID
    WHERE s.StudentID = ?
  `,
  [req.params.sid],
  function(err, rows) {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

//add grade for one student
app.post('/grades', (req, res) => {
  console.log("Received grade data:", req.body); // Add debugging
  const { sid, courseID, gradeTypeID, grade } = req.body;
  
  // First, add the grade
  db.run(`INSERT INTO Grades (CourseID, GradeTypeID, Grade) VALUES(?, ?, ?)`,
    [courseID, gradeTypeID, grade],
    function(err) {
      if (err) {
        console.error("Error inserting grade:", err);
        return res.status(500).json({ error: err.message });
      }
      
      const gradeId = this.lastID;
      
      // Then link it to the student in the junction table
      db.run(`INSERT INTO StudentGrades(StudentID, GradeID) VALUES(?, ?)`,
        [sid, gradeId],
        function(err) {
          if (err) {
            console.error("Error linking grade to student:", err);
            return res.status(500).json({ error: err.message });
          }
          
          res.json({ id: gradeId });
        }
      );
    }
  );
});

//update existing grade for one student
app.put('/grades/:gid', (req, res) => {
  console.log("Updating grade:", req.params.gid);
  console.log("Request body:", req.body);
  
  const { CourseID, GradeTypeID, Grade } = req.body;
  
  // Validate required fields
  if (!CourseID || !GradeTypeID || Grade === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  db.run(`UPDATE Grades SET CourseID = ?, GradeTypeID = ?, Grade = ? WHERE GradeID = ?`,
    [CourseID, GradeTypeID, Grade, req.params.gid],
    function(err) {
      if (err) {
        console.error("Error updating grade:", err);
        return res.status(500).json({ error: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: "Grade not found or no changes made" });
      }
      
      res.json({ 
        updated: this.changes,
        message: "Grade updated successfully" 
      });
    }
  );
});

//delete grade for one student
app.delete('/grades/:sid&:gid', (req, res) => {
  db.run(`DELETE FROM StudentGrades WHERE StudentID = ? AND GradeID = ?`,
    [req.params.sid, req.params.gid],
    function(err) {
      if (err) return res.status(500).json(err);
      
      // After deleting the link in the junction table, now delete the grade itself
      db.run(`DELETE FROM Grades WHERE GradeID = ?`,
        [req.params.gid],
        function(err) {
          if (err) return res.status(500).json(err);
          res.json({ deleted: this.changes });
        }
      );
    }
  );
});


// ----------------------------Gradetypes-----------------------------

app.get('/gradetypes', (req, res) => {
  db.all('SELECT * FROM GradeTypes', [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// ---------------------------Debug----------------------------------



// the rest
app.listen(5000, () => console.log('Backend running on port 5000'));
