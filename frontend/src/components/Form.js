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
      ) : null}

      <button type="submit">
        {(initialData?.studentID || initialData?.course_id) ? 'Update' : 'Add'}
      </button>
    </form>
  );
}
