import go = require('gojs');
/**
 * эти объекты нужно просто занулить,т.к nodejs не имеет доступ к вебу нормального,
 * они будут в вебе самы инициализированы
 */
let document = null;
let window = null;

/**
 * Получаем текущий масштаб
 * @param element это div который содержит диаграмму саму
 */
export const getCurrentScale = (element) => {
  const myDiagram = go.Diagram.fromDiv(document.querySelector(element));
  return +(myDiagram.scale*100).toFixed(0);
}
/**
 * 
 * @param element это div который содержит диаграмму саму
 */
export const getNodeDataArray = (element) => {
  const myDiagram = go.Diagram.fromDiv(document.querySelector(element));
  return myDiagram.model.nodeDataArray;
}
/**
 * 
 * @param element это div который содержит диаграмму саму
 * @param key ключ ноды с которой работаем
 */
export const getStateSelectedNode = (element,key) => {
  const myDiagram = go.Diagram.fromDiv(document.querySelector(element));
  const node = myDiagram.findNodeForKey(key);
  myDiagram.select(node); 
  return node.isSelected;
}
/**
 * 
 * @param element это div который содержит диаграмму саму
 * @param key ключ ноды с которой работаем
 */
export const isHaveRotate = async (element,key) => {
  function isRotate(){
    const promise = new Promise(function(resolve, reject) {
      window.setTimeout(()=> resolve(node.findAdornment('Rotating') !== null ? true : false));
    });
    return promise;
  }
  const myDiagram = go.Diagram.fromDiv(document.querySelector(element));
  var node = myDiagram.findNodeForKey(key);
  myDiagram.select(node);
  return await isRotate();
}

export const chechAllIsVisiblePorts = async (element,key) => {
  var panel = null;
  const myDiagram = go.Diagram.fromDiv(document.querySelector(element));
  var node = myDiagram.findNodeForKey(key);
  panel = node.findObject('PANEL');
  if (panel === null) return false;
  var it = panel.elements.filter(e=> e.name === 'port');
  if (it.count === 1) return it.first().fill === 'white';

  while(it.next()){
    if(it.value.fill !== 'white') {
      return false;
    }
  }
  return true;
}

//module.exports = {getDiagram, getCurrentScale, isHaveRotate, getStateSelectedNode, getNodeDataArray, chechAllIsVisiblePorts }