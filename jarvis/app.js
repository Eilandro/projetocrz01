document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.talk');
  const content = document.querySelector('.content');

  if (!btn || !content) {
    console.error('Elementos .talk ou .content não encontrados no DOM.');
    return;
  }

  function normalizeText(str = '') {
    return str.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function speak(text, lang = 'pt-BR') {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  }

  function wishMe() {
    const hour = new Date().getHours();
    if (hour < 12) speak('Bom dia. Inicializando JARVIS.');
    else if (hour < 18) speak('Boa tarde. Inicializando JARVIS.');
    else speak('Boa noite. Inicializando JARVIS.');
  }

  window.addEventListener('load', () => {
    speak('Initializing JARVIS 2025...', 'en-US');
    setTimeout(wishMe, 1200);
  });

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    content.textContent = 'Navegador sem suporte ao reconhecimento de voz.';
    alert('Use Chrome ou Edge e habilite o microfone.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = false;

  let listening = false;

  recognition.onstart = () => {
    listening = true;
    content.textContent = 'Ouvindo...';
    btn.classList.add('listening');
  };

  recognition.onend = () => {
    listening = false;
    content.textContent = 'Clique para falar';
    btn.classList.remove('listening');
    // Se quiser auto-restart, descomente:
    // recognition.start();
  };

  recognition.onerror = (event) => {
    console.error('SpeechRecognition error:', event.error);
    speak('Erro no reconhecimento de voz. Verifique o microfone.');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    transcript = transcript.trim();
    content.textContent = transcript;
    takeCommand(transcript);
  };

  btn.addEventListener('click', () => {
    if (!listening) recognition.start();
    else recognition.stop();
  });

  function takeCommand(message) {
    if (!message) return;
    const clean = normalizeText(message);

    if (/^(oi|ola|hey|hello)\b/.test(clean)) {
      speak('Olá! Em que posso ajudar?');
      return;
    }
    if (clean.includes('abrir google')) {
      speak('Abrindo Google...');
      window.open('https://google.com', '_blank');
      return;
    }
    if (clean.includes('abrir youtube')) {
      speak('Abrindo YouTube...');
      window.open('https://youtube.com', '_blank');
      return;
    }
    if (clean.includes('hora')) {
      speak('Agora são ' + new Date().toLocaleTimeString());
      return;
    }
    if (clean.includes('data')) {
      speak('Hoje é ' + new Date().toLocaleDateString());
      return;
    }

    // fallback pesquisa
    const query = encodeURIComponent(message);
    speak('Pesquisando: ' + message);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  }
});
