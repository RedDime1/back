export default {
    routes: [
        {
            method: 'GET',
            path: '/replies/:commentId',
            handler: 'reply.find',
            config: {
                policies: [],
            },
        },
        {
            method: 'GET',
            path: '/reply-form',
            handler: 'reply.form',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/replies',
            handler: 'reply.create',
            config: {
                policies: [],
            },
        }
    ],
};