# NodejsScada3Tests

# Для начало работы нужно запустить команду
npm istall
которая установит все пакеты npm из package.json

# Для скачивания chromedriver.exe через зеркало, используется локальный .npmrc с подходящими настройками
# чтобы его поставить локально на машину,нужно ввести команду npm config edit в cmd и удалить запись registry либо закомментировать(;)
# Команда для установки пакета chromedriver
npm i chromedriver

# Удаление пакета chromedriver
npm uninstall chromedriver

# Обновление пакетов
npm update

# Запуск тестов в терминале
Запускать можно в любом терминале
npm run test - запустит тесты в обычном режиме

npm run debug - запустит тесты в отладчике devTools,чтобы на него перейти,нужно в хроме зайти chrome://inspect/#devices
в Remote target появится ссылка на localhost в котором запустят тесты под отладкой.

# Запуск тестов в Visual Studio Code
Зайти в пункт Run(Ctrl+Shift+D) в меню слева на панели и запустить тесты нажав  на "play".
Если в коде будут поставлены точки останова,то запустятся тесты под отладкой.
Для отладки из VS используется конфигурациооный файл launch.json.

# packge.json
  "test": "mocha -r ts-node/register test.ts --reporter mocha-multi-reporters --reporter-options configFile=config.json"
Здесь аргумент ts-node/register указывает,что мы запускаем тесты с поддержкой typescript,--reporter mocha-multi-reporters --reporter-options -они указывают,как будет выводиться информация по тестам,в данном случае информация выводится в консоль и файл .xml,
в config.json указаны настройки,как выводить в консоль и в какой конкретно файл.

  debug": "mocha --inspect-brk -r ts-node/register test.ts",
Аргумент --inspect-brk указывает,что мы будем запускать отладку в отладчике от хрома.

# Tests
краткий туториал по mocha https://newtechhubs.com/typescript-selenium-automation-tutorials-mocha/ ,кроме самой документации по mocha
все тесты должны находиться в describe.
Инициализация тестов начинается в методе before.
Документация по js selenium-webdriver находится по url https://www.selenium.dev/selenium/docs/api/javascript/module/selenium-webdriver
Каждый новый тест должен находиться в кейсе it.

Каждый результат или действие нужно оборачивать в await,т.к селениум возвращает везде объкет Promise,либо взаимодействовать с ним через конструкцию .then(res => ...)

const example = await scada.findElement('foo');
await example.click();
or
scada.findElement('foo').then(res => res.click());

ВАЖНО в js используйте const или let, от var лучше воздержаться!!!
{
  const t:number = 10;
  console.log(t);//ok compile
}
console.log(t)//error

const t = 10;
const p = 2;
t = p + 5;// error;

let t:number = 5;
t = 5 + 2;//ok

const massiv = [1,2];
massiv[0] = 5;//ok

massiv = null;// error

Используя ts мы можем типизировать наши объекты

const example:WebElement = await scada.findElement('foo');

# Работа с testEngine
Каждый новый публичный метод нужно описать в interface IWebDriver, после этого нужно написать реализацию данного метода 
Ключевой разницей между обычным методом поиска элемента в selenium-webdriver и поиском в классе ScadaWebDriver, является то,что он не использует проверку на взаимодействие элемента с пользователем(т.е не проверяет виден или включен ли элемент в дом-дерево)
Также это взаимодействие с таймером на ожидание поиска элемента и прочие.

Для того чтобы найти элемент в дом-дереве,нужно передать только ключ-строка,не указывая способ поиска элемента,ScadaWebDriver сам пройдет по массиву методов и найдет,который подходит.

# Работа с api goJS
Для этого рекомендуется писать методы на js и передовать их в executeScript, он сам их конвертирует и выполнит в браузере,также можно передовать аргументы в эту функцию,они должны быть переданы после функции.

Example

const getNodeDataArray = (element) => {
  const myDiagram = go.Diagram.fromDiv(document.querySelector(element));
  return myDiagram.model.nodeDataArray;
}
const nameDiagramScheme = '.myDiagramDiv';
const elements:Array<go.ObjectData> = await scada.driver.executeScript(getNodeDataArray,nameDiagramScheme);

Все методы для взаимодействия с goJS лучше хранить в одном месте, к примеру в файле methodsForGoJS.ts и экспортировать эти методы.
