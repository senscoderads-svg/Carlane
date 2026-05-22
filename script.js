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

// Cores mágicas das borboletas usadas na mão e nos rastros
const coresMagicas = ['#00e5ff', '#ff4081', '#e040fb', '#ffffff'];

// Posição da mão mágica
let maoX = window.innerWidth / 2;
let maoY = -50; 

// Cria o rastro de glitter brilhante
function criarGlitter(x, y, quantidade = 1) {
    for (let i = 0; i < quantidade; i++) {
        const p = document.createElement('div');
        p.className = 'particula';
        
        p.style.backgroundColor = coresMagicas[Math.floor(Math.random() * coresMagicas.length)];
        
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

// Inicializa as duas borboletas (invisíveis no início fora da tela)
function inicializarBorboletas() {
    for (let i = 0; i < 2; i++) {
        const el = document.createElement('div');
        el.className = 'container-borboleta';
        el.innerHTML = htmlBorboleta;
        el.style.opacity = '0'; // Começam ocultas
        document.body.appendChild(el);

        borboletas.push({
            elemento: el,
            angulo: i * Math.PI, // Posições opostas na órbita
            velocidade: velocidadeVoo, 
            tamanhoBase: 0.75 + (i * 0.1),
            xAtual: i === 0 ? -100 : window.innerWidth + 100, // Esquerda e Direita externas
            yAtual: window.innerHeight / 2
        });
    }
}

// Loop principal que gerencia a linha do tempo do site
function gerenciarCenario() {
    const cX = window.innerWidth / 2;
    const cY = window.innerHeight / 2;
    tempoFase++;

    // --- FASE 1: MÃO MÁGICA SURGE E DESCE DO TOPO ---
    if (faseAnimacao === 'mao_descendo') {
        // Move a mão em direção ao centro da tela
        maoY += (cY - maoY) * 0.05;
        criarGlitter(maoX, maoY, 3); // Cria o formato da mão com brilhos

        if (Math.abs(maoY - cY) < 5) {
            faseAnimacao = 'mao_semeando';
            tempoFase = 0;
        }
    }
    
    // --- FASE 2: MÃO SEMEIA NO CENTRO E SOME ---
    else if (faseAnimacao === 'mao_semeando') {
        // Faz movimentos circulares rápidos no centro simulando semear
        const raioSemeadura = 30;
        const sX = cX + Math.cos(tempoFase * 0.2) * raioSemeadura;
        const sY = cY + Math.sin(tempoFase * 0.2) * raioSemeadura;
        criarGlitter(sX, sY, 5);

        if (tempoFase > 80) { // Tempo semeando
            faseAnimacao = 'borboletas_surgindo';
            inicializarBorboletas();
            tempoFase = 0;
        }
    }
    
    // --- FASE 3: BORBOLETAS SURGEM DOS LADOS E VÃO PRO CÍRCULO ---
    else if (faseAnimacao === 'borboletas_surgindo') {
        let chegaramNoDestino = true;

        borboletas.forEach(b => {
            b.elemento.style.opacity = '1';
            
            // Calcula onde elas devem se encaixar na órbita inicial inicial
            const destinoX = cX + Math.cos(b.angulo) * raioCirculoBase;
            const destinoY = cY + Math.sin(b.angulo) * raioCirculoBase;

            // Move suavemente dos lados para o ponto de órbita
            b.xAtual += (destinoX - b.xAtual) * 0.05;
            b.yAtual += (destinoY - b.yAtual) * 0.05;

            b.elemento.style.left = b.xAtual + 'px';
            b.elemento.style.top = b.yAtual + 'px';

            // Ângulo de rotação apontando para a direção do voo inicial
            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            b.elemento.style.transform = `translate(-50%, -50%) scale(${b.tamanhoBase * 0.5}) rotate(${anguloRotacao}deg)`;

            criarGlitter(b.xAtual, b.yAtual, 1);

            if (Math.abs(b.xAtual - destinoX) > 8) chegaramNoDestino = false;
        });

        if (chegaramNoDestino) {
            faseAnimacao = 'orbita_normal';
        }
    }
    
    // --- FASE 4: ÓRBITA NORMAL E CRESCIMENTO DA FLOR APÓS 1 VOLTA ---
    else if (faseAnimacao === 'orbita_normal') {
        anguloTotalPercorrido += velocidadeVoo;
        const voltasCompletas = anguloTotalPercorrido / (2 * Math.PI);

        // A flor só nasce DEPOIS que completa 1 volta inteira (voltasCompletas >= 1)
        let escalaAtual = 0;
        if (voltasCompletas >= 1) {
            const progressoCrescimento = (voltasCompletas - 1) * 0.3;
            escalaAtual = Math.min(progressoCrescimento, 1.8);
            escalaAtual = Math.max(escalaAtual, 0.1); // Inicia o surgimento imediato
        }

        if (elementoFlor) {
            elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaAtual})`;
        }

        // Multiplicador do círculo baseado no nascimento da flor (mínimo de 1 para manter o raio inicial)
        const fatorEscalaCirculo = escalaAtual > 0 ? escalaAtual : 1;
        const raioCirculoAtual = raioCirculoBase * (fatorEscalaCirculo * 0.8 + 0.2);

        borboletas.forEach(b => {
            b.angulo += b.velocidade;

            const x = cX + Math.cos(b.angulo) * raioCirculoAtual;
            const y = cY + Math.sin(b.angulo) * raioCirculoAtual;

            b.elemento.style.left = x + 'px';
            b.elemento.style.top = y + 'px';

            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            
            // Borboletas crescem junto com o cenário após a flor nascer
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

// Controle da Playlist de Músicas
document.addEventListener("DOMContentLoaded", () => {
    const faixas = [
        { botao: document.getElementById("play_jesus"), audio: document.getElementById("musicaJesus"), nome: "JESUS" },
        { botao: document.getElementById("play_revolutionary"), audio: document.getElementById("musicaRevolutionary"), nome: "REVOLUTIONARY" },
        { botao: document.getElementById("play_amen"), audio: document.getElementById("musicaAmen"), nome: "AMEN" }
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

    if (faixas[0] && faixas[0].audio) {
        faixas[0].audio.play().then(() => {
            if (faixas[0].botao) faixas[0].botao.innerText = `PAUSAR ${faixas[0].nome}`;
        }).catch(() => {
            const iniciarNoClique = () => {
                if (faixas[0].audio.paused) {
                    faixas[0].audio.play()
                        .then(() => {
                            if (faixas[0].botao) faixas[0].botao.innerText = `PAUSAR ${faixas[0].nome}`;
                        })
                        .catch(err => console.log("Abafado:", err));
                }
                document.removeEventListener("click", iniciarNoClique);
            };
            document.addEventListener("click", iniciarNoClique);
        });
    }
});
