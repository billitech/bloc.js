export type JsonObject = { [key: string]: any }

export interface ApiResponse<T> {
  status: boolean // Indicates the success of the API call
  statusCode?: string | null // A status code representing the response status code
  responseCode?: string | null // A responseCode code representing the response code
  message: string // A message providing more detail about the response
  data?: T | null // The main data payload of the response
  errors?: Record<string, string> | null // Errors related to the API call, if any
}

export function createApiResponse<T>(
  json: JsonObject,
  dataFromJson: (json: JsonObject) => T,
): ApiResponse<T> {
  return {
    status: json.status as boolean,
    responseCode: json.responseCode as string,
    message: json.message as string,
    data: json.data ? dataFromJson(json.data) : undefined,
    errors: json.errors ? (json.errors as Record<string, string>) : undefined,
  }
}

export function apiResponseToJson<T>(
  response: ApiResponse<T>,
  dataToJson: (data: T) => JsonObject,
): JsonObject {
  return {
    status: response.status,
    responseCode: response.responseCode,
    message: response.message,
    data: response.data ? dataToJson(response.data) : undefined,
    errors: response.errors ?? {}, // Return an empty object if errors are undefined
  }
}
