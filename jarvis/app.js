// app.js — JARVIS 2025 (versão corrigida e mais robusta)
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('.talk');
  const content = document.querySelector('.content');

  if (!btn || !content) {
    console.error('Elementos .talk ou .content não encontrados no DOM. Verifique seu HTML.');
    return;
  }

  // Normaliza texto: tira acentos, lower case e trim
  function normalizeText(str = '') {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  // TTS (fala)
  function speak(text, langHint) {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis não disponível neste navegador.');
      return;
    }
    window.speechSynthesis.cancel(); // cancela fala anterior
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.volume = 1;
    // define idioma: usa dica ou o idioma do navegador (pt ou en)
    u.lang = langHint || (navigator.language && navigator.language.startsWith('pt') ? 'pt-BR' : 'en-US');
    u.onend = () => console.debug('TTS: fim da fala');
    u.onerror = (e) => console.error('TTS error', e);
    window.speechSynthesis.speak(u);
  }

  // Saudação
  function wishMe() {
    const hour = new Date().getHours();
    if (hour < 12) speak('Bom dia. Inicializando JARVIS.', 'pt-BR');
    else if (hour < 18) speak('Boa tarde. Inicializando JARVIS.', 'pt-BR');
    else speak('Boa noite. Inicializando JARVIS.', 'pt-BR');
  }

  // Inicialização ao carregar a página
  window.addEventListener('load', () => {
    speak('Initializing JARVIS 2025...', 'en-US');
    setTimeout(wishMe, 1200);
  });

  // ===== Detecta SpeechRecognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  if (!SpeechRecognition) {
    content.textContent = 'Navegador sem suporte ao reconhecimento de voz.';
    alert('SpeechRecognition não detectado. Use Chrome/Edge e habilite microfone.');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';          // idioma primário (pt-BR). Pode ajustar
  recognition.continuous = true;      // mantém ouvindo
  recognition.interimResults = false; // resultados finais apenas
  recognition.maxAlternatives = 1;

  let listening = false;

  recognition.onstart = () => {
    listening = true;
    content.textContent = 'Listening...';
    btn.classList.add('listening');
    console.debug('SpeechRecognition started');
  };

  recognition.onend = () => {
    // Ao terminar, atualiza estado. Se quiser auto-restart, controle aqui.
    listening = false;
    content.textContent = 'Click to speak';
    btn.classList.remove('listening');
    console.debug('SpeechRecognition ended');
    // Se você preferir que volte a ouvir automaticamente, descomente:
    // recognition.start();
  };

  recognition.onerror = (event) => {
    console.error('SpeechRecognition error:', event.error);
    // mensagens úteis para o usuário
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
      speak('Permissão de microfone negada. Habilite o microfone no navegador.', 'pt-BR');
    } else {
      speak('Ocorreu um erro no reconhecimento de voz.', 'pt-BR');
    }
  };

  recognition.onresult = (event) => {
    // junta resultados (caso venham fragmentados)
    let transcript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    transcript = transcript.trim();
    console.debug('Transcript raw:', transcript);
    content.textContent = transcript;
    takeCommand(transcript);
  };

  // botão liga/desliga escuta
  btn.addEventListener('click', () => {
    if (!listening) {
      try {
        recognition.start();
      } catch (err) {
        // em alguns browsers start() lança se já estiver tentando — tratamos
        console.warn('recognition.start() warning:', err);
      }
    } else {
      recognition.stop();
    }
  });

  // ===== Lógica de comandos
  function takeCommand(message) {
    if (!message) return;
    const clean = normalizeText(message);

    // Cumprimentos
    if (/^(oi|ola|hey|hello)\b/.test(clean)) {
      speak('Olá! Em que posso ajudar?', 'pt-BR');
      return;
    }

    // abrir google
    if (clean.includes('abrir google') || clean.includes('open google')) {
      speak('Abrindo Google...', 'pt-BR');
      window.open('https://google.com', '_blank');
      return;
    }

    // abrir youtube
    if (clean.includes('abrir youtube') || clean.includes('open youtube')) {
      speak('Abrindo YouTube...', 'pt-BR');
      window.open('https://youtube.com', '_blank');
      return;
    }

    // abrir facebook
    if (clean.includes('abrir facebook') || clean.includes('open facebook')) {
      speak('Abrindo Facebook...', 'pt-BR');
      window.open('https://facebook.com', '_blank');
      return;
    }

    // pesquisar (pt/en)
    if (
      clean.includes('pesquisar') || clean.includes('search') ||
      clean.startsWith('o que e') || clean.startsWith('o que eh') ||
      clean.startsWith('what is') || clean.startsWith('who is')
    ) {
      const query = encodeURIComponent(message);
      speak('Pesquisando: ' + message, 'pt-BR');
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
      return;
    }

    // wikipedia (abre em pt se detectar pt)
    if (clean.includes('wikipedia')) {
      const query = encodeURIComponent(message.replace(/wikipedia/gi, '').trim());
      const wikiLang = clean.match(/\b(quem|o que|qual)\b/) ? 'pt' : 'en';
      speak('Abrindo Wikipédia para ' + (query || 'termo'), wikiLang === 'pt' ? 'pt-BR' : 'en-US');
      window.open(`https://${wikiLang}.wikipedia.org/wiki/${query}`, '_blank');
      return;
    }

    // hora
    if (clean.includes('hora') || clean.includes('time')) {
      const time = new Date().toLocaleTimeString();
      speak('Agora são ' + time, 'pt-BR');
      return;
    }

    // data
    if (clean.includes('data') || clean.includes('date')) {
      const date = new Date().toLocaleDateString();
      speak('A data de hoje é ' + date, 'pt-BR');
      return;
    }

    // calculadora (online)
    if (clean.includes('calculadora') || clean.includes('calculator')) {
      speak('Abrindo calculadora online...', 'pt-BR');
      window.open('https://www.google.com/search?q=calculator', '_blank');
      return;
    }

    // fallback: pesquisa no Google
    {
      const query = encodeURIComponent(message);
      speak('Encontrei algumas informações sobre: ' + message, 'pt-BR');
      window.open(`https://www.google.com/search?q=${query}`, '_blank');
    }
  }
});