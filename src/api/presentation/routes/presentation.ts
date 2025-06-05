/**
 * presentation router
 */

export default {
  routes: [
    {
      method: 'GET',
      path: '/presentations',
      handler: 'presentation.findAll',
    },
    {
      method: 'GET',
      path: '/presentation',
      handler: 'presentation.findOne',
    },
    {
      method: 'GET',
      path: '/presentations/tags',
      handler: 'presentation.findByTags',
    }
  ],
};