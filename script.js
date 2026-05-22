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
    elementoFlor.style.transform = `translate(-50%, -50%) scale(${escalaFlor})`;

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

/* --- LOGICA DO GRAVADOR DE VÍDEO UNIVERSAL --- */
let mediaRecorder;
let chunks = [];
let gravando = false;

async function controlarGravacao() {
    const btn = document.getElementById('btnGravar');
    
    if (!gravando) {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { frameRate: { ideal: 30 } },
                audio: false
            });

            let tipoSuportado = 'video/webm';
            if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                tipoSuportado = 'video/webm;codecs=vp9';
            } else if (MediaRecorder.isTypeSupported('video/mp4')) {
                tipoSuportado = 'video/mp4';
            }

            mediaRecorder = new MediaRecorder(stream, { mimeType: tipoSuportado });
            chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                const url = URL.createObjectURL(blob);
                const ext = mediaRecorder.mimeType.includes('mp4') ? 'mp4' : 'webm';
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `borboletas-magicas.${ext}`;
                a.click();
                URL.revokeObjectURL(url);
                
                gravando = false;
                btn.innerText = "GRAVAR VÍDEO";
                btn.classList.remove('gravando');
            };

            mediaRecorder.start();
            gravando = true;
            btn.innerText = "PARAR GRAVAÇÃO";
            btn.classList.add('gravando');

            stream.getVideoTracks().onended = () => {
                if(mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
            };

        } catch (err) {
            console.error("Erro ao tentar gravar: ", err);
            alert("Atenção: A gravação exige rodar o arquivo em um servidor local (ex: extensões Live Server no VS Code) e aceitar a permissão de tela.");
        }
    } else {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }
}

// Inicializa a órbita das borboletas
orbitar();
document.addEventListener("DOMContentLoaded", () => {
    const musica = document.getElementById("musicaFundo");

    // Tenta tocar assim que a página carrega
    musica.play().catch(() => {
        // Se o navegador bloquear, toca no primeiro clique do usuário na página
        document.addEventListener("click", () => {
            musica.play();
        }, { once: true }); // Executa apenas uma vez
    });
});

