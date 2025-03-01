const rotateButton = document.getElementById('rotateButton');
const box = document.getElementById('box');

rotateButton.addEventListener('click', () => {
    box.classList.toggle('rotated'); // Переключаем класс для поворота
});
