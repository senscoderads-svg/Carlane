const borboletas = [];
const htmlBorboleta = `
    <div class="asa esquerda"></div>
    <div class="corpo-central"></div>
    <div class="asa direita"></div>
`;

const raioCirculoBase = 160; 
const elementoFlor = document.getElementById('flor');

let anguloTotalPercorrido = 0;
// Deixou o voo mais calmo (era 0.025)
const velocidadeVoo = 0.012; 

// Estados da introdução: 'mao_descendo', 'mao_semeando', 'borboletas_surgindo', 'orbita_normal'
let faseAnimacao = 'mao_descendo'; 
let tempoFase = 0;

// Paletas de cores mágicas dinâmicas para cada música
const paletasCores = {
    JESUS: ['#ffffff', '#ffeb3b', '#ff9800', '#ff5722'],          
    REVOLUTIONARY: ['#ff4081', '#e040fb', '#9c27b0', '#ffffff'],  
    AMEN: ['#00e5ff', '#009688', '#2196f3', '#ffffff']           
};

let coresAtivas = paletasCores.JESUS;

// Posição inicial da mão mágica
let maoX = window.innerWidth / 2;
let maoY = -50; 

// Cria o rastro de glitter brilhante
function criarGlitter(x, y, quantidade = 1) {
    for (let i = 0; i < quantidade; i++) {
        const p = document.createElement('div');
        p.className = 'particula';
        
        p.style.backgroundColor = coresAtivas[Math.floor(Math.random() * coresAtivas.length)];
        
        const varX = (Math.random() * 30 - 15);
        const varY = (Math.random() * 30 - 15);
        p.style.left = (x + varX) + 'px';
        p.style.top = (y + varY) + 'px';
        
        const tam = (2 + Math.random() * 6) + 'px';
        p.style.width = tam;
        p.style.height = tam;
        
        p.style.boxShadow = `0 0 10px ${p.style.backgroundColor}`;

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200); // Partículas duram um pouco mais para dar leveza
    }
}

// Inicializa as duas borboletas
function inicializarBorboletas() {
    if (borboletas.length > 0) return; 
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
            xAtual: i === 0 ? -150 : window.innerWidth + 150, // Começam um pouco mais fora da tela
            yAtual: window.innerHeight / 2
        });
    }
}

// Loop principal que gerencia a linha do tempo do site
function gerenciarCenario() {
    const cX = window.innerWidth / 2;
    const cY = window.innerHeight / 2;
    tempoFase++;

    // --- FASE 1: MÃO MÁGICA DESCE DO TOPO SUAVEMENTE ---
    if (faseAnimacao === 'mao_descendo') {
        // Reduzido a velocidade de aproximação para ser mais sutil (era 0.05)
        maoY += (cY - maoY) * 0.02; 
        criarGlitter(maoX, maoY, 2);

        if (Math.abs(maoY - cY) < 8) {
            faseAnimacao = 'mao_semeando';
            tempoFase = 0;
        }
    }
    
    // --- FASE 2: MÃO SEMEIA NO CENTRO DE FORMA CALMA ---
    else if (faseAnimacao === 'mao_semeando') {
        const raioSemeadura = 40;
        // Movimento circular bem mais lento (era 0.2)
        const sX = cX + Math.cos(tempoFase * 0.08) * raioSemeadura;
        const sY = cY + Math.sin(tempoFase * 0.08) * raioSemeadura;
        criarGlitter(sX, sY, 3);

        if (tempoFase > 140) { // Aumentado o tempo semeando para ser gradual
            faseAnimacao = 'borboletas_surgindo';
            inicializarBorboletas();
            tempoFase = 0;
        }
    }
    
    // --- FASE 3: BORBOLETAS ENTRAN NA ÓRBITA SUAVEMENTE ---
    else if (faseAnimacao === 'borboletas_surgindo') {
        let chegaramNoDestino = true;

        borboletas.forEach(b => {
            b.elemento.style.opacity = '1';
            
            const destinoX = cX + Math.cos(b.angulo) * raioCirculoBase;
            const destinoY = cY + Math.sin(b.angulo) * raioCirculoBase;

            // Entrada muito mais lenta e suave na órbita (era 0.05)
            b.xAtual += (destinoX - b.xAtual) * 0.02;
            b.yAtual += (destinoY - b.yAtual) * 0.02;

            b.elemento.style.left = b.xAtual + 'px';
            b.elemento.style.top = b.yAtual + 'px';

            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            b.elemento.style.transform = `translate(-50%, -50%) scale(${b.tamanhoBase * 0.6}) rotate(${anguloRotacao}deg)`;

            criarGlitter(b.xAtual, b.yAtual, 1);

            if (Math.abs(b.xAtual - destinoX) > 5) chegaramNoDestino = false;
        });

        if (chegaramNoDestino) {
            faseAnimacao = 'orbita_normal';
        }
    }
    
    // --- FASE 4: ÓRBITA FLUIDA E CRESCIMENTO DELICADO DA FLOR ---
    else if (faseAnimacao === 'orbita_normal') {
        anguloTotalPercorrido += velocidadeVoo;
        const voltasCompletas = anguloTotalPercorrido / (2 * Math.PI);

        let escalaAtual = 0;
        if (voltasCompletas >= 1) {
            // Crescimento da flor estendido e muito mais lento (era 0.3)
            const progressoCrescimento = (voltasCompletas - 1) * 0.12;
            escalaAtual = Math.min(progressoCrescimento, 1.8);
            escalaAtual = Math.max(escalaAtual, 0.05); 
        }

        if (elementoFlor) {
            elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaAtual})`;
        }

        const fatorEscalaCirculo = escalaAtual > 0 ? escalaAtual : 1;
        const raioCirculoAtual = raioCirculoBase * (fatorEscalaCirculo * 0.7 + 0.3);

        borboletas.forEach(b => {
            b.angulo += b.velocidade;

            const x = cX + Math.cos(b.angulo) * raioCirculoAtual;
            const y = cY + Math.sin(b.angulo) * raioCirculoAtual;

            b.elemento.style.left = x + 'px';
            b.elemento.style.top = y + 'px';

            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            
            const fatorEscalaBorboleta = escalaAtual > 0 ? escalaAtual : 1;
            const tamanhoBorboletaAtual = b.tamanhoBase * (fatorEscalaBorboleta * 0.5 + 0.5);

            b.elemento.style.transform = `translate(-50%, -50%) scale(${tamanhoBorboletaAtual}) rotate(${anguloRotacao}deg)`;

            criarGlitter(x, y, 1);
        });
    }

    requestAnimationFrame(gerenciarCenario);
}

// Inicia o fluxo de animações
gerenciarCenario();

// Playlist Inteligente de Músicas
document.addEventListener("DOMContentLoaded", () => {
    const faixas = [
        { botao: document.getElementById("play_jesus"), audio: document.getElementById("musicaJesus"), nome: "JESUS" },
        { botao: document.getElementById("play_revolutionary"), audio: document.getElementById("musicaRevolutionary"), nome: "REVOLUTIONARY" },
        { botao: document.getElementById("play_amen"), audio: document.getElementById("musicaAmen"), nome: "AMEN" }
    ];

    let indiceAtivo = 0;

    function atualizarTemaVisual(nomeMusica) {
        coresAtivas = paletasCores[nomeMusica] || paletasCores.JESUS;
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
        if (indice >= faixas.length) indice = 0; 
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

            faixa.audio.addEventListener("ended", () => {
                tocarFaixa(indiceAtivo + 1);
            });
        }
    });

    const primeiraFaixa = faixas;
    if (primeiraFaixa && primeiraFaixa.audio) {
        primeiraFaixa.audio.play()
            .then(() => {
                if (primeiraFaixa.botao) primeiraFaixa.botao.innerText = `PAUSAR ${primeiraFaixa.nome}`;
                atualizarTemaVisual(primeiraFaixa.nome);
            })
            .catch(() => {
                const iniciarNoClique = () => {
                    tocarFaixa(0);
                    document.removeEventListener("click", iniciarNoClique);
                };
                document.addEventListener("click", iniciarNoClique);
            });
    }
});
