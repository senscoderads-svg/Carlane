const borboletas = [];
const htmlBorboleta = `
    <div class="asa esquerda"></div>
    <div class="corpo-central"></div>
    <div class="asa direita"></div>
`;

const raioCirculoBase = 160; 
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

function criarGlitter(x, y, quantidade = 1, tamanhoMaximo = 6) {
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
    
    else if (faseAnimacao === 'orbita_normal' || faseAnimacao === 'sumindo_borboletas' || faseAnimacao === 'metamorfose_flor' || faseAnimacao === 'borboleta_gigante_ativa') {
        anguloTotalPercorrido += velocidadVoo;
        const voltasCompletas = anguloTotalPercorrido / (2 * Math.PI);

        let escalaFlorBase = 0;
        if (voltasCompletas >= 1) {
            const progressoCrescimento = (voltasCompletas - 1) * 0.12;
            escalaFlorBase = Math.min(progressoCrescimento, 1.8);
        }

        if (voltasCompletas > 2.5 && faseAnimacao === 'orbita_normal') {
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
                elementoFlor.style.transform = `translate(-50%, -50%) scale(${1 + progressoMetamorfose * 1.5})`;
            }
            
            criarGlitter(cX, cY, 4, 12); 

            if (progressoMetamorfose >= 1) {
                faseAnimacao = 'borboleta_gigante_ativa';
                if (elementoFlor) {
                    elementoFlor.classList.add('borboleta-giant-concluida'); // Sincroniza com o CSS
                }
            }
        }

        if (elementoFlor && faseAnimacao !== 'metamorfose_flor' && faseAnimacao !== 'borboleta_gigante_ativa') {
            elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaFlorBase})`;
        }

        if (faseAnimacao === 'borboleta_gigante_ativa') {
            if (tempoFase % 2 === 0) {
                criarGlitter(cX + (Math.random() * 160 - 80), cY + (Math.random() * 160 - 80), 3, 12);
            }
        }

        const fatorEscalaCirculo = escalaFlorBase > 0 ? escalaFlorBase : 1;
        const raioCirculoAtual = raioCirculoBase * (fatorEscalaCirculo * 0.7 + 0.3);

        borboletas.forEach(b => {
            b.angulo += b.velocidade;
            const x = cX + Math.cos(b.angulo) * raioCirculoAtual;
            const y = cY + Math.sin(b.angulo) * raioCirculoAtual;

            b.elemento.style.left = x + 'px';
            b.elemento.style.top = y + 'px';
            b.elemento.style.opacity = opacidadeBorboletasPequenas;

            const anguloRotacao = (b.angulo * 180 / Math.PI) + 180;
            const tamanhoBorboletaAtual = b.tamanhoBase * (fatorEscalaCirculo * 0.5 + 0.5);

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
// Substitua tudo a partir da linha "document.addEventListener("DOMContentLoaded", () => {" por isto:
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
            }).catch(err => console.log("Bloqueado pelo navegador:", err));
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

    if (faixas[0] && faixas[0].audio) {
        faixas[0].audio.play().then(() => {
            if (faixas[0].botao) faixas[0].botao.innerText = `PAUSAR ${faixas[0].nome}`;
            atualizarTemaVisual(faixas[0].nome);
        }).catch(() => {
            const iniciarNoClique = () => {
                tocarFaixa(0);
                document.removeEventListener("click", iniciarNoClique);
            };
            document.addEventListener("click", iniciarNoClique);
        });
    }
});
