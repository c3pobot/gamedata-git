async function parseResponse(res){
  if(!res) return
  let body, contentType = r?.headers.get("content-type")
  if(contentType && contentType?.indexOf("application/json") !== -1) body = await res?.json()
  if(!body && res?.status < 300) body = res.body
  if(body) return body
  if(res.status >= 400) return { status: res.status, message: res.statusText }
}
export default async function( uri, method = 'GET', body, headers ){
  let opts = { method, timeout: 60000, compress: true, headers: {'Content-Type': 'application/json'}, signal: AbortSignal.timeout(60000) }
  if(headers) opts.headers = {...req.headers,...headers}
  if(body) opts.body = body
  let r = await fetch(uri, opts)
  return await parseResponse(r)
}
