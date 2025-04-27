import { startTransition, useEffect, useState } from 'react';
import Form from './Form';

export default function Dashboard({ isAdmin }) {
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([])
  const [editStudent, setEditStudent] = useState(null)

  const [editCourse, setEditCourse] = useState(null)
  const [courses, setCourses] = useState([])

  const [editingRowId, setEditingRowId] = useState(null);
  const [editingData, setEditingData] = useState({});

  const fetchData = () => {
    fetch('http://localhost:5000/students')
      .then(res => res.json())
      .then(setStudents)
    fetch('http://localhost:5000/courses')
      .then(res => res.json())
      .then(setCourses)
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addOrUpdateStudent = async (data) => {
    const method = editStudent ? "PUT" : "POST"
    const url = editStudent
    ? `http://localhost:5000/students/${editStudent.studentID}`
    : `http://localhost:5000/students`;

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    });

    setEditStudent(null);
    fetchData();
  }

  const addOrUpdateCourse = async (data) => {
    //console.log("Course Data Submitted: ", data); // Debug
    const method = editCourse ? 'PUT' : 'POST';
    const url = editCourse
      ? `http://localhost:5000/courses/${editCourse.CourseID}`
      : 'http://localhost:5000/courses';
    
    // Fixes case issues on course attributes
    const formattedData = {
      coursePrefix: data.CoursePrefix,
      courseNumber: data.CourseNumber,
      courseSection: data.CourseSection,
      courseRoom: data.CourseRoom,  
      startTime: data.StartTime,
      classDays: data.ClassDays
    };

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formattedData),
    });
    setEditCourse(null);
    fetchData();
  };

  // Deletes entry regardless of datatype through ternary operations
  // Replaced the old delete variables that had a different call per datatype
  const deleteEntity = async (id, type) => {
    const endpoint = type === 'student' ? 'students' 
      : type === 'course' ? 'courses' 
      : type === 'grade' ? 'grades' 
      : 'unknown';
    await fetch(`http://localhost:5000/${endpoint}/${id}`, { method: 'DELETE' });
    fetchData();
  };
  

  // Allows to edit each field in desired table
  const handleEditClick = (item, type) => {
    // use item and type to dynamically access the correct editing row
    setEditingRowId(item[`${type.charAt(0).toUpperCase() + type.slice(1)}ID`]); // Concat item and type
    setEditingData(item);
  };

  const saveEdit = (id, type) => {
    const endpoint = type === 'student' ? 'students' 
      : type === 'course' ? 'courses' 
      : type === 'grade' ? 'grades' 
      : 'unknown';
  
    let updatedData = { ...editingData };
  
    // Special handling for course to ensure numbers are numbers, not strings
    if (type === 'course') {
      if (updatedData.CourseNumber) {
        updatedData.CourseNumber = parseInt(updatedData.CourseNumber, 10);
      }
      if (updatedData.CourseSection) {
        updatedData.CourseSection = parseInt(updatedData.CourseSection, 10);
      }
      // You can add more validations here if necessary
    }
  
    fetch(`http://localhost:5000/${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then(() => {
        setEditingRowId(null); // Close edit mode
        setEditingData({});
        fetchData(); // Refresh the table to show the latest data
      })
      .catch((error) => console.error("Error updating:", error));
  };
  
  
  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingData({});
  };

  return (
    <div>
      {/* Students */}
      <h2>Students</h2>
      {isAdmin && (
        <Form
          type="student"
          onSubmit={addOrUpdateStudent}
          initialData={editStudent || {}}
        />
      )}
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Major</th>
            <th>Grad Year</th>
            {isAdmin && <th>Admin Actions</th>}
          </tr>
        </thead>
        <tbody>
          {students.map((stu) => (
            <tr key={stu.StudentID}>
              <td>{stu.StudentID}</td>
              <td> {/* ================ Student First Name ================ */}
                {editingRowId === stu.StudentID ? (
                  <input
                    type="text"
                    value={editingData.FirstName || ""}
                    onChange={(e) => setEditingData({ ...editingData, FirstName: e.target.value })}
                  />
                ) : (
                  stu.FirstName
                )}
              </td>
              <td> {/* ================ Student Last Name ================ */}
                {editingRowId === stu.StudentID ? (
                  <input
                    type="text"
                    value={editingData.LastName || ""}
                    onChange={(e) => setEditingData({ ...editingData, LastName: e.target.value })}
                  />
                ) : (
                  stu.LastName
                )}
              </td>
              <td> {/* ================ Student Email ================ */}
                {editingRowId === stu.StudentID ? (
                  <input
                    type="email"
                    value={editingData.Email || ""}
                    onChange={(e) => setEditingData({ ...editingData, Email: e.target.value })}
                  />
                ) : (
                  stu.Email
                )}
              </td>
              <td> {/* ================ Student Major ================ */}
                {editingRowId === stu.StudentID ? (
                  <input
                    type="text"
                    value={editingData.Major || ""}
                    onChange={(e) => setEditingData({ ...editingData, Major: e.target.value })}
                  />
                ) : (
                  stu.Major
                )}
              </td>
              <td> {/* ================ Student Grad year ================ */}
                {editingRowId === stu.StudentID ? (
                  <input
                    type="number" // Keeps the grad years between the 20th and 21st centuries
                    min="1900"
                    max="2100"
                    value={editingData.GradYear || ""}
                    onChange={(e) => setEditingData({ ...editingData, GradYear: e.target.value })}
                  />
                ) : (
                  stu.GradYear
                )}
              </td>
              {isAdmin && ( // ================ Admin Options ================
                <td>
                  {editingRowId === stu.StudentID ? (
                    <>
                      <button onClick={() => saveEdit(stu.StudentID, "student")}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(stu, "student")}>Edit</button>
                      <button onClick={() => deleteEntity(stu.StudentID, "student")}>Delete</button>
                    </>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
  
      {/* Courses */}
      <h2>Courses</h2>
      {isAdmin && (
        <Form
          type="course"
          onSubmit={addOrUpdateCourse}
          initialData={editCourse || {}}
        />
      )}
      <table border="1" cellPadding="6" style={{ marginBottom: '2em' }}>
        <thead>
          <tr>
            <th>Course ID</th>
            <th>Course Prefix</th>
            <th>Course Number</th>
            <th>Course Section</th>
            <th>Classroom</th>
            <th>Start Time</th>
            <th>Class Days</th>
            {isAdmin && <th>Admin Actions</th>}
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.CourseID}>
<<<<<<< HEAD
            <td>{course.CourseID}</td>
            <td> {/* ================ Course Prefix ================ */}
              {editingRowId === course.CourseID ? (
                <input
                  type="text"
                  maxLength="3" // Ensures user can only enter 3 letters for course code
                  value={editingData.CoursePrefix || ""}
                  onChange={(e) => setEditingData({ ...editingData, CoursePrefix: e.target.value })}
                />
              ) : (
                course.CoursePrefix
              )}
            </td>
            <td> {/* ================ Course Number ================ */}
              {editingRowId === course.CourseID ? (
                <input
                  type="number"
                  min="100" // Ensures user can only type 3 numbers for course code
                  max="999" 
                  value={editingData.CourseNumber || ""}
                  onChange={(e) => setEditingData({ ...editingData, CourseNumber: e.target.value })}
                />
              ) : (
                course.CourseNumber
              )}
            </td>
            <td> {/* ================ Course Section ================ */}
              {editingRowId === course.CourseID ? (
                <input
                  type="number"
                  min="0" // Ensures user can only type 2 numbers for course section
                  max="99" 
                  value={editingData.CourseSection || ""}
                  onChange={(e) => setEditingData({ ...editingData, CourseSection: e.target.value })}
                />
                ) : (
                  course.CourseSection
                )
              }
            </td>
            <td> {/* ================ Course Room ================ */}
              {editingRowId === course.CourseID ? (
                <input
                  type="text" 
                  value={editingData.CourseRoom || ""}
                  onChange={(e) => setEditingData({ ...editingData, CourseRoom: e.target.value })}
                />
                ) : (
                  course.CourseRoom
                )
              }
            </td>
            <td> {/* ================ Course Time ================ */}
              {editingRowId === course.CourseID ? (
                <input
                  type="time"
                  value={editingData.StartTime || ""}
                  onChange={(e) => setEditingData({ ...editingData, StartTime: e.target.value })}
                />
                ) : (
                  course.StartTime
                )
              }
            </td>
            <td> {/* ================ Course Days ================ */}
              {editingRowId === course.CourseID ? (
                <input
                  type="text"
                  maxLength="3" // User needs to enter first letter of day (e.g. MTh for monday & thursday)
                  value={editingData.ClassDays || ""}
                  onChange={(e) => setEditingData({ ...editingData, ClassDays: e.target.value })}
                />
                ) : (
                  course.ClassDays
                )
              }
            </td>            
            {isAdmin && ( // ================ Admin Options ================
                <td>
                  {editingRowId === course.CourseID ? (
                    <>
                      <button onClick={() => saveEdit(course.CourseID, "course")}>Save</button>
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleEditClick(course, "course")}>Edit</button>
                      <button onClick={() => deleteEntity(course.CourseID, "course")}>Delete</button>
                    </>
                  )}
                </td>
              )}
=======
            <td>{course.CoursePrefix}</td>
            <td>{course.CourseNumber}</td>
            <td>{course.CourseRoom}</td>
            <td>{course.StartTime}</td>
            <td>{course.ClassDays}</td>
            {isAdmin && (
              <td>
                <button onClick={() => setEditCourse(course)}>Edit</button>
                <button onClick={() => deleteCourse(course.CourseID)}>Delete</button>
              </td>
            )}
>>>>>>> 0e36296240083a1cca7e7c35e071bc3ed5c1e083
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
