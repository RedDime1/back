import { factories } from '@strapi/strapi';
import { Context } from 'koa';

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
        const { text_comment, rate, presentation_id } = ctx.request
          .body as CommentCreateRequest;

        if (!text_comment || !rate || !presentation_id) {
          return ctx.badRequest(
            'Необходимо указать текст и оценку'
          );
        }

        if (rate < 1 || rate > 5) {
          return ctx.badRequest('Рейтинг должен быть от 1 до 10');
        }

        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized('Для комментирования нужно зарегистрироваться');
        }

        const existingComment = await strapi.entityService.findMany(
          'api::comment.comment',
          {
            filters: {
              presentation_id: presentation_id,
              users_permissions_user: user.id,
            },
            limit: 1,
          }
        );

        if (existingComment.length > 0) {
          return ctx.send('Вы уже оставляли отзыв, спасибо');
        }

        const newComment = await strapi.entityService.create(
          'api::comment.comment',
          {
            data: {
              text_comment,
              rate,
              presentation_id: presentation_id,
              users_permissions_user: user.id,
              name: user.username,
            },
          }
        );

        return ctx.send('Спасибо за отзыв');
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
          }
        );
        const commentsWithDate = comments.map(comment => ({
          ...comment,
          date: new Date(comment.createdAt).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
        }));

        return this.transformResponse(commentsWithDate);
      } catch (err) {
        strapi.log.error('Error finding comments:', err);
        return ctx.internalServerError('Ошибка при получении комментариев');
      }
    },
  })
);