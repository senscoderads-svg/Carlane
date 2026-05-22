const borboleta = document.getElementById('borboleta');

document.addEventListener('mousemove', (e) => {
    // Atualiza a posição baseada no mouse
    borboleta.style.left = e.clientX + 'px';
    borboleta.style.top = e.clientY + 'px';
});
