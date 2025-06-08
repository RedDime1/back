/**
 * test controller
 */
import {factories} from "@strapi/strapi";

export default factories.createCoreController('api::test.test', ({ strapi }) => ({
    async findByPresentation(ctx) {
        try {
            const { id } = ctx.query;
            const prId = id === "null" ? 1 : id;
            const user = ctx.state.user;

            if (!user) {
                return {};
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

            const progressData = userProgress[0].progressData;
            if (progressData["1"].completed.includes(prId) || progressData["2"].completed.includes(prId) ||
            progressData["3"].completed.includes(prId)) {
                return {
                    wrap: {
                        data: null
                    },
                };
            }

            if (!prId) {
                return ctx.badRequest('Необходимо указать presentation_id');
            }

            const test = await strapi.entityService.findMany('api::test.test', {
                filters: { presentation_id: prId },
                populate: ['questions'],
                limit: 1
            });

            if (!test.length) {
                return ctx.notFound('Тест для данной презентации не найден');
            }

            const formattedTest = {
                id: test[0].id,
                title: test[0].title,
                presentation_id: test[0].presentation_id,
                questions: test[0]['questions'].map(question => ({
                    id_q: question.id,
                    text_q: question.text,
                    answers:
                        [
                            {
                                id: 1,
                                text: question.answer1,
                            },
                            {
                                id: 2,
                                text: question.answer2,
                            },
                            {
                                id: 3,
                                text: question.answer3,
                            },
                            {
                                id: 4,
                                text: question.answer4,
                            }]
                }))
            };

            return {
                wrap: {
                    data: formattedTest
                }
            };

        } catch (err) {
            strapi.log.error('Ошибка при получении теста:', err);
            return ctx.internalServerError('Ошибка сервера');
        }
    },
    async checkAnswers(ctx) {
        try {
            const { testId, answers, id: presentationId } = ctx.request.body;
            const user = ctx.state.user;
            const pr_id = presentationId === "null" ? 1 : presentationId;

            if (!user) {
                return ctx.unauthorized('Необходима авторизация');
            }


            const test = await strapi.entityService.findOne('api::test.test', testId, {
                populate: ['questions'],
            });
            const courseId = test.course;

            let allCorrect = true;
            let i = 0;
            const results = test['questions'].map(question => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer == question.correct;
                i++;
                if (!isCorrect) allCorrect = false;
            });

            if (allCorrect) {

                let userProgress = await strapi.entityService.findMany(
                    'api::progress.progress',
                    {
                        filters: { user: user.id },
                        limit: 1
                    }
                );
                const progressData = userProgress[0]?.progressData;
                if (!progressData[courseId].completed.includes(pr_id)) {

                    const presentations = await strapi.entityService.findMany(
                        'api::presentation.presentation',
                        {
                            filters: { course: courseId as any },
                        }
                    );


                    progressData[courseId].completed.push(pr_id);
                    progressData[courseId].progress =
                        Math.round((progressData[courseId].completed.length / presentations.length) * 100);

                    await strapi.entityService.update(
                        'api::progress.progress',
                        userProgress[0]?.id,
                        { data: { progressData } }
                    );
                }
                return {
                    success: 1
                };
            } else {
                return {
                    success: null
                }
            }



        } catch (err) {
            strapi.log.error('Ошибка проверки теста:', err);
            return ctx.internalServerError('Ошибка сервера');
        }
    }

}));