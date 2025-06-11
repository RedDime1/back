/**
 * favourite controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::favourite.favourite', ({ strapi }) => ({
    async find(ctx) {
        const { id } = ctx.query;
        const prId = id === "null" ? 1 : Number(id);
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
        return {
            data: fav[0].list["list"].includes(prId) ? 1 : 0
        }
    },
    async update(ctx) {
        const { id } = ctx.request.body;
        const prId = id === "null" ? 1 : Number(id);
        const user = ctx.state.user;

        let fav = await strapi.entityService.findMany(
            'api::favourite.favourite',
            {
                filters: { user: user.id },
                limit: 1
            }
        );

        const currentList = fav[0].list["list"] || [];
        const updatedList = currentList.includes(prId)
            ? currentList.filter(item => item !== prId)
            : [...currentList, prId];

        const updatedFav = await strapi.entityService.update(
            'api::favourite.favourite',
            fav[0].id,
            {
                data: {
                    user: user.id,
                    list: { list: updatedList }
                }
            }
        );

        return {
            data: updatedList.includes(prId) ? 1 : 0,
        };
    }
}));
