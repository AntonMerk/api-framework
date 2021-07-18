import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { allure } from 'allure-mocha/runtime';
import Steps from '../src/steps/Steps';
import LikeApi from "../src/http/LikeApi";

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;
let randomId;
let numberOfLikes;
let n = 3; //Количество лайков, которое надо поставить

describe('TestCase проверка лайков', async () => {
    it('1. Поиск случайного кота (allure1)', async () => {
        //Получение случайного ID
        const responseAllCats = await CoreApi.getAllCats();
        const randomNumberOfGroups = getRandomInt(responseAllCats.data.groups.length);
        const randomNumberOfCats = getRandomInt(responseAllCats.data.groups[randomNumberOfGroups].cats.length);
        randomId = responseAllCats.data.groups[randomNumberOfGroups].cats[randomNumberOfCats].id;

        //Получение случайного кота
        const responseRandomCat = await CoreApi.getCatById(randomId);

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

    it('2. Получение и сохрание количества лайков (allure2)', async () => {
        //Получение кота
        const responseRandomCat = await CoreApi.getCatById(randomId);

        //Сохранение количества лайков
        numberOfLikes = responseRandomCat.data.cat.likes;

        //Вывод информации о количестве лайков в отчет
        allure.logStep(`У кота ${numberOfLikes} лайков`);

        //Проверка статус кода
        assert.equal(responseRandomCat.status, 200, 'Статус не соответствует');
    });

    it('3. Проставление коту лайков (allure3)', async () => {
        //Ставим коту лайки
        for (let i = 0; i < n; i++) {
            const responseLikeCat = await LikeApi.likes(randomId,{like:true, dislike:null});

            //Проверка статус кода (что лайки проставляются)
            assert.equal(responseLikeCat.status, 200, 'Статус не соответствует');
        }

        //Сохраняем сколько теперь должно быть лайков у кота
        numberOfLikes = numberOfLikes + n;

        allure.logStep(`Выполнен запрос POST /likes - ${n} раз(а), коту поставлено ${n} лайка`);

    });

    it('4. Проверить количество лайков кота (allure4)', async () => {
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
        assert.equal(responseRandomCat.data.cat.likes, numberOfLikes, 'Количество лайков не соответствует');
    });

});
