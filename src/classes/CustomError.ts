import { ApiStatusCode, CustomErrorCodeType, CustomErrorMessage } from '@/types/response'

export class CustomError extends Error {
  name: string
  statusCode: ApiStatusCode
  errorCode: CustomErrorCodeType

  constructor (errorCode: CustomErrorCodeType) {
    super(CustomErrorMessage(errorCode).message)
    this.name = this.constructor.name
    this.statusCode = CustomErrorMessage(errorCode).code
    this.errorCode = errorCode
    Error.captureStackTrace(this, this.constructor)
  }
}
