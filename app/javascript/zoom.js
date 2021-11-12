import createController from './createController';

const zoom = () => {
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

window.addEventListener('load', zoom);