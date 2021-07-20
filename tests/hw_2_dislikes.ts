import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { allure } from 'allure-mocha/runtime';
import Steps from '../src/steps/Steps';
import LikeApi from "../src/http/LikeApi";

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;
let randomId;
let numberOfDislikes;
let m = 3; //Количество дизлайков, которое надо поставить

describe('TestCase проверка дизлайков', async () => {
    it('1. Поиск случайного кота (allure1)', async () => {
        console.log('Поиск случайного кота');

        //Получение случайного ID
        const responseAllCats = await CoreApi.getAllCats();
        const randomNumberOfGroups = getRandomInt(responseAllCats.data.groups.length);
        const randomNumberOfCats = getRandomInt(responseAllCats.data.groups[randomNumberOfGroups].cats.length);
        randomId = responseAllCats.data.groups[randomNumberOfGroups].cats[randomNumberOfCats].id;
        console.log(`Найден ID ${randomId}`);

        //Получение случайного кота
        const responseRandomCat = await CoreApi.getCatById(randomId);
        console.log(`Получен кот ${responseRandomCat.data.cat.name}`);

        //Добавление информации о найденном случайном коте в отчет
        allure.logStep(`Найден случайный ID ${randomId}`);
        allure.logStep(`Выполнен запрос GET /get-by-id c параметром ${randomId}`);
        allure.testAttachment(
            'Информация найденном о коте (json)',
            JSON.stringify(responseRandomCat.data, null, 2),
            'application/json'
        );

        //Проверка статус кода
        assert.equal(responseRandomCat.status, 200, 'Статус не соответствует');
    });

    it('2. Получение и сохрание количества дизлайков (allure2)', async () => {
        //Получение кота
        const responseRandomCat = await CoreApi.getCatById(randomId);

        //Сохранение количества лайков
        numberOfDislikes = responseRandomCat.data.cat.dislikes;
        console.log(`У кота ${responseRandomCat.data.cat.dislikes} дизлайк(ов)`);

        //Вывод информации о количестве лайков в отчет
        allure.logStep(`У кота ${numberOfDislikes} дизлайк(ов)`);

        //Проверка статус кода
        assert.equal(responseRandomCat.status, 200, 'Статус не соответствует');
    });

    it('3. Проставление коту дизлайков (allure3)', async () => {
        //Ставим коту лайки
        for (let i = 0; i < m; i++) {
            const responseDislikeCat = await LikeApi.likes(randomId,{like:null, dislike:true});

            //Проверка статус кода (что лайки проставляются)
            assert.equal(responseDislikeCat.status, 200, 'Статус не соответствует');
        }
        console.log(`Поставлено коту ${m} дизлайк(ов)`);

        //Сохраняем сколько теперь должно быть дизлайков у кота
        numberOfDislikes = numberOfDislikes + m;

        allure.logStep(`Выполнен запрос POST /likes - ${m} раз(а), коту поставлено ${m} дизлайка`);

    });

    it('4. Проверить количество дизлайков кота (allure4)', async () => {
        //Получаем кота
        const responseRandomCat = await CoreApi.getCatById(randomId);

        //Добавление информации в отчет
        allure.logStep(`Выполнен запрос GET /get-by-id c параметром ${randomId}`);

        //Добавление информации о коте в отчет
        allure.testAttachment(
            'Информация найденном о коте (json)',
            JSON.stringify(responseRandomCat.data, null, 2),
            'application/json'
        );

        //Проверка что количество лайков соответствует ожидаемому (увеличилось на n)
        assert.equal(responseRandomCat.data.cat.dislikes, numberOfDislikes, 'Количество лайков не соответствует');
        console.log(`Теперь у кота ${numberOfDislikes} дизлайк(ов)`);
    });

});
