import CreateController from './create-controller';

const zoom = () => {
  const number = document.getElementById('zoom_number');
  const range = document.getElementById('zoom_range');
  const create_controller = new CreateController();

  range.addEventListener('input', (e) => {
    number.value = range.value;
    create_controller.setZoom(range.value);
  });

  number.addEventListener('input', (e) => {
    range.value = number.value;
    create_controller.setZoom(number.value);
  });
}

window.addEventListener('load', zoom);