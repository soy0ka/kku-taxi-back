import { ApiResponse, ApiResponseType, CustomErrorCodeType, CustomErrorMessage } from '@/types/response'

function success (data: object): ApiResponse {
  return {
    status: ApiResponseType.SUCCESS,
    data
  }
}

function error (code: CustomErrorCodeType): ApiResponse {
  const errorDetail = CustomErrorMessage(code)
  return {
    status: ApiResponseType.ERROR,
    error: {
      code,
      message: errorDetail.message
    }
  }
}

export default { success, error }
