// utils/courseCategories.js
export const getCategoryLabel = (category) => {
  switch (category) {
    case 'Development':
      return 'Software Development';
    case 'Design':
      return 'Graphic Design';
    case 'Business':
      return 'Business & Finance';
    default:
      return category;
  }
};

export const getCategoryStyle = (category) => {
  switch (category) {
    case 'Development':
      return 'bg-blue-600 text-white border-blue-700';
    case 'Design':
      return 'bg-purple-600 text-white border-purple-700';
    case 'Business':
      return 'bg-green-600 text-white border-green-700';
    default:
      return 'bg-gray-600 text-white border-gray-700';
  }
};

export const COURSE_CATEGORIES = [
  { value: 'Development', label: 'Software Development' },
  { value: 'Design', label: 'Graphic Design' },
  { value: 'Business', label: 'Business & Finance' }
];