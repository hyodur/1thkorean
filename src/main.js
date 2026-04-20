// =============================================
//  한글 자모음 복습 게임 - 메인 로직
// =============================================

import { WORDS, CONSONANTS, VOWELS, getRandomWordsByMode, generateChoices } from './data/words.js';

// ─── 상태 관리 ────────────────────────────────
const state = {
  mode: null,          // 'consonant' | 'vowel'
  questions: [],       // 게임에 쓸 단어 목록
  currentIdx: 0,       // 현재 문제 인덱스
  score: 0,            // 점수
  selected: new Set(), // 현재 선택한 보기
  answered: false,     // 이미 답한 상태
  choices: [],         // 현재 보기 목록
  totalQ: 10,          // 총 문제 수
};

// ─── DOM 참조 ────────────────────────────────
const screens = {
  main:   document.getElementById('screen-main'),
  game:   document.getElementById('screen-game'),
  result: document.getElementById('screen-result'),
};

// ─── 화면 전환 ────────────────────────────────
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// ─── 메인 화면 초기화 ─────────────────────────
function initMainScreen() {
  showScreen('main');
}

// ─── 게임 시작 ────────────────────────────────
function startGame(mode) {
  state.mode      = mode;
  state.questions = getRandomWordsByMode(mode, state.totalQ);
  state.currentIdx = 0;
  state.score      = 0;

  const gameScreen = screens.game;
  gameScreen.className = `screen game-screen mode-${mode}`;

  showScreen('game');
  renderQuestion();
}

// ─── 문제 렌더링 ──────────────────────────────
function renderQuestion() {
  const q     = state.questions[state.currentIdx];
  const isC   = state.mode === 'consonant';
  const allOpts = isC ? CONSONANTS : VOWELS;
  const correct = isC ? q.consonants : q.vowels;

  // 보기 생성 (5개, 정답 모두 포함)
  const numChoices = Math.max(5, correct.length + 2);
  state.choices  = generateChoices(correct, allOpts, Math.min(numChoices, allOpts.length));
  state.selected = new Set();
  state.answered = false;

  // 진행 상태
  const progressPct = (state.currentIdx / state.totalQ) * 100;
  document.getElementById('progress-bar').style.width = progressPct + '%';
  document.getElementById('progress-text').textContent =
    `${state.currentIdx + 1} / ${state.totalQ}`;
  document.getElementById('score-display').textContent = `⭐ ${state.score}점`;
  document.getElementById('game-mode-label').textContent =
    isC ? '🔵 자음 복습' : '🟢 모음 복습';

  // 낱말 카드
  document.getElementById('word-emoji').textContent = q.emoji;
  document.getElementById('word-text').textContent  = q.word;
  document.getElementById('word-question').innerHTML =
    `"${q.word}" 에 쓰인 <strong>${isC ? '자음' : '모음'}</strong>을 모두 고르세요!`;

  // 보기 버튼
  const grid = document.getElementById('choices-grid');
  grid.innerHTML = '';
  state.choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = ch;
    btn.dataset.value = ch;
    btn.addEventListener('click', () => onChoiceClick(btn, ch));
    grid.appendChild(btn);
  });

  // 피드백 초기화
  document.getElementById('feedback-msg').textContent = '';
  document.getElementById('feedback-msg').className   = 'feedback-msg';

  // 버튼 상태
  document.getElementById('btn-check').style.display = 'inline-block';
  document.getElementById('btn-next').style.display  = 'none';
  document.getElementById('btn-check').disabled = true;

  // 선택 개수 안내
  document.getElementById('choices-label').textContent =
    `✏️ 정답 개수: ${correct.length}개를 찾아보세요!`;
}

// ─── 보기 클릭 ────────────────────────────────
function onChoiceClick(btn, value) {
  if (state.answered) return;

  if (state.selected.has(value)) {
    state.selected.delete(value);
    btn.classList.remove('selected');
  } else {
    state.selected.add(value);
    btn.classList.add('selected');
  }

  document.getElementById('btn-check').disabled = state.selected.size === 0;
}

// ─── 정답 확인 ────────────────────────────────
function checkAnswer() {
  if (state.answered) return;
  state.answered = true;

  const q       = state.questions[state.currentIdx];
  const isC     = state.mode === 'consonant';
  const correct = new Set(isC ? q.consonants : q.vowels);
  const selected = state.selected;

  // 정답 여부 판정 (선택한 것이 정답 집합과 완전히 일치)
  const isCorrect =
    selected.size === correct.size &&
    [...selected].every(v => correct.has(v));

  // 보기 버튼 색상 처리
  document.querySelectorAll('.choice-btn').forEach(btn => {
    const v = btn.dataset.value;
    btn.disabled = true;
    if (correct.has(v) && selected.has(v)) {
      btn.classList.add('correct'); // 맞게 선택
    } else if (!correct.has(v) && selected.has(v)) {
      btn.classList.add('wrong');   // 틀리게 선택
    } else if (correct.has(v) && !selected.has(v)) {
      btn.classList.add('missed');  // 놓친 정답
    }
  });

  // 피드백
  const fb = document.getElementById('feedback-msg');
  if (isCorrect) {
    state.score += 10;
    fb.textContent = '🎉 정답이에요! 훌륭해요!';
    fb.className   = 'feedback-msg correct';
    launchConfetti();
  } else {
    fb.textContent = `💡 정답: ${[...correct].join(', ')} 이에요!`;
    fb.className   = 'feedback-msg wrong';
  }

  document.getElementById('score-display').textContent = `⭐ ${state.score}점`;
  document.getElementById('btn-check').style.display = 'none';
  document.getElementById('btn-next').style.display  = 'inline-block';

  const isLast = state.currentIdx >= state.totalQ - 1;
  document.getElementById('btn-next').textContent = isLast ? '결과 보기 🏆' : '다음 문제 ▶';
}

// ─── 다음 문제 ────────────────────────────────
function nextQuestion() {
  state.currentIdx++;
  if (state.currentIdx >= state.totalQ) {
    showResult();
  } else {
    renderQuestion();
  }
}

// ─── 결과 화면 ────────────────────────────────
function showResult() {
  const total   = state.totalQ;
  const perfect = state.totalQ * 10;
  const pct     = Math.round((state.score / perfect) * 100);

  let emoji   = '😊';
  let title   = '잘했어요!';
  let comment = '다음엔 더 잘할 수 있어요!';
  let stars   = '⭐⭐';

  if (pct === 100) {
    emoji = '🏆'; title = '완벽해요!';
    comment = '모두 맞혔어요! 정말 대단해요! 👏'; stars = '⭐⭐⭐';
  } else if (pct >= 80) {
    emoji = '🌟'; title = '훌륭해요!';
    comment = '거의 다 맞혔어요! 조금만 더 연습해요!'; stars = '⭐⭐⭐';
  } else if (pct >= 60) {
    emoji = '😊'; title = '잘했어요!';
    comment = '잘하고 있어요! 한번 더 도전해볼까요?'; stars = '⭐⭐';
  } else if (pct >= 40) {
    emoji = '🙂'; title = '조금 더 연습해요!';
    comment = '괜찮아요! 다시 해보면 더 잘할 수 있어요!'; stars = '⭐';
  } else {
    emoji = '💪'; title = '같이 더 공부해요!';
    comment = '천천히 다시 해봐요! 할 수 있어요!'; stars = '⭐';
  }

  document.getElementById('result-emoji').textContent   = emoji;
  document.getElementById('result-title').textContent   = title;
  document.getElementById('result-score-big').innerHTML =
    `${state.score}<span> / ${perfect}점</span>`;
  document.getElementById('result-comment').textContent  = comment;
  document.getElementById('result-stars').textContent    = stars;

  showScreen('result');
  if (pct >= 60) launchConfetti(60);
}

// ─── 컨페티 효과 ──────────────────────────────
function launchConfetti(count = 24) {
  const colors = ['#FF6B6B','#FFE66D','#4ECDC4','#C77DFF','#52B788','#FF8E53'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -20px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${8 + Math.random() * 10}px;
      height: ${8 + Math.random() * 10}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ─── 장식 별 생성 ─────────────────────────────
function createDecoStars() {
  const emojis = ['⭐','🌟','✨','💫'];
  const positions = [
    {top:'8%', left:'5%', delay:'0s'},
    {top:'15%', right:'8%', delay:'1.5s'},
    {top:'70%', left:'3%', delay:'0.8s'},
    {top:'80%', right:'5%', delay:'2.2s'},
    {top:'45%', left:'92%', delay:'1s'},
  ];
  positions.forEach((pos, i) => {
    const el = document.createElement('div');
    el.className = 'deco-star';
    el.textContent = emojis[i % emojis.length];
    Object.assign(el.style, pos);
    el.style.animationDelay = pos.delay;
    el.style.animationDuration = (4 + i) + 's';
    document.body.appendChild(el);
  });
}

// ─── HTML 구조 생성 ───────────────────────────
function buildHTML() {
  document.getElementById('app').innerHTML = `
    <!-- 메인 화면 -->
    <div id="screen-main" class="screen main-screen active">
      <div class="main-header">
        <h1 class="main-title">
          <span class="highlight-red">자</span>·<span class="highlight-teal">모</span>음<br>복습 게임
        </h1>
        <p class="main-subtitle">낱말에서 자음/모음을 찾아봐요! 🔍</p>
      </div>

      <div class="main-cards">
        <button class="mode-card consonant-card" id="btn-consonant">
          <span class="mode-card-emoji">🔵</span>
          <div class="mode-card-title">자음 복습</div>
          <p class="mode-card-desc">낱말 속에 숨어있는<br>자음을 찾아봐요</p>
          <div class="mode-card-sample">
            <span class="sample-badge">ㄱ</span>
            <span class="sample-badge">ㄴ</span>
            <span class="sample-badge">ㅁ</span>
            <span class="sample-badge">ㅂ</span>
          </div>
        </button>

        <button class="mode-card vowel-card" id="btn-vowel">
          <span class="mode-card-emoji">🟢</span>
          <div class="mode-card-title">모음 복습</div>
          <p class="mode-card-desc">낱말 속에 숨어있는<br>모음을 찾아봐요</p>
          <div class="mode-card-sample">
            <span class="sample-badge">ㅏ</span>
            <span class="sample-badge">ㅓ</span>
            <span class="sample-badge">ㅗ</span>
            <span class="sample-badge">ㅜ</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 게임 화면 -->
    <div id="screen-game" class="screen game-screen mode-consonant">
      <div class="game-header">
        <button class="btn-back" id="btn-back" title="처음으로">🏠</button>
        <div class="game-title-bar">
          <span class="game-mode-label" id="game-mode-label">🔵 자음 복습</span>
          <div class="game-progress-text" id="progress-text">1 / 10</div>
        </div>
        <div class="score-badge" id="score-display">⭐ 0점</div>
      </div>

      <div class="progress-bar-wrap">
        <div class="progress-bar" id="progress-bar" style="width:0%"></div>
      </div>

      <div class="word-card">
        <span class="word-emoji" id="word-emoji">🌳</span>
        <div class="word-text" id="word-text">나무</div>
        <p class="word-question" id="word-question"></p>
      </div>

      <div class="choices-label" id="choices-label"></div>
      <div class="choices-grid" id="choices-grid"></div>

      <div class="feedback-msg" id="feedback-msg"></div>

      <div style="display:flex; gap:16px;">
        <button class="btn-check" id="btn-check" disabled>확인하기 ✅</button>
        <button class="btn-next" id="btn-next" style="display:none">다음 문제 ▶</button>
      </div>
    </div>

    <!-- 결과 화면 -->
    <div id="screen-result" class="screen result-screen">
      <div class="result-card">
        <span class="result-emoji" id="result-emoji">🏆</span>
        <div class="result-title" id="result-title">완벽해요!</div>
        <div class="result-stars" id="result-stars">⭐⭐⭐</div>
        <div class="result-score-big" id="result-score-big">100<span> / 100점</span></div>
        <p class="result-comment" id="result-comment">모두 맞혔어요!</p>
        <div class="result-btns">
          <button class="btn-retry" id="btn-retry">다시 도전! 🔄</button>
          <button class="btn-home" id="btn-home">처음으로 🏠</button>
        </div>
      </div>
    </div>
  `;

  // 화면 참조 갱신
  screens.main   = document.getElementById('screen-main');
  screens.game   = document.getElementById('screen-game');
  screens.result = document.getElementById('screen-result');
}

// ─── 이벤트 바인딩 ───────────────────────────
function bindEvents() {
  document.getElementById('btn-consonant').addEventListener('click', () => startGame('consonant'));
  document.getElementById('btn-vowel').addEventListener('click',     () => startGame('vowel'));
  document.getElementById('btn-back').addEventListener('click',     () => {
    if (confirm('처음 화면으로 돌아갈까요?')) initMainScreen();
  });
  document.getElementById('btn-check').addEventListener('click', checkAnswer);
  document.getElementById('btn-next').addEventListener('click',  nextQuestion);
  document.getElementById('btn-retry').addEventListener('click', () => startGame(state.mode));
  document.getElementById('btn-home').addEventListener('click',  initMainScreen);
}

// ─── 앱 초기화 ────────────────────────────────
function init() {
  buildHTML();
  bindEvents();
  createDecoStars();
  initMainScreen();
  console.log('✅ 한글 자모음 복습 게임 시작!', WORDS.length + '개 낱말 로드됨');
}

init();
