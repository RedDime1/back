/**
 * presentation controller
 */

export default {
  async findAll(ctx) {
    const entry = await strapi.entityService.findMany('api::presentation.presentation', 
{ populate: { speakers: true, tags: true } });
    ctx.body = entry;
  },
  async findOne(ctx) {
    const { id } = ctx.query;
    if (!id) {
	const entry = await strapi.entityService.findOne('api::presentation.presentation', 1, 
      { populate: { speakers: true, tags: true } });
    	ctx.body = entry;
    } else {
    const entry = await strapi.entityService.findOne('api::presentation.presentation', id, { populate: { speakers: true, tags: true } });

    if (!entry) {
      return ctx.notFound('Presentation not found');
    }

    ctx.body = entry;
  }
  },
async findByTags(ctx) {
    const { tags } = ctx.query as { tags?: string | string[] };
    
    const filters: {
    $and?: Array<{
      tags: {
        name: {
          $eq: string;
        };
      };
    }>;
  } = {};

    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags];
      filters.$and = tagsArray.map(tag => ({
        tags: {
          name: {
            $eq: tag
          }
        }
      }));
    }

    try {
      const entries = await strapi.entityService.findMany(
        'api::presentation.presentation',
        {
          populate: { speakers: true, tags: true },
          filters
        }
      );

      ctx.body = entries;
    } catch (error) {
      strapi.log.error('Error fetching presentations', error);
      ctx.internalServerError('Failed to fetch presentations');
    }
  },
};
