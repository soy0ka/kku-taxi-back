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

  "CHATROOM_NOT_FOUND" = "U101",
  "PARTY_NOT_FOUND" = "U201",
  "ALREADY_PARTY_MEMEBER" = "U202",
  "PARTY_FULL" = "U203",

  "NO_PERMISSION" = "P101",
  "ALREADY_PAID" =  "P102",
  "DATABASE_ERROR" = "S101",
}
export type CustomErrorCodeType = `${CustomErrorCode}`

export function CustomErrorMessage (code: CustomErrorCodeType): string {
  if (code.startsWith('A1')) return '인증에 실패하였습니다'
  else if (code.startsWith('I1')) return '입력값에 문제가 있습니다'
  else if (code.startsWith('C1')) return '인증코드가 만료되었습니다'
  else if (code.startsWith('U1')) return '채팅방 관련 문제가 발생했습니다'
  else if (code.startsWith('U2')) return '파티 관련 문제가 발생했습니다'
  else if (code.startsWith('P1')) return '권한 문제가 발생했습니다'
  else if (code.startsWith('S1')) return '서버에서 오류가 발생했습니다'
  return '알 수 없는 오류가 발생했습니다'
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
