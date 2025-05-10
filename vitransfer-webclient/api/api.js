import request from '@/utils/request'
import { getApiHeader,getToken} from '@/api/auth'



export function login (parameter) {
  let uri = "api/v1/user/login"
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: getApiHeader(parameter,uri),
  })
}
export function getCode (parameter) {
  let uri = "api/v1/code/sms"
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: getApiHeader(parameter,uri),
  })
}
export function sendFiled (parameter) {
  let uri = "api/v1/file/send"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}

export function refreshLogin (parameter) {
  let uri = "api/v1/user/refreshLogin"
  let headers = getApiHeader(parameter,uri)
  console.info("headersheaders",headers)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}

export function getDeviceList (parameter) {
  let uri = "api/v1/userDevice"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}
export function getTimeId (parameter) {
  let uri = "api/v1/file/cacheTime"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'get',
    data:parameter,
    headers: headers,
  })
}
export function updateFileCacheTime (parameter) {
  let uri = "api/v1/file/cacheTime"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}
export function getAreaCode (parameter) {
  let uri = "api/v1/nation"
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: getApiHeader(parameter,uri),
  })
}



export function initUploadFile (parameter) {
  let uri = "api/v2/upload/init"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}
export function completeUploadFile (parameter) {
  let uri = "api/v2/upload/complete"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}
export function abortUploadFile (parameter) {
  let uri = "api/v2/upload/abort"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}

export function mkdir (parameter) {
  return request({
    url: "file/mkdir",
    method: 'post',
    data: parameter
  })
}

export function list (parameter) {
  let uri = "api/v1/file/list"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}

export function fileRemove (parameter) {
  let uri = "api/v1/file/del"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data:parameter,
    headers: headers,
  })
}

export function rename (parameter) {
  return request({
    url: "file/rename",
    method: 'post',
    data: parameter
  })
}

export function mvcp (parameter) {
  return request({
    url: "file/mvcp",
    method: 'post',
    data: parameter
  })
}

export function uploadCheck (parameter) {
  return request({
    url: "upload/check",
    method: 'post',
    data: parameter
  })
}

export function uploadFile (parameter) {
  let uri = "api/v1/file/uploadAll"
  console.info("uri",uri)
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data: parameter,
    headers: headers,

  })
}
export function getFileTypeList (parameter) {
  let uri = "api/v1/file/fileType"
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data: parameter,
    headers: headers,

  })
}

export function downloadFile (parameter) {
  let uri = "api/v1/file/path"
  console.info("uri",uri)
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data: parameter,
    headers: headers,

  })
}
export function getFileExt (parameter) {
  let uri = "api/v1/file/ext"
  console.info("uri",uri)
  let headers = getApiHeader(parameter,uri)
  headers.Authorization = "Bearer "+getToken()
  return request({
    url: uri,
    method: 'post',
    data: parameter,
    headers: headers,

  })
}

export function sharedList (parameter) {
  return request({
    url: "shared/list",
    method: 'post',
    data: parameter
  })
}

export function sharedCreate (parameter) {
  return request({
    url: "shared/create",
    method: 'post',
    data: parameter
  })
}

export function sharedInfo (parameter) {
  return request({
    url: "shared/info",
    method: 'post',
    data: parameter
  })
}

export function sharedPath (parameter) {
  return request({
    url: "shared/path",
    method: 'post',
    data: parameter
  })
}

export function sharedDownload (parameter) {
  return request({
    url: "shared/download",
    method: 'post',
    responseType:"blob",
    data: parameter
  })
}

export function sharedCancel (parameter) {
  return request({
    url: "shared/cancel",
    method: 'post',
    data: parameter
  })
}