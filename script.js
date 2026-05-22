const borboletas = [];
const htmlBorboleta = `
    <div class="asa esquerda"></div>
    <div class="corpo-central"></div>
    <div class="asa direita"></div>
`;

// O raio do círculo se adapta dinamicamente ao espaço da tela do usuário
let raioCirculoBase = Math.min(window.innerWidth, window.innerHeight) * 0.22; 
const elementoFlor = document.getElementById('flor');

let anguloTotalPercorrido = 0;
const velocidadVoo = 0.012; 

let faseAnimacao = 'mao_descendo'; 
let tempoFase = 0;

let opacidadeBorboletasPequenas = 1;
let progressoMetamorfose = 0;

const paletasCores = {
    JESUS: ['#ffffff', '#ffeb3b', '#ff9800', '#ff5722'],          
    REVOLUTIONARY: ['#ff4081', '#e040fb', '#9c27b0', '#ffffff'],  
    AMEN: ['#00e5ff', '#009688', '#2196f3', '#ffffff']           
};

let coresAtivas = paletasCores.JESUS;

let maoX = window.innerWidth / 2;
let maoY = -50; 

let giantB_X = null;
let giantB_Y = null;
let escalaMaximaFlor = 1.8;

// Recalcula o tamanho se o usuário redimensionar a janela ou girar o celular
window.addEventListener('resize', () => {
    raioCirculoBase = Math.min(window.innerWidth, window.innerHeight) * 0.22;
    maoX = window.innerWidth / 2;
});

function criarGlitter(x, y, quantidade = 1, tamanhoMaximo = 6) {
    // CORRIGIDO: Agora usa 'quantidade' corretamente, evitando travar o navegador
    for (let i = 0; i < quantidade; i++) { 
        const p = document.createElement('div');
        p.className = 'particula';
        
        p.style.backgroundColor = coresAtivas[Math.floor(Math.random() * coresAtivas.length)];
        
        const varX = (Math.random() * 40 - 20);
        const varY = (Math.random() * 40 - 20);
        p.style.left = (x + varX) + 'px';
        p.style.top = (y + varY) + 'px';
        
        const tam = (2 + Math.random() * tamanhoMaximo) + 'px';
        p.style.width = tam;
        p.style.height = tam;
        
        p.style.boxShadow = `0 0 12px ${p.style.backgroundColor}`;

        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1500); 
    }
}

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
            velocidade: velocidadVoo, 
            tamanhoBase: 0.75 + (i * 0.1),
            xAtual: i === 0 ? -150 : window.innerWidth + 150, 
            yAtual: window.innerHeight / 2
        });
    }
}

function gerenciarCenario() {
    const cX = window.innerWidth / 2;
    const cY = window.innerHeight / 2;
    tempoFase++;

    if (faseAnimacao === 'mao_descendo') {
        maoY += (cY - maoY) * 0.02; 
        criarGlitter(maoX, maoY, 2);

        if (Math.abs(maoY - cY) < 8) {
            faseAnimacao = 'mao_semeando';
            tempoFase = 0;
        }
    }
    
    else if (faseAnimacao === 'mao_semeando') {
        const raioSemeadura = 40;
        const sX = cX + Math.cos(tempoFase * 0.08) * raioSemeadura;
        const sY = cY + Math.sin(tempoFase * 0.08) * raioSemeadura;
        criarGlitter(sX, sY, 3);

        if (tempoFase > 140) { 
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
    
    else if (faseAnimacao === 'orbita_normal' || faseAnimacao === 'sumindo_borboletas' || faseAnimacao === 'metamorfose_flor' || faseAnimacao === 'borboleta_gigante_ativa' || faseAnimacao === 'surgindo_mao' || faseAnimacao === 'pousando_no_dedo' || faseAnimacao === 'pousada') {
        anguloTotalPercorrido += velocidadVoo;
        const voltasCompletas = anguloTotalPercorrido / (2 * Math.PI);

        const limiteEscalaTela = Math.min(window.innerWidth, window.innerHeight) / 380;
        escalaMaximaFlor = Math.max(Math.min(limiteEscalaTela, 2.2), 1.2);

        let escalaFlorBase = 0;
        if (voltasCompletas >= 1) {
            const progressoCrescimento = (voltasCompletas - 1) * 0.12;
            escalaFlorBase = Math.min(progressoCrescimento, escalaMaximaFlor);
        }

        if (escalaFlorBase >= escalaMaximaFlor && faseAnimacao === 'orbita_normal') {
            faseAnimacao = 'sumindo_borboletas';
        }

        if (faseAnimacao === 'sumindo_borboletas') {
            opacidadeBorboletasPequenas -= 0.004; 
            if (opacidadeBorboletasPequenas <= 0) {
                opacidadeBorboletasPequenas = 0;
                faseAnimacao = 'metamorfose_flor';
                tempoFase = 0;
            }
        }

        if (faseAnimacao === 'metamorfose_flor') {
            progressoMetamorfose += 0.003; 
            
            if (elementoFlor && !elementoFlor.classList.contains('em-metamorfose')) {
                elementoFlor.classList.add('em-metamorfose');
                
                elementoFlor.innerHTML = `
                    <div class="luz-aura"></div>
                    <svg class="svg-borboleta-gigante" viewBox="0 0 200 200">
                        <defs>
                            <linearGradient id="gradAsa" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stop-color="#00e5ff" />
                                <stop offset="50%" stop-color="#ff4081" />
                                <stop offset="100%" stop-color="#e040fb" />
                            </linearGradient>
                            <filter id="superGlow">
                                <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="coloredBlur"/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        </defs>
                        <g class="grupo-asas">
                            <path class="asa-gigante esq" d="M100,100 C40,40 10,60 20,110 C25,135 60,140 100,100 Z M100,100 C50,110 30,140 40,165 C48,185 80,165 100,100 Z" fill="url(#gradAsa)" filter="url(#superGlow)"/>
                            <path class="asa-gigante dir" d="M100,100 C160,40 190,60 180,110 C175,135 140,140 100,100 Z M100,100 C150,110 170,140 160,165 C152,185 120,165 100,100 Z" fill="url(#gradAsa)" filter="url(#superGlow)"/>
                        </g>
                        <rect x="96" y="60" width="8" height="80" rx="4" fill="#ffffff" filter="url(#superGlow)"/>
                        <circle cx="100" cy="54" r="7" fill="#ffffff" filter="url(#superGlow)"/>
                    </svg>
                `;
            }
            
            if (elementoFlor) {
                elementoFlor.style.opacity = progressoMetamorfose;
                elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaMaximaFlor * (1 + progressoMetamorfose * 0.65)})`;
            }
            
            criarGlitter(cX, cY, 4, 12); 

            if (progressoMetamorfose >= 1) {
                faseAnimacao = 'borboleta_gigante_ativa';
                tempoFase = 0;
                if (elementoFlor) {
                    elementoFlor.classList.add('borboleta-gigante-concluida');
                }
            }
        }

        if (elementoFlor && faseAnimacao !== 'metamorfose_flor' && faseAnimacao !== 'borboleta_gigante_ativa' && faseAnimacao !== 'pousando_no_dedo' && faseAnimacao !== 'pousada') {
            elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaFlorBase})`;
        }

        if (faseAnimacao === 'borboleta_gigante_ativa') {
            if (tempoFase % 2 === 0) {
                criarGlitter(cX + (Math.random() * 160 - 80), cY + (Math.random() * 160 - 80), 3, 12);
            }
            if (tempoFase > 240) {
                faseAnimacao = 'surgindo_mao';
                tempoFase = 0;
                
                if(!document.getElementById('maoFinal')) {
                    const mContainer = document.createElement('div');
                    mContainer.className = 'mao-final-container';
// Cole este bloco para substituir toda a metade final com erro do seu script.js:
                if(!document.getElementById('maoFinal')) {
                    const mContainer = document.createElement('div');
                    mContainer.className = 'mao-final-container';
                    mContainer.id = 'maoFinal';
                    mContainer.innerHTML = `
                        <svg class="svg-mao-silhueta" viewBox="0 0 450 350">
                            <path class="path-mao" d="M450,350 L450,220 C380,200 340,240 280,240 C220,240 180,200 110,185 C100,183 90,183 80,183 C60,183 40,188 30,188 C25,188 20,184 25,180 C35,170 60,160 95,160 C130,160 190,155 240,165 C260,130 200,115 140,135 C110,143 90,155 70,175 C65,180 60,175 63,170 C80,145 110,120 150,110 C180,102 200,115 210,130 C230,90 185,75 130,105 C110,115 95,130 85,145 C80,152 74,148 77,142 C95,110 130,80 180,80 C210,80 220,95 225,110 C245,70 200,40 120,75 C100,84 70,115 50,125 C45,127 40,120 46,115 C75,90 120,40 190,40 C220,40 250,65 265,90 C290,125 330,155 390,160 C420,162 440,150 450,140" />
                        </svg>
                    `;
                    document.body.appendChild(mContainer);
                    setTimeout(() => mContainer.classList.add('visivel'), 50);
                }
            }
        } // CHAVE CORRIGIDA: Esta chave fecha corretamente a estrutura da 'borboleta_gigante_ativa'

        if (faseAnimacao === 'surgindo_mao') {
            if (tempoFase % 2 === 0) criarGlitter(cX, cY, 1, 10);
            if (tempoFase > 150) { 
                faseAnimacao = 'pousando_no_dedo';
                giantB_X = cX;
                giantB_Y = cY;
                tempoFase = 0;
            }
        }

        if (faseAnimacao === 'pousando_no_dedo' || faseAnimacao === 'pousada') {
            const dedoX = window.innerWidth - 450 + 35; 
            const dedoY = window.innerHeight - 350 + 183;

            if (faseAnimacao === 'pousando_no_dedo') {
                giantB_X += (dedoX - giantB_X) * 0.015;
                giantB_Y += (dedoY - giantB_Y) * 0.015;

                if (Math.abs(giantB_X - dedoX) < 3 && Math.abs(giantB_Y - dedoY) < 3) {
                    faseAnimacao = 'pousada';
                }
            } else {
                giantB_X = dedoX;
                giantB_Y = dedoY;
            }

            if (elementoFlor) {
                elementoFlor.style.left = giantB_X + 'px';
                elementoFlor.style.top = giantB_Y + 'px';
                elementoFlor.style.transform = `translate(-50%, -85%) scale(${escalaMaximaFlor * 1.3})`;
            }

            if (tempoFase % 3 === 0) {
                criarGlitter(giantB_X, giantB_Y, 1, faseAnimacao === 'pousada' ? 6 : 10);
            }
        }

        const factorEscalaCirculo = escalaFlorBase > 0 ? escalaFlorBase : 1;
        const raioCirculoAtual = raioCirculoBase * (factorEscalaCirculo * 0.7 + 0.3);

        borboletas.forEach(b => {
            b.angulo += b.velocidade;
            const x = cX + Math.cos(b.angulo) * raioCirculoAtual;
            const y = cY + Math.sin(b.angulo) * raioCirculoAtual;

            b.elemento.style.left = x + 'px';
            b.elemento.style.top = y + 'px';
            b.elemento.style.opacity = opacidadeBorboletasPequenas;

            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            const tamanhoBorboletaAtual = b.tamanhoBase * (factorEscalaCirculo * 0.5 + 0.5);

            b.elemento.style.transform = `translate(-50%, -50%) scale(${tamanhoBorboletaAtual}) rotate(${anguloRotacao}deg)`;

            if (opacidadeBorboletasPequenas > 0) {
                criarGlitter(x, y, 1);
            } else {
                b.elemento.style.display = 'none'; 
            }
        });
    }

    requestAnimationFrame(gerenciarCenario);
}

gerenciarCenario();

// Playlist Inteligente com passagem automática e troca de temas visuais
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
            faixa.audio.play().then(() => {
                if (faixa.botao) faixa.botao.innerText = `PAUSAR ${faixa.nome}`;
                atualizarTemaVisual(faixa.nome);
            }).catch(err => console.log("Aguardando clique do usuário para iniciar áudio.", err));
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

    if (faixas && faixas.audio) {
        faixas.audio.play().then(() => {
            if (faixas.botao) faixas.botao.innerText = `PAUSAR ${faixas.nome}`;
            atualizarTemaVisual(faixas.nome);
        }).catch(() => {
            const iniciarNoClique = () => {
                tocarFaixa(0);
                document.removeEventListener("click", iniciarNoClique);
            };
            document.addEventListener("click", iniciarNoClique);
        });
    }
});
}
