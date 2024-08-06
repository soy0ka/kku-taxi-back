const prefix = [
  '도도한',
  '귀여운',
  '시크한',
  '무뚝뚝한',
  '방황하는',
  '아름다운',
  '배고픈',
  '광란의',
  '피곤한',
  '미소짓는',
  '무서운',
  '활기찬',
  '용감한',
  '겁먹은',
  '친절한',
  '출근하는',
  '퇴는하는',
  '야근중인',
  '배달앱킨'
]

const suffix = [
  '고양이',
  '강아지',
  '토끼',
  '카피바라',
  '펠리컨',
  '너구리',
  '판다',
  '라쿤',
  '수달',
  '햄스터',
  '펭귄',
  '기니피그',
  '타조',
  '앵무새',
  '늑대',
  '피카츄',
  '독수리',
  '황조롱이',
  '뻐꾸기',
  '토끼',
  '교수님',
  '대학원생'
]

function getRandomCombination () {
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)]
  const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)]
  return randomPrefix + ' ' + randomSuffix
}

export default getRandomCombination
