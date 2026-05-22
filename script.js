const borboletas = [];
const htmlBorboleta = `
    <div class="asa esquerda"></div>
    <div class="corpo-central"></div>
    <div class="asa direita"></div>
`;

const raioCirculo = 160; 
const elementoFlor = document.getElementById('flor');

let anguloTotalPercorrido = 0;
const velocidadeVoo = 0.025;

// Inicializa as duas borboletas principais em posições opostas
for (let i = 0; i < 2; i++) {
    const el = document.createElement('div');
    el.className = 'container-borboleta';
    el.innerHTML = htmlBorboleta;
    document.body.appendChild(el);

    borboletas.push({
        elemento: el,
        angulo: i * Math.PI, 
        velocidade: velocidadeVoo, 
        tamanhoBase: 0.75 + (i * 0.1) 
    });
}

// Cria o rastro de glitter brilhante
function criarGlitter(x, y) {
    const p = document.createElement('div');
    p.className = 'particula';
    
    const cores = ['#00e5ff', '#ff4081', '#e040fb', '#ffffff'];
    p.style.backgroundColor = cores[Math.floor(Math.random() * cores.length)];
    
    const varX = (Math.random() * 20 - 10);
    const varY = (Math.random() * 20 - 10);
    p.style.left = (x + varX) + 'px';
    p.style.top = (y + varY) + 'px';
    
    const tam = (2 + Math.random() * 6) + 'px';
    p.style.width = tam;
    p.style.height = tam;
    
    p.style.boxShadow = `0 0 8px ${p.style.backgroundColor}`;

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
}

// Loop principal que roda a animação
function orbitar() {
    const cX = window.innerWidth / 2;
    const cY = window.innerHeight / 2;

    anguloTotalPercorrido += velocidadeVoo;
    const voltasCompletas = anguloTotalPercorrido / (2 * Math.PI);

    // Faz a flor crescer de tamanho com base no total de voltas
    const escalaFlor = Math.min(voltasCompletas * 0.3, 1.8);
    if (elementoFlor) {
        elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaFlor})`;
    }

    const crescimentoBorboleta = voltasCompletas * 0.1;

    borboletas.forEach(b => {
        b.angulo += b.velocidade;

        const x = cX + Math.cos(b.angulo) * raioCirculo;
        const y = cY + Math.sin(b.angulo) * raioCirculo;

        b.elemento.style.left = x + 'px';
        b.elemento.style.top = y + 'px';

        const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
        const tamanhoAtual = b.tamanhoBase + crescimentoBorboleta;

        b.elemento.style.transform = `translate(-50%, -50%) scale(${tamanhoAtual}) rotate(${anguloRotacao}deg)`;

        criarGlitter(x, y);
    });

    requestAnimationFrame(orbitar);
}

// Inicializa a órbita das borboletas
orbitar();

// Controle da Playlist de Músicas
document.addEventListener("DOMContentLoaded", () => {
    const faixas = [
        { botao: document.getElementById("play_revolutionary"), audio: document.getElementById("musicaRevolutionary"), nome: "REVOLUTIONARY" },
        { botao: document.getElementById("play_amen"), audio: document.getElementById("musicaAmen"), nome: "AMEN" },
        { botao: document.getElementById("play_jesus"), audio: document.getElementById("musicaJesus"), nome:"JESUS"}
    ];

    function pararTodas(excetoAudio = null) {
        faixas.forEach(faixa => {
            if (faixa.audio !== excetoAudio && faixa.audio) {
                faixa.audio.pause();
                faixa.audio.currentTime = 0;
                if (faixa.botao) faixa.botao.innerText = `OUVIR ${faixa.nome}`;
            }
        });
    }

    faixas.forEach(faixa => {
        if (faixa.botao && faixa.audio) {
            faixa.botao.addEventListener("click", () => {
                if (faixa.audio.paused) {
                    pararTodas(faixa.audio);
                    faixa.audio.play().catch(err => console.log("Erro ao reproduzir:", err));
                    faixa.botao.innerText = `PAUSAR ${faixa.nome}`;
                } else {
                    faixa.audio.pause();
                    faixa.botao.innerText = `OUVIR ${faixa.nome}`;
                }
            });
        }
    });

    // Tenta tocar a primeira faixa de forma automática
    if (faixas[0] && faixas[0].audio) {
        faixas[0].audio.play().then(() => {
            if (faixas[0].botao) faixas[0].botao.innerText = `PAUSAR ${faixas[0].nome}`;
        }).catch(() => {
            document.addEventListener("click", () => {
                if (faixas[0].audio.paused && faixas[1].audio.paused) {
                    faixas[0].audio.play();
                    if (faixas[0].botao) faixas[0].botao.innerText = `PAUSAR ${faixas[0].nome}`;
                }
            }, { once: true });
        });
    }
});
