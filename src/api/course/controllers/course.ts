/**
 * course controller
 */

import { factories } from '@strapi/strapi'
import {Context} from "koa";

// export default factories.createCoreController('api::course.course');

export default factories.createCoreController(
    'api::course.course',
    ({ strapi }) => ({
        async find(ctx) {
            const { data, meta } = await super.find(ctx);

            // Модифицируем ID в возвращаемых данных
            const modifiedData = data.map(item => ({
                ...item,
                id: item.id - 1,
                link: "./course/list.html?id=" + (item.id - 1)
            }));

            return { data: modifiedData};
        },
    }));