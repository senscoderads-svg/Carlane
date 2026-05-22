const borboleta = document.getElementById('borboleta');

document.addEventListener('mousemove', (e) => {
    // Move a borboleta exatamente para as coordenadas do cursor
    borboleta.style.left = e.clientX + 'px';
    borboleta.style.top = e.clientY + 'px';
});
