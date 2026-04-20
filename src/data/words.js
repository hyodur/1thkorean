// =============================================
//  한글 자모음 복습 게임 - 단어 데이터
//  받침 없는 낱말만 사용 (1학년 수준)
//  복합모음(ㅘ,ㅙ 등)이 없는 단어만 사용
// =============================================

// 보기에 표시할 기본 자음·모음 목록
export const CONSONANTS = ['ㄱ','ㄴ','ㄷ','ㄹ','ㅁ','ㅂ','ㅅ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const VOWELS     = ['ㅏ','ㅑ','ㅓ','ㅕ','ㅗ','ㅛ','ㅜ','ㅠ','ㅡ','ㅣ'];

// 초성 19개 (유니코드 분해용)
const CHOSEONG_LIST  = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
// 중성 21개 (유니코드 분해용)
const JUNGSEONG_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];

// 복합 모음 (1학년 수준에서 제외)
const COMPLEX_VOWELS = new Set(['ㅐ','ㅒ','ㅔ','ㅖ','ㅘ','ㅙ','ㅚ','ㅝ','ㅞ','ㅟ','ㅢ']);

// 한글 한 글자 → 초성/중성/종성 분해
function decomposeHangul(char) {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return null;
  const jongseong = code % 28;
  const jungseong = Math.floor(code / 28) % 21;
  const choseong  = Math.floor(code / 28 / 21);
  return { choseong, jungseong, jongseong };
}

// 낱말 분석: 자음(초성)·모음(중성) 추출
function analyzeWord(word) {
  const consonants = new Set();
  const vowels     = new Set();
  for (const char of word) {
    const d = decomposeHangul(char);
    if (!d || d.jongseong !== 0) continue;
    const cho  = CHOSEONG_LIST[d.choseong];
    const jung = JUNGSEONG_LIST[d.jungseong];
    if (cho !== 'ㅇ') consonants.add(cho);  // 이응(ㅇ)은 초성에서 무음
    vowels.add(jung);
  }
  return {
    consonants: [...consonants],
    vowels:     [...vowels],
  };
}

// 받침이 있는지 확인
function hasBatchim(word) {
  for (const char of word) {
    const d = decomposeHangul(char);
    if (!d) return true;
    if (d.jongseong !== 0) return true;
  }
  return false;
}

// 복합 모음이 있는지 확인
function hasComplexVowel(word) {
  for (const char of word) {
    const d = decomposeHangul(char);
    if (!d) return true;
    const jung = JUNGSEONG_LIST[d.jungseong];
    if (COMPLEX_VOWELS.has(jung)) return true;
  }
  return false;
}

// ─── 원시 단어 목록 ───────────────────────────
// 받침 없고, 복합모음 없는 낱말만 포함
const RAW_WORDS = [
  // 자연/동식물
  { word: '나무',   emoji: '🌳' },
  { word: '나비',   emoji: '🦋' },
  { word: '고구마', emoji: '🍠' },
  { word: '포도',   emoji: '🍇' },
  { word: '토마토', emoji: '🍅' },
  { word: '오리',   emoji: '🦆' },
  { word: '여우',   emoji: '🦊' },
  { word: '하마',   emoji: '🦛' },
  { word: '고래',   emoji: '🐋' },
  { word: '사자',   emoji: '🦁' },
  { word: '거미',   emoji: '🕷️' },
  { word: '모기',   emoji: '🦟' },
  { word: '개미',   emoji: '🐜' },
  { word: '기러기', emoji: '🪿' },
  { word: '타조',   emoji: '🦤' },
  { word: '치타',   emoji: '🐆' },
  { word: '두부두부', emoji: '🫙' },
  { word: '제비',   emoji: '🐦' },
  { word: '키위',   emoji: '🥝' },
  { word: '자두',   emoji: '🍑' },
  { word: '바나나', emoji: '🍌' },
  { word: '파파야', emoji: '🍈' },
  { word: '오이',   emoji: '🥒' },
  { word: '파도',   emoji: '🌊' },
  { word: '바다',   emoji: '🌊' },
  { word: '모래',   emoji: '🏖️' },
  { word: '보리',   emoji: '🌾' },
  { word: '나리',   emoji: '🌸' },
  { word: '고사리', emoji: '🌿' },
  // 사물
  { word: '모자',   emoji: '🎩' },
  { word: '기차',   emoji: '🚂' },
  { word: '구두',   emoji: '👞' },
  { word: '치마',   emoji: '👗' },
  { word: '바지',   emoji: '👖' },
  { word: '의자',   emoji: '🪑' },
  { word: '피아노', emoji: '🎹' },
  { word: '소파',   emoji: '🛋️' },
  { word: '도끼',   emoji: '🪓' },
  { word: '가위',   emoji: '✂️' },
  { word: '부채',   emoji: '🪭' },
  { word: '호두',   emoji: '🌰' },
  { word: '비누',   emoji: '🧼' },
  { word: '바위',   emoji: '🪨' },
  { word: '그네',   emoji: '🎢' },
  { word: '지구',   emoji: '🌍' },
  // 음식
  { word: '피자',   emoji: '🍕' },
  { word: '두부',   emoji: '🫙' },
  { word: '우유',   emoji: '🥛' },
  { word: '코코아', emoji: '☕' },
  { word: '소시지', emoji: '🌭' },
  // 사람/신체
  { word: '아버지', emoji: '👨' },
  { word: '어머니', emoji: '👩' },
  { word: '아이',   emoji: '👦' },
  { word: '다리',   emoji: '🦵' },
  { word: '머리',   emoji: '👤' },
  { word: '이마',   emoji: '😐' },
  { word: '허리',   emoji: '🫀' },
  // 기타
  { word: '도레미', emoji: '🎵' },
  { word: '무지개', emoji: '🌈' },
  { word: '소나기', emoji: '🌦️' },
  { word: '이야기', emoji: '📖' },
  { word: '허수아비', emoji: '🌾' },
  { word: '도우미', emoji: '🙋' },
  { word: '미소',   emoji: '😊' },
  { word: '바보',   emoji: '😜' },
  { word: '두더지', emoji: '🐭' },
  { word: '지우개', emoji: '✏️' },
  { word: '보자기', emoji: '🎁' },
];

// ─── 유효한 단어 필터링 ───────────────────────
const seenWords = new Set();
export const WORDS = RAW_WORDS
  .filter(w => {
    if (seenWords.has(w.word)) return false;     // 중복 제거
    if (w.word.length < 2)     return false;     // 2글자 이상
    if (hasBatchim(w.word))    return false;     // 받침 없는 것만
    if (hasComplexVowel(w.word)) return false;  // 복합모음 없는 것만
    seenWords.add(w.word);
    return true;
  })
  .map(w => ({
    ...w,
    ...analyzeWord(w.word),
  }))
  // 자음복습: 자음이 1개 이상인 단어만 / 모음복습: 모음이 1개 이상인 단어만 (모두 해당)
  .filter(w => w.consonants.length >= 1 || w.vowels.length >= 1);

// ─── 무작위 단어 선택 ────────────────────────
export function getRandomWords(n = 10) {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// ─── 모드별 무작위 단어 선택 ─────────────────
export function getRandomWordsByMode(mode, n = 10) {
  const filtered = WORDS.filter(w =>
    mode === 'consonant' ? w.consonants.length >= 1 : w.vowels.length >= 1
  );
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// ─── 보기(선택지) 생성 ────────────────────────
// 정답을 모두 포함하면서 오답을 섞어 총 5개 구성
export function generateChoices(correctAnswers, allOptions, totalChoices = 5) {
  const correct  = [...correctAnswers];
  const wrong    = allOptions.filter(o => !correct.includes(o));
  const shuffledWrong = wrong.sort(() => Math.random() - 0.5);
  const needed   = Math.max(0, totalChoices - correct.length);
  const choices  = [...correct, ...shuffledWrong.slice(0, needed)];
  return choices.sort(() => Math.random() - 0.5);
}
