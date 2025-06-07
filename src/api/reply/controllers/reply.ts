import { factories } from '@strapi/strapi';
import { Context } from 'koa';



export default factories.createCoreController('api::reply.reply', ({ strapi }) => ({
    async find(ctx: Context) {
        const { page = 1, hide = false } = ctx.query;
        const pageSize = 5;
        const pageNumber = Number(page);
        const shouldHide = hide === 'true';
        const { commentId } = ctx.params;

        try {
            if (shouldHide) {
                return { data: null, meta: null };
            }

            const filters = {
                comment: { id: Number(commentId) } // Фильтр по ID комментария
            };

            const replies = await strapi.entityService.findMany('api::reply.reply', {
                    filters,
                    populate: [],
                    sort: { createdAt: 'asc' },
                    limit: pageSize,
                    start: (pageNumber - 1) * pageSize,
                });

            const next_pg = pageNumber + 1;
            const shouldReturnMeta = replies.length >= 5;
            return {
                data: replies.map(reply => ({
                    id: reply.id,
                    com_id: commentId,
                    name: reply.name,
                    text: reply.text_comment,
                    name_adr: reply.name_adr,
                    date: new Date(reply.createdAt).toLocaleDateString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                })),
                meta: shouldReturnMeta ? {
                    next_page: next_pg,
                    com_id: commentId
                } : null
            }

        } catch (err) {
            strapi.log.error('Error fetching replies:', err);
            return ctx.internalServerError('Ошибка при получении ответов');
        }
    },

    async form(ctx: Context) {
        const { comment, author } = ctx.query;

        return `
            <form hx-post="https://steadfast-champion-93368c3d1a.strapiapp.com/api/replies"
            hx-headers='js:{"Authorization": "Bearer " + localStorage.getItem("jwt")}' hx-target="#global-reply-form" 
                hx-ext="client-side-templates" 
                mustache-template="empty-template">
              <input type="hidden" name="comment" value="${comment}">
              <input type="hidden" name="author" value="${author}">
              <p>Ответ пользователю ${author}</p>
              <textarea name="text" required></textarea>
              <button type="submit">Отправить</button>
              <button type="button" hx-get="https://steadfast-champion-93368c3d1a.strapiapp.com/api/replies/0?hide=true" hx-target="#global-reply-form" 
                hx-ext="client-side-templates" 
                mustache-template="empty-template">
                Отмена
              </button>
            </form>
        `;
    },

    async create(ctx: Context) {
        try {
            const { comment: commentId, author: author, text } = ctx.request.body;
            if (!text) {
                return ctx.badRequest('Необходимо указать текст');
            }

            const user = ctx.state.user;
            if (!user) {
                return ctx.unauthorized('Для комментирования нужно зарегистрироваться');
            }

            const reply = await strapi.entityService.create('api::reply.reply', {
                data: {
                    text_comment: text,
                    name: user.username,
                    comment: commentId,
                    name_adr: author,
                    publishedAt: new Date().toISOString()
                }
            });

            return {};

        } catch (err) {
            strapi.log.error('Ошибка создания ответа:', err);
            return ctx.internalServerError('Ошибка при создании ответа');
        }
    }
}));