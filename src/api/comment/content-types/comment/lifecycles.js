module.exports = {
  async beforeCreate(event) {
    const { params } = event;
    const { data } = params;

    if (data.user === undefined && strapi.state.user) {
      data.user = strapi.state.user.id; // или data.user = strapi.state.user
    }
  },
};