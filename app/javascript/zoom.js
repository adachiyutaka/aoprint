const zoom = () => {
  const number = document.getElementById('zoom_number');
  const range = document.getElementById('zoom_range');
  
  range.addEventListener('input', (e) => {
    number.value = range.value;
    console.log(`range value: ${range.vale}`);
  });

  number.addEventListener('input', (e) => {
    range.value = number.value;

    console.log(`number value: ${number.vale}`);
  });
  console.log("here");
}

window.addEventListener('load', zoom);