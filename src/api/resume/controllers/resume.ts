/**
 * resume controller
 */

export default {
  async getResume(ctx) {
    const { id } = ctx.query; 
    if (!id) {
	const entry = await strapi.entityService.findOne('api::resume.resume', 1, {
      populate: {
  education: true,
  work_expirience: true,
  personality: true,
  contacts: true
}});
    	ctx.body = entry;
    } else {
    const entry = await strapi.entityService.findOne('api::resume.resume', id, {
      populate: {
  education: true,
  work_expirience: true,
  personality: true,
  contacts: true
}});

    if (!entry) {
      return ctx.notFound('Resume not found');
    }

    ctx.body = entry;
  }

  },
};
