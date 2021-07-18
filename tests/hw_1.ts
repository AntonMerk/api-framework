import { assert } from 'chai';
import CoreApi from '../src/http/CoreApi';
import { allure } from 'allure-mocha/runtime';
import Steps from '../src/steps/Steps';

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;
let randomId;

describe('Найти случайного кота, удалить, проверить что удален', async () => {
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

  it('2. Удаление кота (allure2)', async () => {
      //Удаление кота
      const responseDeleteCat = await CoreApi.removeCat(randomId)

      //Добавление информации об удаленном коте в отчет
      allure.logStep(`Выполнен запрос DELETE /remove c параметром ${randomId}`);
      allure.testAttachment(
          'Информация об удаленном коте (json)',
          JSON.stringify(responseDeleteCat.data, null, 2),
          'application/json'
        );

      //Проверка статус кода (сервер ответил что кот удален)
      assert.equal(responseDeleteCat.status, 200, 'Статус не соответствует');
  });

  it('3. Проверка что кот удален (allure3)', async () => {
      //Пробуем удалить ранее удаленного кота
      const responseDeleteCat = await CoreApi.removeCat(randomId);
      allure.logStep(`Выполнен повторный запрос DELETE /remove c параметром ${randomId}`);

      //Проверка что кот удален (не найден в БД)
      assert.equal(responseDeleteCat.statusText, 'Not Found', 'Статус не соответствует');
  });


});
