import  storage from 'store'
import md5 from 'md5';
const TokenKey = 'Access-Token'

const MachineModel = 'Machine-Model'
const MachineNumber = 'Machine-Number'
const Language = 'Language'
const Dir = 'Dir'
const CurrentDir = 'CurrentDir'


export function setCurrentDir(val) {
  return storage.set(CurrentDir, val)
}
export function getCurrentDir() {
  return storage.get(CurrentDir)
}
export function setDir(val) {
  return storage.set(Dir, val)
}
export function getDir() {
  return storage.get(Dir)
}

export function setMachineModel(val) {
  return storage.set(MachineModel, val)
}
export function getMachineModel() {
  return storage.get(MachineModel)
}


export function setMachineNumber(val) {
  return storage.set(MachineNumber, val)
}
export function getMachineNumber() {
  return storage.get(MachineNumber)
}

export function setLanguage(val) {
  return storage.set(Language, val)
}
export function getLanguage() {
  const ll= storage.get(Language)
  if (ll=="en") {
    return "us"
  }
  return ll
}

export function getToken() {
  return storage.get(TokenKey)
}

export function setToken(token) {
  return storage.set(TokenKey, token)
}



export function removeToken() {
  return storage.remove(TokenKey)
}

export function getApiHeader(inObject,uri) {
  inObject.uri = "/" + uri
  var ll = getLanguage()
  if (!ll) {
    ll = "en"
  }
  let machineNumber = getMachineNumber()
    return { 
      "System-Version": "1.0.0",
      "Source":"2",
      "Machine-Model": "web",
      "Machine-Number": machineNumber,
      "Language": ll, 
      'Sign': getSign(inObject,uri),
    }
}

export function getSign(inObject,uri) {
  var sorter = function (inObject) {
    var sortedJson = {};
    var sortedKeys = Object.keys(inObject).sort();
    for (var i = 0; i < sortedKeys.length; i++) {
        sortedJson[sortedKeys[i]] = inObject[sortedKeys[i]]
    }
    return sortedJson;
  }
  var sortedParam = sorter(inObject);
  var needSignatureStr = "";
  for (var key in sortedParam) {
      var value = sortedParam[key];
      if (uri == "api/v2/upload/complete") {
         if (key == "eTags") {
          continue
         }
      }
      needSignatureStr = needSignatureStr + key + '=' + value + '&';
  }
  needSignatureStr = needSignatureStr.substring(0, needSignatureStr.length - 1)
  needSignatureStr +=  process.env.VUE_APP_API_SECRETKEY || 'O9EfpIx4g9o8TKuCv2n5msBHucSrAf';
  console.log("needSignatureStr", needSignatureStr)
  return  md5(needSignatureStr);
}



