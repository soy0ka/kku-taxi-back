export default function calculate (positiveReviews: number, negativeReviews: number): number {
  const baseTemperature = 36.5
  const weightInRange = 0.5
  const weightOutOfRange = 0.2

  // 부정적 평가에 대한 가중치 설정
  const negativeWeight = negativeReviews <= 5 ? negativeReviews * 1.25 : (5 * 1.25) + Math.log(negativeReviews - 4) * 2.5

  // 온도를 조정하는 기본 값 설정
  const temperatureAdjustment = positiveReviews * 0.5 - negativeWeight * 1.33

  // 임시 온도 계산
  const tempTemperature = baseTemperature + temperatureAdjustment

  // 가중치를 적용하여 최종 온도 계산
  let finalTemperature: number
  if (tempTemperature >= 15 && tempTemperature <= 50) {
    finalTemperature = baseTemperature + temperatureAdjustment * weightInRange
  } else {
    finalTemperature = baseTemperature + temperatureAdjustment * weightOutOfRange
  }

  // 온도를 0에서 100 사이로 제한
  finalTemperature = Math.max(0, Math.min(100, finalTemperature))

  return finalTemperature
}
