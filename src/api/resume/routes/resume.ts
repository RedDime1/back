/**
 * resume router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/resume',
      handler: 'resume.getResume',
    },
  ],
};