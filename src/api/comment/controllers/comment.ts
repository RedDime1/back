import {factories} from '@strapi/strapi';
import {Context} from 'koa';

interface CommentCreateRequest {
  text_comment: string;
  rate: number;
  presentation_id: number;
}

export default factories.createCoreController(
  'api::comment.comment',
  ({ strapi }) => ({
    async create(ctx: Context) {
      try {
        const { text_comment, presentation_id } = ctx.request
          .body as CommentCreateRequest;

        if (!text_comment || text_comment.length > 1024 || !presentation_id) {
          return ctx.badRequest(
            'Необходимо указать или сократить текст'
          );
        }

        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized('Для комментирования нужно зарегистрироваться');
        }

        const newComment = await strapi.entityService.create(
          'api::comment.comment',
          {
            data: {
              text_comment,
              presentation_id: presentation_id,
              users_permissions_user: user.id,
              name: user.username,
            },
          }
        );

        return ctx.send('Комментарий отправлен');
      } catch (err) {
        strapi.log.error('Error creating comment:', err);
        return ctx.internalServerError(
          'Произошла ошибка при создании комментария'
        );
      }
    },

    async find(ctx: Context) {
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const results = await strapi.entityService.findMany(
        'api::comment.comment',
        sanitizedQuery
      );
      const resultsWithDate = results.map(comment => ({
        ...comment,
        date: new Date(comment.createdAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      }));
      const sanitizedResults = await this.sanitizeOutput(resultsWithDate, ctx);
      return this.transformResponse(sanitizedResults);
    },

    async findOne(ctx: Context) {
      const { id } = ctx.params;
      await this.validateQuery(ctx);
      const sanitizedQuery = await this.sanitizeQuery(ctx);
      const result = await strapi.entityService.findOne(
        'api::comment.comment',
        id,
        sanitizedQuery
      );
      const resultWithDate = {
        ...result,
	date: new Date(result.createdAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
        
      };
      const sanitizedResult = await this.sanitizeOutput(resultWithDate, ctx);
      return this.transformResponse(sanitizedResult);
    },

    async findByPresentation(ctx: Context) {
      const { presentation_id } = ctx.params;
      let page = 1;

      if (ctx.query?.page) {
        page = Number(ctx.query.page);
        if (isNaN(page)) page = 1;
      }

      if (!presentation_id) {
        return ctx.badRequest('Необходимо указать presentation_id');
      }

      try {
        const comments = await strapi.entityService.findMany(
            'api::comment.comment',
            {
              filters: { presentation_id: presentation_id },
              populate: ['users_permissions_user'],
              sort: { createdAt: 'desc' },
              limit: 5,
              start: (page - 1) * 5,
            }
        );

        const repliesCounts = await Promise.all(
            comments.map(comment =>
                strapi.entityService.count('api::reply.reply', {
                  filters: {
                    comment: {
                      id: comment.id
                    }
                  }
                })
            )
        );

        const commentsWithDate = comments.map((comment, index) => ({
          ...comment,
          date: new Date(comment.createdAt).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          replies_count: repliesCounts[index],
        }));
        const shouldReturnMeta = commentsWithDate.length >= 5;

        return {
          commentsWithDate,
          meta: shouldReturnMeta ? {
            next_page: page + 1,
            pr_id: presentation_id
          } : null
        };
      } catch (err) {
        strapi.log.error('Error finding comments:', err);
        return ctx.internalServerError('Ошибка при получении комментариев');
      }
    }
  })
);