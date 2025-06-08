/**
 * test router
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/test',
            handler: 'test.findByPresentation',
            config: {
                policies: [],
            },
        },
        {
            method: 'POST',
            path: '/test',
            handler: 'test.checkAnswers',
            config: {
                policies: [],
            },
        },
    ],
};