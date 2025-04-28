import { useState } from 'react';

export default function Form({ type, onSubmit, initialData = {}, students = [], courses = [], gradeTypes = [] }) {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {type === 'student' ? (
        <>
          <input
            name="FirstName"
            placeholder="John"
            value={formData.FirstName || ''}
            onChange={handleChange}
            required
          />
          <input
            name="LastName"
            placeholder="Doe"
            value={formData.LastName || ''}
            onChange={handleChange}
            required
          />
          <input
            name="Email"
            placeholder="example@college.edu"
            value={formData.Email || ''}
            onChange={handleChange}
            required
          />
          <input
            name="Major"
            placeholder="Computer Science"
            value={formData.Major || ''}
            onChange={handleChange}
            required
          />
          <input
            name="GradYear"
            placeholder="20XX"
            value={formData.GradYear || ''}
            onChange={handleChange}
            required
          />
        </>
      ) : type === 'course' ? (
        <>
          <input
            name="CoursePrefix"
            placeholder="CSI"
            value={formData.CoursePrefix || ''}
            onChange={handleChange}
            required
          />
          <input
            name="CourseNumber"
            placeholder="300"
            value={formData.CourseNumber || ''}
            onChange={handleChange}
            required
          />
          <input
            name="CourseSection"
            placeholder="01"
            value={formData.CourseSection || ''}
            onChange={handleChange}
            required
          />
          <input
            name="CourseRoom"
            placeholder="Joyce 201"
            value={formData.CourseRoom || ''}
            onChange={handleChange}
            required
          />
          <input
            name="StartTime"
            type="time"
            placeholder="10:00 AM"
            value={formData.StartTime || ''}
            onChange={handleChange}
            required
          />
          <input
            name="ClassDays"
            placeholder="MTh | W | TF"
            value={formData.ClassDays || ''}
            onChange={handleChange}
            required
          />
        </>
      ) : type === 'studentCourse' ? (
        <>
          <select
            name="StudentID"
            value={formData.StudentID || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Student</option>
            {students.map(student => (
              <option key={student.StudentID} value={student.StudentID}>
                {student.FirstName} {student.LastName}
              </option>
            ))}
          </select>
          
          <select
            name="CourseID"
            value={formData.CourseID || ''}
            onChange={handleChange}
            required
          >
            <option value="">Select Course</option>
            {courses.map(course => (
              <option key={course.CourseID} value={course.CourseID}>
                {course.CoursePrefix} {course.CourseNumber}-{course.CourseSection}
              </option>
            ))}
          </select>
        </>
      ) : type === 'grade' ? (
        <>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>Student:</label>
            <select
              name="StudentID"
              value={formData.StudentID || ''}
              onChange={handleChange}
              required
              style={{ padding: '5px', minWidth: '200px' }}
            >
              <option value="">-- Select Student --</option>
              {students.map(student => (
                <option key={student.StudentID} value={student.StudentID}>
                  {student.FirstName} {student.LastName}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>Course:</label>
            <select
              name="CourseID"
              value={formData.CourseID || ''}
              onChange={handleChange}
              required
              style={{ padding: '5px', minWidth: '200px' }}
            >
              <option value="">-- Select Course --</option>
              {courses.map(course => (
                <option key={course.CourseID} value={course.CourseID}>
                  {course.CoursePrefix} {course.CourseNumber}-{course.CourseSection}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>Grade Type:</label>
            <select
              name="GradeTypeID"
              value={formData.GradeTypeID || ''}
              onChange={handleChange}
              required
              style={{ padding: '5px', minWidth: '200px' }}
            >
              <option value="">-- Select Grade Type --</option>
              {gradeTypes.map(type => (
                <option key={type.GradeTypeID} value={type.GradeTypeID}>
                  {type.GradeType}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>Grade:</label>
            <input
              name="Grade"
              type="number"
              min="0"
              max="100"
              placeholder="Grade (0-100)"
              value={formData.Grade || ''}
              onChange={handleChange}
              required
              style={{ padding: '5px', width: '100px' }}
            />
          </div>
        </>
      ) : null}

      <button type="submit">
      {initialData && (initialData.StudentID || initialData.CourseID || initialData.GradeID) 
          ? 'Update' 
          : 'Add'}
      </button>
      {type === 'grade' && (
        <button 
          type="button" 
          onClick={() => onSubmit(null)}>Cancel</button>
      )}
    </form>
  );
}
