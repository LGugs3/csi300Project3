import { startTransition, useEffect, useState } from 'react';
import Form from './Form';

export default function Dashboard({ isAdmin }) {
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([])
  const [editStudent, setEditStudent] = useState(null)

  const [editCourse, setEditCourse] = useState(null)
  const [courses, setCourses] = useState([])

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentCourses, setStudentCourses] = useState([]);

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
    if (selectedStudent) {
      fetch(`http://localhost:5000/studentcourses/${selectedStudent}`)
        .then(res => res.json())
        .then(data => {
          setStudentCourses(data);
        })
        .catch(err => {
          console.error("Error fetching student courses:", err);
          setStudentCourses([]);
        });
    } else {
      setStudentCourses([]);
    }
  }, [selectedStudent]); // Re-fetch whenever the selected student changes
  
  // Function to handle student selection from dropdown
  const handleStudentSelect = (e) => {
    const studentId = e.target.value ? parseInt(e.target.value, 10) : null;
    setSelectedStudent(studentId);
    setSelectedCourse(null); // Reset course selection when student changes
  };

 // Improved addStudentCourse function with better debugging
const addStudentCourse = async () => {
  if (!selectedStudent || !selectedCourse) {
    console.error("Missing student or course selection");
    return;
  }
  
  try {
    const data = {
      StudentID: parseInt(selectedStudent, 10),
      CourseID: parseInt(selectedCourse, 10)
    };
    
    console.log("Sending enrollment data:", data);
    
    const response = await fetch('http://localhost:5000/studentcourses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    // Log the entire response for debugging
    console.log("Server response status:", response.status);
    
    const responseData = await response.json();
    console.log("Server response data:", responseData);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(responseData)}`);
    }
    
    console.log("Enrollment successful, refreshing student courses...");
    
    // Reset the course selection but keep the student selected
    setSelectedCourse(null);
    
    // Refresh the student's courses to show the new enrollment
    const coursesResponse = await fetch(`http://localhost:5000/studentcourses/${selectedStudent}`);
    
    if (!coursesResponse.ok) {
      throw new Error(`Error fetching updated courses: ${coursesResponse.status}`);
    }
    
    const coursesData = await coursesResponse.json();
    console.log("Updated student courses:", coursesData);
    
    setStudentCourses(coursesData);
      
  } catch (error) {
    console.error("Error adding student to course:", error);
    alert("Failed to enroll student in course: " + error.message);
  }
};

  // Function to remove a student from a course
  const deleteStudentCourse = async (studentId, courseId) => {
    try {
      const response = await fetch(`http://localhost:5000/studentcourses/${studentId}&${courseId}`, { 
        method: 'DELETE' 
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the student's courses to show the updated enrollments
      fetch(`http://localhost:5000/studentcourses/${studentId}`)
        .then(res => res.json())
        .then(setStudentCourses)
        .catch(err => console.error("Error refreshing student courses:", err));
        
    } catch (error) {
      console.error("Error deleting student course:", error);
      alert("Failed to remove student from course. Please try again.");
    }
  };

  const addOrUpdateStudent = async (data) => {
    const method = editStudent ? "PUT" : "POST"
    const url = editStudent
    ? `http://localhost:5000/students/${editStudent.StudentID}`
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
    console.log("Course Data Submitted: ", data); // Debug
    const method = editCourse ? 'PUT' : 'POST';
    const url = editCourse
      ? `http://localhost:5000/courses/${editCourse.CourseID}`
      : 'http://localhost:5000/courses';
    
    // Fixes case issues on course attributes - make sure we format before logging
    const formattedData = {
      CoursePrefix: data.CoursePrefix,
      CourseNumber: parseInt(data.CourseNumber, 10), // Convert to number
      CourseSection: parseInt(data.CourseSection, 10), // Convert to number
      CourseRoom: data.CourseRoom,  
      StartTime: data.StartTime,
      ClassDays: data.ClassDays
    };
    
    console.log("Formatted Course Data:", formattedData);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Server response:", result);
      
      setEditCourse(null);
      fetchData();
    } catch (error) {
      console.error("Error updating course:", error);
    }
  };

  const addOrUpdateStudentCourse = async (data) => {
    // Convert string IDs to integers
    const formattedData = {
      StudentID: parseInt(data.StudentID, 10),
      CourseID: parseInt(data.CourseID, 10)
    };

    console.log("Student Course Data:", formattedData);

    try {
      const response = await fetch('http://localhost:5000/studentcourses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Server response:", result);

      // Update selected student to trigger a refetch
      setSelectedStudent(formattedData.StudentID);
    } catch (error) {
      console.error("Error adding student course:", error);
    }
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
      
      // DEBUGGING 
      //console.log(`About to send PUT request to ${endpoint}/${id} with data:`, JSON.stringify(updatedData, null, 2));
    }

    fetch(`http://localhost:5000/${endpoint}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    }).then(response => {
        if (!response.ok) {
          return response.json().then(errorData => {
            console.error("Server error details:", errorData);
            throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorData)}`);
          }).catch(e => {
            throw new Error(`HTTP error! status: ${response.status}, could not parse error details`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Update successful:", data);
        setEditingRowId(null);
        setEditingData({});
        fetchData();
      })
      .catch((error) => {
        console.error("Error updating:", error);
        alert("Error updating: " + error.message);
      }); 
  }

  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    
    // Parse the time string
    const [hours, minutes] = time24.split(':').map(num => parseInt(num, 10));
    
    // Convert to 12-hour format
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for midnight
    
    // Format with leading zeros for minutes
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const cancelEdit = () => {
    setEditingRowId(null);
    setEditingData({});
  };

  // Find student name by ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.StudentID === parseInt(studentId, 10));
    return student ? `${student.FirstName} ${student.LastName}` : 'Unknown Student';
  };

  // Find course name by ID
  const getCourseName = (courseId) => {
    const course = courses.find(c => c.CourseID === parseInt(courseId, 10));
    return course ? `${course.CoursePrefix} ${course.CourseNumber}-${course.CourseSection}` : 'Unknown Course';
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
            </tr>
          ))}
        </tbody>
      </table>

     {/* Student Courses */}
    <h2>Student Course Enrollment</h2>

        {/* Student Dropdown */}
        <select 
          value={selectedStudent || ''}
          onChange={handleStudentSelect}
          style={{ padding: '5px', minWidth: '200px' }}
        >
          <option value="">-- Select a Student --</option>
          {students.map(student => (
            <option key={student.StudentID} value={student.StudentID}>
              {student.FirstName} {student.LastName}
            </option>
          ))}
        </select>
        
    {isAdmin && (
      <div>

        {/* Course Dropdown - Only enabled if a student is selected */}
        <select 
          id="courseSelect"
          disabled={!selectedStudent}
          value={selectedCourse || ''}
          onChange={(e) => setSelectedCourse(e.target.value)}
          style={{ padding: '5px', minWidth: '200px' }}
        >
          <option value="">-- Select a Course --</option>
          {courses.map(course => (
            <option key={course.CourseID} value={course.CourseID}>
              {course.CoursePrefix} {course.CourseNumber}-{course.CourseSection} ({course.ClassDays})
            </option>
          ))}
        </select>

        {/* Add Button - Only enabled if both student and course are selected */}
        <button 
          onClick={addStudentCourse}
          disabled={!selectedStudent || !selectedCourse}>
          Add Enrollment
        </button>
      </div>
    )}

    {/* Student Courses Table - Shows enrollment for selected student */}
    <table border="1" cellPadding="6" style={{ marginBottom: '2em', width: '100%' }}>
      <thead>
        <tr>
          <th>Course Prefix</th>
          <th>Course Number</th>
          <th>Section</th>
          <th>Room</th>
          <th>Time</th>
          <th>Days</th>
          {isAdmin && <th>Actions</th>}
        </tr>
      </thead>
      <tbody>
        {selectedStudent && studentCourses.length > 0 ? (
          studentCourses.map(course => (
            <tr key={course.CourseID}>
              <td>{course.CoursePrefix}</td>
              <td>{course.CourseNumber}</td>
              <td>{course.CourseSection}</td>
              <td>{course.CourseRoom}</td>
              <td>{formatTime12Hour(course.StartTime)}</td>
              <td>{course.ClassDays}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => deleteStudentCourse(selectedStudent, course.CourseID)}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '15px' }}>
              {selectedStudent ? 'No courses enrolled' : 'Select a student to view their enrolled courses'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
    </div>
  );
}
