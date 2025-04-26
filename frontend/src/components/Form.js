import { useState } from 'react';

export default function Form({ type, onSubmit, initialData = {} }) {
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
            placeholder="First Name"
            value={formData.FirstName || ''}
            onChange={handleChange}
            required
          />
          <input
            name="LastName"
            placeholder="Last Name"
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
            placeholder="Course Prefix"
            value={formData.CoursePrefix || ''}
            onChange={handleChange}
            required
          />
          <input
            name="CourseNumber"
            placeholder="Course Number"
            value={formData.CourseNumber || ''}
            onChange={handleChange}
            required
          />
          <input
            name="CourseRoom"
            placeholder="Classroom"
            value={formData.CourseRoom || ''}
            onChange={handleChange}
            required
          />
          <input
            name="StartTime"
            type="time"
            placeholder="Start Time"
            value={formData.StartTime || ''}
            onChange={handleChange}
            required
          />
          <input
            name="EndTime"
            type="time"
            placeholder="End Time"
            value={formData.EndTime || ''}
            onChange={handleChange}
            required
          />
        </>
      ) : null}

      <button type="submit">
        {(initialData?.studentID || initialData?.course_id) ? 'Update' : 'Add'}
      </button>
    </form>
  );
}
