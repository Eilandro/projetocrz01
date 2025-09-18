const mario = document.querySelector('.mario')
const pipe = document.querySelector('.pipe')
const start = document.querySelector('.start')
const gameOver = document.querySelector('.game-over')

// agora os áudios vêm da pasta "music"
const audioStart = new Audio('./music/audio_theme.mp3')
const audioGameOver = new Audio('./music/audio_gameover.mp3')

let gameLoop // intervalo principal

const startGame = () => {
  // garante que não exista outro loop ativo
  clearInterval(gameLoop)

  pipe.classList.add('pipe-animation')
  start.style.display = 'none'

  audioStart.currentTime = 0
  audioStart.play()

  // inicia o loop do jogo
  gameLoop = setInterval(() => {
    const pipePosition = pipe.offsetLeft
    const marioPosition = parseInt(
      window.getComputedStyle(mario).bottom.replace('px', '')
    )

    if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
      pipe.classList.remove('pipe-animation')
      pipe.style.left = `${pipePosition}px`

      mario.classList.remove('jump')
      mario.style.bottom = `${marioPosition}px`

      mario.src = './img/game-over.png'
      mario.style.width = '80px'
      mario.style.marginLeft = '50px'

      audioStart.pause()
      audioGameOver.currentTime = 0
      audioGameOver.play()

      gameOver.style.display = 'flex'

      clearInterval(gameLoop) // para o loop
    }
  }, 10)
}

const restartGame = () => {
  clearInterval(gameLoop) // limpa qualquer loop antigo

  gameOver.style.display = 'none'

  // reseta Mario
  mario.src = './img/mario.gif'
  mario.style.width = '150px'
  mario.style.bottom = '0'
  mario.style.marginLeft = '0'

  // reseta cano
  pipe.style.left = ''
  pipe.style.right = '-80px'
  pipe.classList.remove('pipe-animation')

  // reseta áudios
  audioGameOver.pause()
  audioGameOver.currentTime = 0
  audioStart.pause()
  audioStart.currentTime = 0

  // inicia o jogo de novo
  startGame()
}

const jump = () => {
  mario.classList.add('jump')
  setTimeout(() => {
    mario.classList.remove('jump')
  }, 800)
}

// controles
document.addEventListener('keypress', e => {
  if (e.key === ' ') jump()
  if (e.key === 'Enter') startGame()
})

document.addEventListener('touchstart', e => {
  if (e.touches.length) jump()
})
