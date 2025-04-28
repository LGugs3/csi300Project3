const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

// Create tables if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS Students(
    StudentID INTEGER PRIMARY KEY AUTOINCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(50),
    Major VARCHAR(50),
    GradYear YEAR
    );`
  );

  db.run(`CREATE TABLE IF NOT EXISTS Courses(
    CourseID INTEGER PRIMARY KEY AUTOINCREMENT,
    CoursePrefix VARCHAR(3),
    CourseNumber VARCHAR(3),
    CourseSection VARCHAR(3),
    CourseRoom VARCHAR(30),
    StartTime TEXT,
    ClassDays VARCHAR(4)
    );`
  );

  db.run(`CREATE TABLE IF NOT EXISTS GradeTypes(
    GradeTypeID INTEGER PRIMARY KEY AUTOINCREMENT,
    GradeType VARCHAR(20)
    );`
  );

db.run(`CREATE TABLE IF NOT EXISTS StudentCourses(
    StudentID INTEGER NOT NULL,
    CourseID INTEGER NOT NULL,
    PRIMARY KEY(StudentID, CourseID),

    FOREIGN KEY (StudentID)
      REFERENCES Students(StudentID)
      ON UPDATE CASCADE,
    FOREIGN KEY (CourseID)
      REFERENCES Courses(CourseID)
      ON UPDATE CASCADE
    );`
  );

  db.run(`CREATE TABLE IF NOT EXISTS Grades(
    GradeID INTEGER PRIMARY KEY AUTOINCREMENT,
    CourseID INTEGER NOT NULL,
    GradeTypeID INTEGER NOT NULL,
    Grade INTEGER,

    FOREIGN KEY (CourseID)
      REFERENCES Courses(CourseID)
      ON UPDATE CASCADE,
    FOREIGN KEY (GradeTypeID)
      REFERENCES GradeTypes(GradeTypeID)
      ON UPDATE CASCADE
    );`
  );

  db.run(`CREATE TABLE IF NOT EXISTS StudentGrades(
    StudentID INTEGER NOT NULL,
    GradeID INTEGER NOT NULL,

    PRIMARY KEY(StudentID, GradeID),

    FOREIGN KEY (StudentID)
      REFERENCES Students(StudentID)
      ON UPDATE CASCADE,
    FOREIGN KEY (GradeID)
      REFERENCES Grades(GradeID)
      ON UPDATE CASCADE
      ON DELETE CASCADE
    );`
  );
  
db.get('SELECT COUNT(*) as count FROM GradeTypes', [], (err, row) => {
    if (err) {
      console.error('Error checking GradeTypes table:', err);
      return;
    }
    
    // Only seed if the table is empty
    if (row.count === 0) {
      const gradeTypes = [
        'Quiz',
        'Homework',
        'Midterm Exam',
        'Final Exam',
        'Project',
        'Participation',
        'Lab Assignment'
      ];
      
      // Use a prepared statement for efficient insertion
      const stmt = db.prepare('INSERT INTO GradeTypes (GradeType) VALUES (?)');
      
      gradeTypes.forEach(type => {
        stmt.run(type, (err) => {
          if (err) console.error(`Error seeding grade type ${type}:`, err);
        });
      });
      
      stmt.finalize();
      console.log('GradeTypes table seeded successfully');
    }
  });
});

module.exports = db;
