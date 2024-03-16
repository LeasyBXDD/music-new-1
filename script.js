let isMouseDown = false;
let isAnimating = false;
let animationSpeed = 100;

const noiseyMakey = new NoiseyMakey();
const board = new Board();

// RNN是一种循环神经网络：
// 我们使用它来提供一个初始的音乐序列，
// 然后它会继续播放以匹配该序列
let rnn;

init();

function init() {
  // 如果存在位置信息，则进行解析。
  if (window.location.hash) {
    try {
      const hash = window.location.hash.slice(1);
      const parsed = hash.split('&');
      board.data = decode(parsed[0]);
      if (parsed[1]) {
        document.getElementById('input').value = parsed[1];
        animationSpeed = parsed[1];
      }
      board.draw();
    } catch (err) {
      window.location.hash = 'not-a-valid-pattern-url';
    }
  }

  // 设置事件监听器。
  document.getElementById('container').addEventListener('mousedown', (event) => { isMouseDown = true; clickCell(event) });
  document.getElementById('container').addEventListener('mouseup', () => isMouseDown = false);
  document.getElementById('container').addEventListener('mouseover', clickCell);
  document.getElementById('input').addEventListener('change', (event) => {
    animationSpeed = parseInt(event.target.value);
    updateLocation();
  });

  // 快捷键
  document.body.addEventListener('keydown', (event) => {
    if (event.key === 's') { // 按下 s 键
      playSynth();
      event.preventDefault();
    } else if (event.key === 'd') { // 按下 d 键
      playDrums();
      event.preventDefault();
    } else if (event.key === 'p') { // 按下 p 键
      playOrPause();
      event.preventDefault();
    } else if (event.key === 'i') { // 按下 i 键
      autoDrums();
      event.preventDefault();
    } else if (event.key === 'r') { // 按下 r 键
      reset();
      event.preventDefault();
    }
  });
}

function reset(clearLocation = false) {
  board.reset();
  if (clearLocation) {
    window.location.hash = '';
  }
}

function clickCell(event) {
  const button = event.target;

  // 我们只关心点击按钮，而不是容器本身。
  if (button.localName !== 'button' || !isMouseDown) {
    return;
  }

  // 从按钮的自定义数据属性中获取行号和列号
  const x = parseInt(button.dataset.row);
  const y = parseInt(button.dataset.col);

  // 使用noiseyMakey.getSound()函数和按钮作为参数，调用board对象的toggleCell方法
  // toggleCell方法用于在游戏棋盘上切换特定单元格的状态
  board.toggleCell(x, y, noiseyMakey.getSound(), button);

  // 更新位置信息
  updateLocation();
}

function animate() {
  let currentColumn = 0;
  let animationIndex = setTimeout(step, animationSpeed);

  // 获取所有具有类名为'row'的元素
  const rows = document.querySelectorAll('.container > .row');

  // 动画的一个步骤
  function step() {
    // 在当前步骤中绘制游戏棋盘
    board.animate(currentColumn, noiseyMakey);

    // 准备下一列
    currentColumn++;

    // 如果当前列达到了最大列数（16），则重置为第一列
    if (currentColumn === 16) {
      currentColumn = 0;
    }

    // 检查是否在步骤进行中暂停了动画
    if (isAnimating) {
      // 如果是，通过setTimeout函数延迟调用下一步
      setTimeout(step, animationSpeed);
    } else {
      // 如果动画被停止，则清除animationIndex计时器
      clearTimeout(animationIndex);
      // 重置当前列为第一列
      currentColumn = 0;
      // 清除棋盘的动画效果
      board.clearAnimation();
    }
  }
}


/***********************************
 * Demo
 ***********************************/
function loadDemo(which) {
  switch (which) {
    case 1:
      board.data = decode('0000000000000000000000000000000022222000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000200020002000200000000000000000000000000000000000000000101000000000000001010101010010000010101010');
      break;
    case 2:
      board.data = decode('0000000000000000000000000000000000000000000000000000011001100000000001100110000000020000000020000002000000002000000020000002000000000222222000000000000000000000001000010000000000100000001101100011100100121210001010010001210000101001000010000000000000000000');
      break;
    case 3:
      board.data = decode('2222220001001000000000000000000000222222020220220000000000000000000000110000000000001000000000000001000000010000000000000000000000000000000010000010000000000000010000000000000001000000000010000100000000000000000000000000100000000000000000000000010101010000');
      break;
    case 4:
      board.data = decode('2202020202202020000020000020200000202002200220220002002000020001200000220021020000010000000000000000000100000000101010101010101000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000&100');
      break;
    case 5:
      board.data = decode('0000000000000000000111100000000000000000000000000011111000000000000010000000000000010000010000000010000001000000000000000100000000000000100000000000001100000000000000000010010000000000001001000000000000100100000000000000010000000000000010000000000000000000');
      break;
  }
  updateLocation();
  board.draw();
}

/***********************************
 * UI actions
 ***********************************/

function playOrPause() {
  const container = document.getElementById('container');

  if (isAnimating) {
    container.classList.remove('playing');
    noiseyMakey.pause();
  } else {
    container.classList.add('playing');
    animate();
    noiseyMakey.play();
  }

  isAnimating = !isAnimating;
  document.getElementById('btnPlay').textContent = isAnimating ? '暂停' : '启动';
}

function playSynth() {
  noiseyMakey.isSynth = true;
  document.getElementById('btnSynth').classList.add('synth');
  document.getElementById('btnDrums').classList.remove('drums');
}

function playDrums() {
  noiseyMakey.isSynth = false;
  document.getElementById('btnSynth').classList.remove('synth');
  document.getElementById('btnDrums').classList.add('drums');
}

function showHelp() {
  const helpBox = document.getElementById('help');
  helpBox.hidden = !helpBox.hidden;
}

function autoDrums() {
  const btn = document.getElementById('btnAuto');

  // Load the magenta model if we haven't already.
  if (btn.hasAttribute('not-loaded')) {
    loadRNN();
  } else {
    btn.setAttribute('disabled', true);

    // Don't block the UI thread while this is happening.
    setTimeout(() => {
      const sequence = board.getSynthSequence();
      // High temperature to get interesting beats!
      const dreamSequence = rnn.continueSequence(sequence, 16, 1.3).then((dream) => {
        board.drawDreamSequence(dream, sequence);

        updateLocation();
        btn.removeAttribute('disabled');
      });
    });
  }
}

function loadRNN() {
  const btn = document.getElementById('btnAuto');
  btn.textContent = 'Loading...';
  btn.setAttribute('disabled', true);
  rnn = new mm.MusicRNN(
    'https://storage.googleapis.com/download.magenta.tensorflow.org/tfjs_checkpoints/music_rnn/drum_kit_rnn'
  );
  Promise.all([
    rnn.initialize()
  ]).then(([vars]) => {
    const btn = document.getElementById('btnAuto');
    btn.removeAttribute('not-loaded');
    btn.removeAttribute('disabled');
    btn.textContent = '成功应用!';
  });
}

/***********************************
 * Save and load application state
 ***********************************/
function updateLocation() {
  // New board state, so update the URL.
  const speed = parseInt(document.getElementById('input').value);
  window.location.hash = `#${encode(board.data)}&${speed}`;
}
function encode(arr) {
  let bits = '';
  for (let i = 0; i < 16; i++) {
    for (let j = 0; j < 16; j++) {
      bits += arr[i][j].on ? arr[i][j].on : 0;
    }
  }
  return bits;
}

function decode(bits) {
  const arr = [];
  for (let i = 0; i < 16; i++) {
    let row = [];
    arr.push(row);
    for (let j = 0; j < 16; j++) {
      arr[i][j] = {};
      const c = bits.charAt(i * 16 + j);
      if (c != '0') {
        arr[i][j].on = parseInt(c);
      }
    }
  }
  return arr;
}


