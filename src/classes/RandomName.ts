const prefix = [
  '도도한',
  '귀여운',
  '시크한',
  '무뚝뚝한',
  '방황하는',
  '아름다운',
  '배고픈',
  '광란의',
  '피곤한'
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
  '교수님'
]

function getRandomCombination () {
  const randomPrefix = prefix[Math.floor(Math.random() * prefix.length)]
  const randomSuffix = suffix[Math.floor(Math.random() * suffix.length)]
  return randomPrefix + ' ' + randomSuffix
}

export default getRandomCombination
