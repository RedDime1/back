
export default {
  routes: [
    {
      method: 'POST',
      path: '/comments',
      handler: 'comment.create',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/comments',
      handler: 'comment.find',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/comments/:id',
      handler: 'comment.findOne',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/comments/presentation/:presentation_id',
      handler: 'comment.findByPresentation',
      config: {
        policies: [],
      },
    },
  ],
};