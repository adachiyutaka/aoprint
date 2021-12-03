import createController from './createController';

const info = () => {
  let image = document.querySelector('.selected');
  let gameObject = createController.gameObjects[image.dataset.gameObjectId];
  let position = gameObject.position;
  let value = e.currentTarget.value;
  
  switch(e.currentTarget.id){
    case 'x':
      gameObject.position.x = value;
      
      // image.style.left = position.previewSize('x').toString() + 'px';
      image.style.left = position.x.toString() + 'px';
      break
    case 'y':
      gameObject.position.y = value;
      // image.style.top = position.previewSize('y').toString() + 'px';
      image.style.top = position.y.toString() + 'px';
      break
    case 'width':
      gameObject.position.width = value;
      // image.style.width = position.previewSize('width').toString() + 'px';
      image.style.width = position.width.toString() + 'px';
      break
    case 'height':
      gameObject.position.height = value;
      // image.style.height = position.previewSize('height').toString() + 'px';
      image.style.height = position.height.toString() + 'px';
      break
    case 'role_select':
      gameObject.script = value;
      break
  }



  const number = document.getElementById('zoom_number');
  const range = document.getElementById('zoom_range');

  createController.setZoom(range.value);
  createController.setZoom(number.value);

  range.addEventListener('input', (e) => {
    console.log(createController);
    number.value = range.value;
    createController.setZoom(range.value);
  });

  number.addEventListener('input', (e) => {
    range.value = number.value;
    createController.setZoom(number.value);
  });
}

window.addEventListener('load', info);