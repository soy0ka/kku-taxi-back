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
  "TOO_MANY_REQUESTS" = "429",

  "UNAUTHORIZED_TOKEN" = "A101",
  "INVALID_TOKEN" = "A102",
  "TOKEN_NOT_FOUND" = "A103",
  "USER_NOT_FOUND" = "A104",
  "TEMPARAY_DISABLE" = "A105",
  "DEVICE_NOT_FOUND" = "A106",

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
  "BANK_ACCOUNT_NOT_REGISTERED" = "U204",

  "NO_PERMISSION" = "P101",
  "ALREADY_PAID" =  "P102",
  "DATABASE_ERROR" = "S101",
  "UNKNOWN_ERROR" = "S999"
}
export type CustomErrorCodeType = `${CustomErrorCode}`

export interface ErrorDetail {
  code: ApiStatusCode
  message: string
}
const errorMessages: Record<CustomErrorCodeType, ErrorDetail> = {
  "404": { code: ApiStatusCode.NOT_FOUND, message: '요청하신 페이지를 찾을 수 없습니다' },
  "405": { code: ApiStatusCode.METHOD_NOT_ALLOWED, message: '요청한 메서드는 허용되지 않습니다' },
  "429": { code: ApiStatusCode.TOO_MANY_REQUESTS, message: '시간당 요청 횟수를 초과하였습니다' },
  "A101": { code: ApiStatusCode.UNAUTHORIZED, message: '인증에 실패하였습니다' },
  "A102": { code: ApiStatusCode.UNAUTHORIZED, message: '인증에 실패하였습니다' },
  "A103": { code: ApiStatusCode.UNAUTHORIZED, message: '인증에 실패하였습니다' },
  "A104": { code: ApiStatusCode.UNAUTHORIZED, message: '인증에 실패하였습니다' },
  "A106": { code: ApiStatusCode.UNAUTHORIZED, message: '디바이스 정보가 없습니다' },
  "A105": { code: ApiStatusCode.UNAUTHORIZED, message: '서비스 이용이 일시 혹은 영구적으로 제한되었습니다' },
  "C101": { code: ApiStatusCode.BAD_REQUEST, message: '인증코드가 만료되었습니다' },
  "C102": { code: ApiStatusCode.BAD_REQUEST, message: '인증코드가 만료되었습니다' },
  "I101": { code: ApiStatusCode.BAD_REQUEST, message: '필수 입력값이 누락되었습니다' },
  "I102": { code: ApiStatusCode.BAD_REQUEST, message: '입력값이 잘못되었습니다' },
  "I103": { code: ApiStatusCode.BAD_REQUEST, message: '이메일 형식이 잘못되었습니다' },
  "I104": { code: ApiStatusCode.BAD_REQUEST, message: '만료된 날짜입니다' },
  "R101": { code: ApiStatusCode.BAD_REQUEST, message: '요청하신 데이터가 잘못되었습니다' },
  "U101": { code: ApiStatusCode.NOT_FOUND, message: '채팅방 관련 문제가 발생했습니다' },
  "U201": { code: ApiStatusCode.NOT_FOUND, message: '파티 관련 문제가 발생했습니다' },
  "U202": { code: ApiStatusCode.BAD_REQUEST, message: '이미 가입된 파티입니다' },
  "U203": { code: ApiStatusCode.BAD_REQUEST, message: '파티가 꽉 찼습니다' },
  "U204": { code: ApiStatusCode.BAD_REQUEST, message: '계좌가 등록되지 않았습니다' },
  "P101": { code: ApiStatusCode.FORBIDDEN, message: '권한이 없습니다' },
  "P102": { code: ApiStatusCode.BAD_REQUEST, message: '이미 정산요청이 완료되었습니다' },
  "S101": { code: ApiStatusCode.INTERNAL_SERVER_ERROR, message: '서버에서 오류가 발생했습니다' },
  "S999": { code: ApiStatusCode.INTERNAL_SERVER_ERROR, message: '서버측에서 알 수 없는 오류가 발생했습니다' }
}

export function CustomErrorMessage(code: CustomErrorCodeType): ErrorDetail {
  return errorMessages[code] || errorMessages['S999']
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
