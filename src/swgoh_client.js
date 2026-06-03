import log from './logger.js'
const CLIENT_URL = process.env.CLIENT_URL, retryCount = 6

async function parseResponse(r){
  let contentType = r?.headers.get("content-type")
  if(contentType && contentType?.indexOf("application/json") !== -1) return await r?.json()
}
async function apiRequest(url, opts = {}){
  try{
    opts.signal = AbortSignal.timeout(60000)
    let r = await fetch(url, opts)
    return await parseResponse(r)
  }catch(e){
    if(e?.name) return { error: e.name, message: e.message, ok: false }
    log.error(e)
  }
}
async function requestWithRetry(url, opts = {}, count = 0){
  try{
    let res = await apiRequest(url, opts)
    count++
    if((!res || res?.error?.startsWith('TypeError')) && count < retryCount) return await requestWithRetry(url, opts, count)
    if(res && !res?.error && !res?.code) return res
    if(res) log.error(JSON.stringify(res))
  }catch(e){
    log.error(e)
  }
}
async function getGameData(version){
  try{
    let opts = { compress: true, method: 'POST', headers: { 'Content-Type': 'application/json' } }
    opts.body = JSON.stringify({ payload: { version: version,  includePveUnits: true,  items: '-1' }})
    return await requestWithRetry(`${CLIENT_URL}/data`, opts)
  }catch(e){
    throw(e)
  }
}
async function getLocale(version){
  try{
    let opts = { compress: true, method: 'POST', headers: { 'Content-Type': 'application/json' } }
    opts.body = JSON.stringify({ payload: { id: version } })
    return await requestWithRetry(`${CLIENT_URL}/localization`, opts)
  }catch(e){
    throw(e)
  }
}
async function getMetaData(){
  try{
    let opts = { compress: true, method: 'POST' }
    let r = await fetch(`${CLIENT_URL}/metadata`, opts)
    return await requestWithRetry(`${CLIENT_URL}/metadata`, opts)
  }catch(e){
    throw(e)
  }
}
async function getEnums(){
  try{
    let opts = { compress: true, method: 'GET' }
    return await requestWithRetry(`${CLIENT_URL}/enums`, opts)
  }catch(e){
    throw(e)
  }
}
export default { getGameData, getLocale, getMetaData, getEnums }
