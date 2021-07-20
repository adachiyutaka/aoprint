import CreateController from './create-controller';

const zoom = () => {
  const number = document.getElementById('zoom_number');
  const range = document.getElementById('zoom_range');

  range.addEventListener('input', (e) => {
    number.value = range.value;
    CreateController.setZoom(range.value);
  });

  number.addEventListener('input', (e) => {
    range.value = number.value;
    CreateController.setZoom(number.value);
  });
}

window.addEventListener('load', zoom);