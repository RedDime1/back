/**
 * presentation controller
 */

export default {
    async findByCourse(ctx) {
        const { id } = ctx.query;
        const courseId = id === "null" ? 1 : Number(id);
        const user = ctx.state.user;
        const presentations = await strapi.entityService.findMany(
            'api::presentation.presentation',
            {
                filters: { course: courseId },
                populate: { speakers: true, tags: true }
            }
        );
        if (!user) {
            const res = presentations.map(p => ({
                ...p,
                completed: null,
            }));
            return {
                data: res,
                progressInfo: null
            }
        }

        let userProgress = await strapi.entityService.findMany(
            'api::progress.progress',
            {
                filters: { user: user.id },
                limit: 1
            }
        );

        if (!userProgress.length) {
            const defaultProgress = {
                1: { completed: [], progress: 0 },
                2: { completed: [], progress: 0 },
                3: { completed: [], progress: 0 }
            };

            userProgress = [await strapi.entityService.create(
                'api::progress.progress',
                {
                    data: {
                        user: user.id,
                        progressData: defaultProgress
                    }
                }
            )];
        }

        const progressData = userProgress[0]?.progressData || {};
        const courseProgress = progressData[courseId] || { completed: [], progress: 0 };

        const result = presentations.map(presentation => ({
            ...presentation,
            completed: courseProgress.completed.includes(presentation.id) ? 1 : null,
        }));

        return {
            data: result,
            progressInfo: {
                progress: courseProgress.progress
            }
        }
    },
    async findOne(ctx) {
        const {id} = ctx.query;
        const prId = id === "null" ? 1 : Number(id);
        const user = ctx.state.user;
        const entry = await strapi.entityService.findOne('api::presentation.presentation', prId, {
            populate: {
                speakers: true,
                tags: true
            }
        });

        if (!entry) {
            return ctx.notFound('Presentation not found');
        }

        return {
            data: entry,
            registered: !user ? 0 : 1
        }

    },
    async findByTags(ctx) {
        const {tags} = ctx.query as { tags?: string | string[] };

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
                    populate: {speakers: true, tags: true},
                    filters
                }
            );

            ctx.body = entries;
        } catch (error) {
            strapi.log.error('Error fetching presentations', error);
            ctx.internalServerError('Failed to fetch presentations');
        }
    },
    async findByFavourites(ctx) {
        const user = ctx.state.user;
        let fav = await strapi.entityService.findMany(
            'api::favourite.favourite',
            {
                filters: { user: user.id },
                limit: 1
            }
        );

        if (!fav.length) {
            const defaultList = {
                list: []
            };

            fav = [await strapi.entityService.create(
                'api::favourite.favourite',
                {
                    data: {
                        user: user.id,
                        list: defaultList
                    }
                }
            )];
        }

        const listId = fav[0].list["list"];
        console.log(listId);

        if (!Array.isArray(listId)) {
            return [];
        }

        const presentations = await strapi.entityService.findMany(
            'api::presentation.presentation',
            {
                filters: { id: { $in: listId } },
                populate: { speakers: true, tags: true }
            }
        );

        return {
            presentations: !presentations.length ? null : presentations,
        }
    },
};
