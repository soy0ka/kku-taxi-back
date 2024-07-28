import { ApiResponse, ApiResponseType, CustomErrorCodeType, CustomErrorMessage } from '../types/Response'

function success (data: object): ApiResponse {
  return {
    status: ApiResponseType.SUCCESS,
    data
  }
}

function error (code: CustomErrorCodeType): ApiResponse {
  return {
    status: ApiResponseType.ERROR,
    error: {
      code,
      message: CustomErrorMessage(code)
    }
  }
}

export default { success, error }
