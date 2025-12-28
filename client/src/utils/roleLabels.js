// utils/roleLabels.js
export const getRoleLabel = (role) => {
  switch (role) {
    case 'coordinator':
      return 'Coordinator';
    case 'educator':
      return 'Instructor';
    case 'learner':
      return 'Student';
    default:
      return role;
  }
};

export const getRoleLabelPlural = (role) => {
  switch (role) {
    case 'coordinator':
      return 'Coordinators';
    case 'educator':
      return 'Instructors';
    case 'learner':
      return 'Students';
    default:
      return role;
  }
};