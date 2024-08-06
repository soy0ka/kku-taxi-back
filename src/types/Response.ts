export enum ApiResponseType {
  "SUCCESS" = 'success',
  "ERROR" = 'error'
}

export enum ApiStatusCode {
  "SUCCESS" = 200,
  "CREATED" = 201,
  "ACCEPTED" = 202,
  "BAD_REQUEST" = 400,
  "UNAUTHORIZED" = 401,
  "FORBIDDEN" = 403,
  "NOT_FOUND" = 404,
  "METHOD_NOT_ALLOWED" = 405,
  "TOO_MANY_REQUESTS" = 429,
  "INTERNAL_SERVER_ERROR" = 500
}

export enum CustomErrorCode {
  "PAGE_NOT_FOUND" = "404",
  "METHOD_NOT_ALLOWED" = "405",
  "UNAUTHORIZED_TOKEN" = "A101",
  "INVALID_TOKEN" = "A102",
  "TOKEN_NOT_FOUND" = "A103",
  "USER_NOT_FOUND" = "A104",
  "TEMPARAY_DISABLE" = "A105",
  "INVALID_AUTH_CODE" = "C101",
  "AUTH_CODE_EXPIRED" = "C102",

  "REQUIRED_FIELD" = "I101",
  "INVALID_FIELD" = "I102",
  "INVALID_EMAIL" = "I103",
  "DATE_EXPIRED" = "I104",

  "INVALID_PARAMS" = "R101",

  "CHATROOM_NOT_FOUND" = "U101",
  "PARTY_NOT_FOUND" = "U201",
  "ALREADY_PARTY_MEMEBER" = "U202",
  "PARTY_FULL" = "U203",

  "NO_PERMISSION" = "P101",
  "ALREADY_PAID" =  "P102",
  "DATABASE_ERROR" = "S101",
  "UNKNOWN_ERROR" = "S999"
}
export type CustomErrorCodeType = `${CustomErrorCode}`

const errorMessages: Record<CustomErrorCodeType, string> = {
  "404": '요청하신 경로를 찾을 수 없습니다',
  "405": '요청한 메서드는 허용되지 않습니다',
  "A101": '인증에 실패하였습니다',
  "A102": '인증에 실패하였습니다',
  "A103": '인증에 실패하였습니다',
  "A104": '인증에 실패하였습니다',
  "A105": '인증에 실패하였습니다',
  "C101": '인증코드가 만료되었습니다',
  "C102": '인증코드가 만료되었습니다',
  "I101": '입력값이 잘못되었습니다',
  "I102": '입력값이 잘못되었습니다',
  "I103": '입력값이 잘못되었습니다',
  "I104": '입력값이 잘못되었습니다',
  "R101": '요청하신 데이터가 잘못되었습니다',
  "U101": '채팅방 관련 문제가 발생했습니다',
  "U201": '파티 관련 문제가 발생했습니다',
  "U202": '파티 관련 문제가 발생했습니다',
  "U203": '파티 관련 문제가 발생했습니다',
  "P101": '권한 문제가 발생했습니다',
  "P102": '이미 결제되었습니다',
  "S101": '서버에서 오류가 발생했습니다',
  "S999": '서버측에서 알 수 없는 오류가 발생했습니다'
}

export function CustomErrorMessage(code: CustomErrorCodeType): string {
  return errorMessages[code] || '알 수 없는 오류가 발생했습니다';
}

export interface ApiErrorResponse {
  code: string
  message: string
}

export interface ApiResponse {
  status: ApiResponseType
  data?: object
  error?: ApiErrorResponse
}
