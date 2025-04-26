import { useEffect, useState } from 'react';
import Form from './Form';

export default function Dashboard({ isAdmin }) {
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([])
  const [editStudent, setEditStudent] = useState(null)

  const [editCourse, setEditCourse] = useState(null)
  const [courses, setCourses] = useState([])

  const fetchData = () => {
    fetch('http://localhost:5000/students')
      .then(res => res.json())
      .then(setStudents)
    fetch('http://localhost:5000/courses')
      .then(res => res.json())
      .then(setCourses)

    //old stuff; delete later
    // fetch('http://localhost:5000/categories')
    //   .then(res => res.json())
    //   .then(setCategories);
    // fetch('http://localhost:5000/products')
    //   .then(res => res.json())
    //   .then(setProducts);
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
    console.log("Course Data Submitted: ", data); // Check this
    const method = editCourse ? 'PUT' : 'POST';
    const url = editCourse
      ? `http://localhost:5000/courses/${editCourse.course_id}`
      : 'http://localhost:5000/courses';
  
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditCourse(null);
    fetchData();
  };

  const deleteStudent = async(id) => {
    await fetch(`http://localhost:5000/students/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const deleteCourse = async(id) => {
    await fetch(`http://localhost:5000/courses/${id}`, { method: 'DELETE' });
    fetchData();
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
          {students.map(stu => (
            <tr key={stu.StudentID}>
              <td>{stu.StudentID}</td>
              <td>{stu.FirstName}</td>
              <td>{stu.LastName}</td>
              <td>{stu.Email}</td>
              <td>{stu.Major}</td>
              <td>{stu.GradYear}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => setEditStudent(stu)}>Edit</button>
                  <button onClick={() => deleteStudent(stu.StudentID)}>Delete</button>
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
            <th>Classroom</th>
            <th>Start Time</th>
            <th>End Time</th>
            {isAdmin && <th>Admin Actions</th>}
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.CourseId}>
            <td>{course.CoursePrefix}</td>
            <td>{course.CourseNumber}</td>
            <td>{course.CourseRoom}</td>
            <td>{course.StartTime}</td>
            <td>{course.EndTime}</td>            
            {isAdmin && (
              <td>
                <button onClick={() => setEditCourse(course)}>Edit</button>
                <button onClick={() => deleteCourse(course.CourseId)}>Delete</button>
              </td>
            )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
