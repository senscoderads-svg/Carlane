const borboletas = [];
const htmlBorboleta = `
    <div class="asa esquerda"></div>
    <div class="corpo-central"></div>
    <div class="asa direita"></div>
`;

const raioCirculoBase = 160; 
const elementoFlor = document.getElementById('flor');

let anguloTotalPercorrido = 0;
const velocidadeVoo = 0.025;

// Estados da introdução: 'mao_descendo', 'mao_semeando', 'borboletas_surgindo', 'orbita_normal'
let faseAnimacao = 'mao_descendo'; 
let tempoFase = 0;

// Paletas de cores mágicas dinâmicas para cada música
const paletasCores = {
    JESUS: ['#ffffff', '#ffeb3b', '#ff9800', '#ff5722'],          // Dourado/Fogo Sagrado
    REVOLUTIONARY: ['#ff4081', '#e040fb', '#9c27b0', '#ffffff'],  // Neon/Púrpura Vibrante
    AMEN: ['#00e5ff', '#009688', '#2196f3', '#ffffff']           // Azul Celestial/Aqua
};

// Cores ativas no momento (Inicia com as cores da primeira música: JESUS)
let coresAtivas = paletasCores.JESUS;

// Posição da mão mágica
let maoX = window.innerWidth / 2;
let maoY = -50; 

// Cria o rastro de glitter brilhante
function criarGlitter(x, y, quantidade = 1) {
    for (let i = 0; i < quantidade; i++) {
        const p = document.createElement('div');
        p.className = 'particula';
        
        // Usa as cores da música que está ativa no momento
        p.style.backgroundColor = coresAtives[Math.floor(Math.random() * coresAtivas.length)];
        
        const varX = (Math.random() * 30 - 15);
        const varY = (Math.random() * 30 - 15);
        p.style.left = (x + varX) + 'px';
        p.style.top = (y + varY) + 'px';
        
        const tam = (2 + Math.random() * 7) + 'px';
        p.style.width = tam;
        p.style.height = tam;
        
        p.style.boxShadow = `0 0 10px ${p.style.backgroundColor}`;

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1000);
    }
}

// Inicializa as duas borboletas
function inicializarBorboletas() {
    if (borboletas.length > 0) return; // Evita duplicar se redefinido
    for (let i = 0; i < 2; i++) {
        const el = document.createElement('div');
        el.className = 'container-borboleta';
        el.innerHTML = htmlBorboleta;
        el.style.opacity = '0';
        document.body.appendChild(el);

        borboletas.push({
            elemento: el,
            angulo: i * Math.PI, 
            velocidade: velocidadeVoo, 
            tamanhoBase: 0.75 + (i * 0.1),
            xAtual: i === 0 ? -100 : window.innerWidth + 100, 
            yAtual: window.innerHeight / 2
        });
    }
}

// Loop principal que gerencia a linha do tempo do site
function gerenciarCenario() {
    const cX = window.innerWidth / 2;
    const cY = window.innerHeight / 2;
    tempoFase++;

    if (faseAnimacao === 'mao_descendo') {
        maoY += (cY - maoY) * 0.05;
        criarGlitter(maoX, maoY, 3);

        if (Math.abs(maoY - cY) < 5) {
            faseAnimacao = 'mao_semeando';
            tempoFase = 0;
        }
    }
    
    else if (faseAnimacao === 'mao_semeando') {
        const raioSemeadura = 30;
        const sX = cX + Math.cos(tempoFase * 0.2) * raioSemeadura;
        const sY = cY + Math.sin(tempoFase * 0.2) * raioSemeadura;
        criarGlitter(sX, sY, 5);

        if (tempoFase > 80) { 
            faseAnimacao = 'borboletas_surgindo';
            inicializarBorboletas();
            tempoFase = 0;
        }
    }
    
    else if (faseAnimacao === 'borboletas_surgindo') {
        let chegaramNoDestino = true;

        borboletas.forEach(b => {
            b.elemento.style.opacity = '1';
            
            const destinoX = cX + Math.cos(b.angulo) * raioCirculoBase;
            const destinoY = cY + Math.sin(b.angulo) * raioCirculoBase;

            b.xAtual += (destinoX - b.xAtual) * 0.05;
            b.yAtual += (destinoY - b.yAtual) * 0.05;

            b.elemento.style.left = b.xAtual + 'px';
            b.elemento.style.top = b.yAtual + 'px';

            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            b.elemento.style.transform = `translate(-50%, -50%) scale(${b.tamanhoBase * 0.5}) rotate(${anguloRotacao}deg)`;

            criarGlitter(b.xAtual, b.yAtual, 1);

            if (Math.abs(b.xAtual - destinoX) > 8) chegaramNoDestino = false;
        });

        if (chegaramNoDestino) {
            faseAnimacao = 'orbita_normal';
        }
    }
    
    else if (faseAnimacao === 'orbita_normal') {
        anguloTotalPercorrido += velocidadeVoo;
        const voltasCompletas = anguloTotalPercorrido / (2 * Math.PI);

        let escalaAtual = 0;
        if (voltasCompletas >= 1) {
            const progressoCrescimento = (voltasCompletas - 1) * 0.3;
            escalaAtual = Math.min(progressoCrescimento, 1.8);
            escalaAtual = Math.max(escalaAtual, 0.1); 
        }

        if (elementoFlor) {
            elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaAtual})`;
        }

        const fatorEscalaCirculo = escalaAtual > 0 ? escalaAtual : 1;
        const raioCirculoAtual = raioCirculoBase * (fatorEscalaCirculo * 0.8 + 0.2);

        borboletas.forEach(b => {
            b.angulo += b.velocidade;

            const x = cX + Math.cos(b.angulo) * raioCirculoAtual;
            const y = cY + Math.sin(b.angulo) * raioCirculoAtual;

            b.elemento.style.left = x + 'px';
            b.elemento.style.top = y + 'px';

            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            
            const fatorEscalaBorboleta = escalaAtual > 0 ? escalaAtual : 1;
            const tamanhoBorboletaAtual = b.tamanhoBase * (fatorEscalaBorboleta * 0.6 + 0.4);

            b.elemento.style.transform = `translate(-50%, -50%) scale(${tamanhoBorboletaAtual}) rotate(${anguloRotacao}deg)`;

            criarGlitter(x, y, 1);
        });
    }

    requestAnimationFrame(gerenciarCenario);
}

// Inicia o fluxo de animações
gerenciarCenario();

// Controle da Playlist Inteligente de Músicas
document.addEventListener("DOMContentLoaded", () => {
    const faixas = [
        { botao: document.getElementById("play_jesus"), audio: document.getElementById("musicaJesus"), nome: "JESUS" },
        { botao: document.getElementById("play_revolutionary"), audio: document.getElementById("musicaRevolutionary"), nome: "REVOLUTIONARY" },
        { botao: document.getElementById("play_amen"), audio: document.getElementById("musicaAmen"), nome: "AMEN" }
    ];

    let indiceAtivo = 0;

    // Atualiza o tema visual de acordo com a música tocando
    function atualizarTemaVisual(nomeMusica) {
        coresAtivas = paletasCores[nomeMusica] || paletasCores.JESUS;
        
        // Remove classes de tema anteriores e adiciona a nova ao body
        document.body.className = '';
        document.body.classList.add(`tema-${nomeMusica.toLowerCase()}`);
    }

    function pararTodas(excetoAudio = null) {
        faixas.forEach(faixa => {
            if (faixa.audio !== excetoAudio && faixa.audio) {
                faixa.audio.pause();
                faixa.audio.currentTime = 0;
                if (faixa.botao) faixa.botao.innerText = `OUVIR ${faixa.nome}`;
            }
        });
    }

    function tocarFaixa(indice) {
        if (indice >= faixas.length) indice = 0; // Volta para o início se acabar a playlist
        indiceAtivo = indice;
        
        const faixa = faixas[indiceAtivo];
        if (faixa && faixa.audio) {
            pararTodas(faixa.audio);
            faixa.audio.play()
                .then(() => {
                    if (faixa.botao) faixa.botao.innerText = `PAUSAR ${faixa.nome}`;
                    atualizarTemaVisual(faixa.nome);
                })
                .catch(err => console.log("Abafado pelo navegador:", err));
        }
    }

    // Configura os cliques manuais nos botões
    faixas.forEach((faixa, indice) => {
        if (faixa.botao && faixa.audio) {
            faixa.botao.addEventListener("click", () => {
                if (faixa.audio.paused) {
                    tocarFaixa(indice);
                } else {
                    faixa.audio.pause();
                    faixa.botao.innerText = `OUVIR ${faixa.nome}`;
                }
            });

            // LOGICA DE REPRODUÇÃO AUTOMÁTICA: Quando a música termina, pula para a próxima faixa
            faixa.audio.addEventListener("ended", () => {
                tocarFaixa(indiceAtivo + 1);
            });
        }
    });

    // Tenta autoplay da primeira faixa (JESUS) ao carregar
    const primeiraFaixa = faixas[0];
    if (primeiraFaixa && primeiraFaixa.audio) {
        primeiraFaixa.audio.play()
            .then(() => {
                if (primeiraFaixa.botao) primeiraFaixa.botao.innerText = `PAUSAR ${primeiraFaixa.nome}`;
                atualizarTemaVisual(primeiraFaixa.nome);
            })
            .catch(() => {
                // Se o navegador bloquear, aguarda o primeiro clique do usuário
                const iniciarNoClique = () => {
                    tocarFaixa(0);
                    document.removeEventListener("click", iniciarNoClique);
                };
                document.addEventListener("click", iniciarNoClique);
            });
    }
});
