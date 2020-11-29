import go = require('goJS');
import assert = require('assert');
import webdriver = require('selenium-webdriver');
import WebElement = webdriver.WebElement;
import {ScadaWebDriver} from './testEngine/testEngine';//= require('./testEngine/testEngine');
import * as goJS from './methodsGoJS/methodsForGoJS';
const path = require('chromedriver').path;// путь до скаченого chromedriver.exe через npm,его будет запускать селениум
const LocalStorage = require('node-localstorage').LocalStorage;//пакет для работы с localStorage
const localStorage = new LocalStorage('./scratch');


const url: string = 'http://opo-scada-v3.zav.mir';
const login: string = 'miradmin';
const password: string = 'mirpass';
const nameDiagramScheme: string = '.myDiagramDiv';//это className в div, который содержит диаграмму
let scada:ScadaWebDriver = null;

async function Authorization() {
  localStorage.clear();
  const auto: WebElement = await scada.findElement('login-form-centered');
  const inputs: WebElement[] = await scada.findElementsInContainer(auto,'input-group mb-3');
  let input: WebElement = await scada.findElementInContainer(inputs[0],'input');// input for Login
  await input.sendKeys(login);

  input = await scada.findElementInContainer(inputs[1],'input');// input for Password
  await input.click();
  await input.sendKeys(password);

  const btnSign: WebElement = await scada.findElement('btn-login');
  await btnSign.click();
}

describe("Scada3Tests",function() {
  /**
   * Убираем ограничение времени выполнения у тестов
   */
  this.timeout(0);
  /**
   * Здесь происходит инициализация драйвера,создание экзмепляра класса ScadaWebDriver и авторизация в Скаде
   */
  before("Create driver", async function() {
    const build = new webdriver.Builder().forBrowser('chrome');
    scada = new ScadaWebDriver(build);
    await scada.driver.get(url);
    await scada.driver.manage().window().maximize();
    await Authorization();
  })
  /**
   * Происходит открытие меню для каждого теста,
   * выбор редактора схем и выбор директории с тестовой схемой.
   */
  this.beforeEach("Menu open",async ()=> {
    const element:WebElement = await scada.findElement('mir_burger');
    await element.click();
    //open scheme editor
    const schemeEditorTab: WebElement = await scada.findElement('.fa-pencil');
    await schemeEditorTab.click();

    await (await scada.findElement('fa-folder')).click();
    const schemeEditorTabAutoTestScheme: WebElement = await scada.findElement("//span[contains(.,'autotest')]");
    await scada.driver.actions().doubleClick(schemeEditorTabAutoTestScheme).perform();
  })
  /**
   * Каждый новый тест должен начинаться с такой конструкции,функция должна быть асинхронной
   */
	it("Test01CheckNodeIsSelected", async function () {
    const elements:Array<go.ObjectData> = await scada.driver.executeScript(goJS.getNodeDataArray,nameDiagramScheme);

    const elementTest:go.ObjectData = elements.find(e => e.name === 'test');
    const nodeIsSelected:boolean = await scada.driver.executeScript(goJS.getStateSelectedNode,nameDiagramScheme,elementTest.key);
    assert.strictEqual(nodeIsSelected,true);
  });

  it("Test02CheckIsVisibleRotate",async function(){
    const elements:Array<go.ObjectData> = await scada.driver.executeScript(goJS.getNodeDataArray,nameDiagramScheme);

    const elementTest:go.ObjectData = elements.find(e => e.name === 'test');
    const isVisibleRotate:boolean = await scada.driver.executeScript(goJS.isHaveRotate,nameDiagramScheme,elementTest.key);
    assert.strictEqual(isVisibleRotate,true);
  });
  it("Test03CheckIsVisiblePort",async function(){

    await (await scada.findElement('fa-draw-circle')).click();
    const elements:Array<go.ObjectData> = await scada.driver.executeScript(goJS.getNodeDataArray,nameDiagramScheme);

    const elementTest:go.ObjectData = elements.find(e => e.name === 'test');
    const isVisiblePort = await scada.driver.executeScript(goJS.chechAllIsVisiblePorts,nameDiagramScheme,elementTest.key);
    assert.strictEqual(isVisiblePort,true);
  });

  it("Test04CheckToIncrementScale",async function(){
    const expandWide:WebElement = await scada.findElement('.zoom-text');//кнопка на верхней панели отвечающая за масштаб схемы
    await expandWide.click();

    await (await scada.findElement('.fa-expand-wide')).click();//восстановить масштаб 100%
    const getCurrentScaleScheme:number = await scada.driver.executeScript(goJS.getCurrentScale,nameDiagramScheme);

    /**
     * КОСТЫЛЬ!!! он нужен,потому что после восстановления масштаба
     *  у кнпоки остается какое-то выделенное пространство и силениум туда кликает,и тогда окно не открывается
     */
    await (await scada.findElement('.myDiagramDiv')).click();
    await expandWide.click();
    const btnToIncrementScale:WebElement = await scada.findElement('fa-search-plus');
    await btnToIncrementScale.click();//увеличили масштаб схемы на 5%

    const getChangeScaleScheme:number = await scada.driver.executeScript(goJS.getCurrentScale,nameDiagramScheme);

    assert.strictEqual(getCurrentScaleScheme + 5,getChangeScaleScheme);
  });

  it("Test05CheckToDicrementScale",async function(){
    const expandWide:WebElement = await scada.findElement('.zoom-text');
    await expandWide.click();

    await (await scada.findElement('.fa-expand-wide')).click();
    const getCurrentScaleScheme:number = await scada.driver.executeScript(goJS.getCurrentScale,nameDiagramScheme);

    await (await scada.findElement('myDiagramDiv')).click();
    await expandWide.click();
    const btnToDicrementScale:WebElement = await scada.findElement('fa-search-minus');
    await btnToDicrementScale.click();

    const getChangeScaleScheme:number = await scada.driver.executeScript(goJS.getCurrentScale,nameDiagramScheme);

    assert.strictEqual(getCurrentScaleScheme - 5,getChangeScaleScheme);
  });

  /**
   * После каждого теста закрываем открытую даиграмму
   */
  this.afterEach("Close sheme",async function(){
    const contentDiagramScheme:WebElement = await scada.findElement('diagram-scheme-tabs-container');
    const listOpenSheme:WebElement[] = await scada.findElementsInContainer(contentDiagramScheme,'nav-item');
    const btnCloseSheme:WebElement = await scada.findElementInContainer(listOpenSheme[0],'close');
    await btnCloseSheme.click();
  });

   /**
   * В конце закрываем хром
   */
  after("Close",async function() {
    await scada.driver.quit();
  });
});


