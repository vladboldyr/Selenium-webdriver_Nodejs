import webdriver = require('selenium-webdriver');
const path = require('chromedriver').path;// путь до скаченого chromedriver.exe через npm,его будет запускать селениум
import WebElement = webdriver.WebElement;
const By = webdriver.By,
      until = webdriver.until;
//import NoSuchElementError = require('selenium-webdriver/lib/error');
//const noSuchElementError = new NoSuchElementError();
import * as error from 'selenium-webdriver/lib/error';
const noSuchElementError = new error.NoSuchElementError();

/**
 * Это массив методов для поиска элементов в дом-дереве
 */
const captureMethods: Array<(key:string) => webdriver.By> = [By.id,By.css,By.className,By.linkText,By.xpath,By.tagName,By.name,By.partialLinkText];

export class ScadaWebDriver implements IWebDriver {
  
  public driver: webdriver.WebDriver;
  constructor(scadaBuilder: webdriver.Builder){
    this.driver = scadaBuilder.build();
  }
  async findElementWaitPredicateNoTimer(key: string, waitPredicate: (webElement: webdriver.WebElement) => boolean | Promise<boolean>)
        :Promise<webdriver.WebElement>
  {
  let webElement:webdriver.WebElement = null;
  await this.driver.wait(async (driver) =>{
    for (let index = 0; index < captureMethods.length; index++) {
      const methodDescriptor = captureMethods[index];
      try{
        webElement = await driver.findElement(methodDescriptor(key));
        break;
      }catch(noSuchElementError) {
        if ( index == captureMethods.length - 1) {
          throw 'no such element error';
        }
      }
    }
    return await waitPredicate(webElement);
  });
  return webElement;
  }

  async findElementsWaitPredicateNoTimer(key: string, waitPredicate: (webElements: webdriver.WebElement[]) => boolean | Promise<boolean>)
    :Promise<webdriver.WebElement[]>
  {
   let webElements:webdriver.WebElement[] = null;
   await this.driver.wait(async (driver) => {
    for (let index = 0; index < captureMethods.length; index++) {
      const methodDescriptor = captureMethods[index];
      try{
        webElements = await driver.findElements(methodDescriptor(key));
        break;
      }catch(noSuchElementError) {
        if ( index == captureMethods.length - 1) {
          throw 'no such element error';
        }
      }
    }
    return await waitPredicate(webElements);
   });
   return webElements;
  }

  async findElementInContainerWaitPredicate(container: webdriver.WebElement, key: string, timeout: number,
    waitPredicate:((webElement: webdriver.WebElement) => boolean | Promise<boolean>) = this.defaultWaitPredicate):
    Promise<webdriver.WebElement>
    {
      let webElement:webdriver.WebElement = null;
      await this.driver.wait(async _ =>{
        for (let index = 0; index < captureMethods.length; index++) {
          const methodDescriptor = captureMethods[index];
          try{
            webElement = await container.findElement(methodDescriptor(key));
            break;
          }catch(noSuchElementError) {
            if ( index == captureMethods.length - 1) {
              return false;
            }
          }
        }
        return await waitPredicate(webElement);
      },timeout,`no such element error for element ${key}`).catch(err => console.log(err));
      return webElement;
    }
  
  async findElemenstInContainerWaitPredicate(container: webdriver.WebElement, key: string, timeout: number,
    waitPredicate:((webElements: webdriver.WebElement[]) => boolean | Promise<boolean>) = this.defaultWaitPredicates):
    Promise<webdriver.WebElement[]>
    {
     let webElements:webdriver.WebElement[] = null;
     await this.driver.wait(async _ =>{
       for (let index = 0; index < captureMethods.length; index++) {
         const methodDescriptor = captureMethods[index];
         try{
           webElements = await container.findElements(methodDescriptor(key));
           //findElements не выбрасывает исключение
           if (webElements.length < 1) throw '';
           break;
         }catch(noSuchElementError) {
           if ( index == captureMethods.length - 1) {
            return false;
           }
         }
       }
       return await waitPredicate(webElements);
     },timeout,`no such element error for element ${key}`).catch(err => console.log(err));
     return webElements;
    }
  
  
  async findElementInContainer(container: webdriver.WebElement, key: string, timeout: number = 30000): Promise<webdriver.WebElement> {
    let webElement:webdriver.WebElement = null;
    await this.driver.wait(async _ =>{
      for (let index = 0; index < captureMethods.length; index++) {
        const methodDescriptor = captureMethods[index];
        try{
          webElement = await container.findElement(methodDescriptor(key));
          break;
        }catch(noSuchElementError) {
          if ( index == captureMethods.length - 1) {
            return false;
            //throw `no such element error for element ${key}`;
          }
        }
      }
      return await this.defaultWaitPredicate(webElement);
    },timeout,`no such element error for element ${key}`).catch(err => console.log(err));
    return webElement;
  }

  async findElementsInContainer(container: webdriver.WebElement, key: string, timeout: number = 30000): Promise<webdriver.WebElement[]> {
    let webElements:webdriver.WebElement[] = null;
    await this.driver.wait(async _ =>{
      for (let index = 0; index < captureMethods.length; index++) {
        const methodDescriptor = captureMethods[index];
        try{
          webElements = await container.findElements(methodDescriptor(key));
          //findElements не выбрасывает исключение
          if (webElements.length < 1) throw '';
          break;
        }catch(noSuchElementError) {
          if ( index == captureMethods.length - 1) {
           return false;
          }
        }
      }
      return await this.defaultWaitPredicates(webElements);
    },timeout,`no such element error for element ${key}`).catch(err => console.log(err));;
    return webElements;
  }

  async findElement(key:string,timeout:number = 30000):Promise<WebElement> {
    let webElement:webdriver.WebElement = null;
  
    await this.driver.wait(async (driver) => {
      for (let index = 0; index < captureMethods.length; index++) {
        const methodDescriptor = captureMethods[index];
        try{
          webElement = await driver.findElement(methodDescriptor(key));
          break;
        }catch(noSuchElementError) {
          if ( index == captureMethods.length - 1) {
            return false;
            //throw `no such element error for element ${key}`;
          }
        }
      }
      return await this.defaultWaitPredicate(webElement);
    },timeout,`no such element error for element ${key}`).catch(err => console.log(err));
    return webElement;
  }

  async findElements(key:string,timeout:number = 30000):Promise<WebElement[]> {
    let webElements:webdriver.WebElement[] = null;
    await this.driver.wait(async (driver) =>{
      for (let index = 0; index < captureMethods.length; index++) {
        const methodDescriptor = captureMethods[index];
        try{
          webElements = await driver.findElements(methodDescriptor(key));
          //findElements не выбрасывает исключением
          if (webElements.length < 1) throw '';
          break;
        }catch(noSuchElementError) {
          if ( index == captureMethods.length - 1) {
            return false;
          }
        }
      }
      return await this.defaultWaitPredicates(webElements);
    },timeout,`no such element error for element ${key}`).catch(err => console.log(err));
    return webElements;
  }

  async findElementWaitPredicate(key:string,timeout:number = 30000,
        waitPredicate:((webElement: webdriver.WebElement) => boolean | Promise<boolean>) = this.defaultWaitPredicate )
        :Promise<WebElement>
        {
          let webElement:webdriver.WebElement = null;
          await this.driver.wait(async (driver) =>{
            for (let index = 0; index < captureMethods.length; index++) {
              const methodDescriptor = captureMethods[index];
              try{
                webElement = await driver.findElement(methodDescriptor(key));
                break;
              }catch(noSuchElementError) {
                if ( index == captureMethods.length - 1) {
                  return false;
                }
              }
            }
            return await waitPredicate(webElement);
          },timeout,`no such element error for element ${key}`).catch(err => console.log(err));
          return webElement;
        }

  async findElementsWaitPredicate(key:string,timeout:number = 30000,
    waitPredicate:((webElements: webdriver.WebElement[]) => boolean | Promise<boolean>) = this.defaultWaitPredicates )
    :Promise<WebElement[]>
    {
      let webElements:webdriver.WebElement[] = null;
      await this.driver.wait(async (driver) =>{
        for (let index = 0; index < captureMethods.length; index++) {
          const methodDescriptor = captureMethods[index];
          try{
            webElements = await driver.findElements(methodDescriptor(key));
            //findElements не выбрасывает исключение
            if (webElements.length < 1) throw '';
            break;
          }catch(noSuchElementError) {
            if ( index == captureMethods.length - 1) {
              return false;
            }
          }
        }
        return await waitPredicate(webElements);
      },timeout,`no such element error for element ${key}`).catch(err => console.log(err));
      return webElements;
    }

  private defaultWaitPredicate = async (element:webdriver.WebElement):Promise<boolean> => await (element.isEnabled() && element.isDisplayed());
  private defaultWaitPredicates = async (elements:webdriver.WebElement[]):Promise<boolean> => {
    for(const element of elements) {
      if (await !(element.isEnabled() && element.isDisplayed())) return false;
    }
    return true;
  }
}

export interface IWebDriver {
  findElement(key:string,timeout:number):Promise<WebElement>;
  findElementWaitPredicate(key:string,timeout:number,
    waitPredicate: ((webElement: webdriver.WebElement) => boolean | Promise<boolean>)):Promise<WebElement>;
  findElementWaitPredicateNoTimer(key:string, 
    waitPredicate: ((webElement: webdriver.WebElement) => boolean | Promise<boolean>)):Promise<WebElement>;

  findElements(key:string,timeout:number):Promise<WebElement[]>;
  findElementsWaitPredicate(key:string,timeout:number,
    waitPredicate: ((webElements: webdriver.WebElement[]) => boolean | Promise<boolean>)):Promise<WebElement[]>;
  findElementsWaitPredicateNoTimer(key:string,
    waitPredicate: ((webElements: webdriver.WebElement[]) => boolean | Promise<boolean>)):Promise<WebElement[]>;

  findElementInContainer(container:WebElement,key:string,timeout:number):Promise<WebElement>;
  findElementsInContainer(container:WebElement,key:string,timeout:number):Promise<WebElement[]>;
  findElementInContainerWaitPredicate(container:WebElement,key:string,timeout:number,
    waitPredicate: ((webElement: webdriver.WebElement) => boolean | Promise<boolean>)):Promise<WebElement>;
  findElemenstInContainerWaitPredicate(container:WebElement,key:string,timeout:number,
    waitPredicate: ((webElement: webdriver.WebElement[]) => boolean | Promise<boolean>)):Promise<WebElement[]>;
}

module.exports = { ScadaWebDriver}