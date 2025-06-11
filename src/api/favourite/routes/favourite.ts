/**
 * favourite router
 */
export default {
    routes: [
        {
            method: 'GET',
            path: '/favourite',
            handler: 'favourite.find',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/favourite',
            handler: 'favourite.update',
            config: {
                policies: [],
            },
        }
    ],
};
