import log from '../logger.js'
import shell from 'shelljs'
import fetch from './fetch.js'

function base64ToJson(str){
  if(!str) return
  let json = Buffer.from(str, 'base64').toString()
  if(json) return JSON.parse(json)
}
async function get( { repo, fileName, token } ){
  if(!repo || !fileName) return
  let uri = `https://api.github.com/repos/${repo}/contents/${fileName}`, headers
  if(token) header = { 'Authorization': `Bearer ${token}` }
  return await fetch(uri, 'GET', null, headers)
}
async function getSha( opt = {} ){
  if(!opt.repo || !opt.fileName) return
  let file = await get(opt)
  return file?.sha
}
async function list( { repo, token, dir } ){
  if(!repo) return
  let uri = `https://api.github.com/repos/${repo}/contents`, headers
  if(dir) uri += `/${dir}`
  if(token) header = { 'Authorization': `Bearer ${token}` }
  return await fetch(uri, 'GET', null, headers)
}
async function push( dir, commitMsg ){
  if(!dir) return
  let status = await shell.cd(dir)
  status = await shell.exec('git pull')
  log.info(`starting git push...`)
  if(status?.code == 0) status = await shell.exec('git add .')
  if(status?.code == 0) status = await shell.exec(`git commit -m ${commitMsg || 'update'}`)
  if(status?.code == 0 || status?.code == 1) status = await shell.exec('git push')
  log.info(`git push done...`)
  if(status?.code == 0) return true
}
async function clone( { repo, dir, user, token, branch } ){
  if(!repo || !dir || !user || !token) return
  let uri = `https://${user}:${token}@github.com/${repo}.git`
  log.info(`starting git clone...`)
  let status = await shell.exec(`git clone ${uri} ${dir}`)
  log.info(`git clone done...`)
  if(status?.code == 0) return true
}
async function pull( dir ){
  if(!dir) return
  await shell.cd(dir)
  log.info(`starting git pull...`)
  let status = await shell.exec(`git pull ${dir}`)
  log.info(`git pull done`)
  if(status?.code == 0) return true
}
async function getJson( opt = {} ){
  if(!opt.repo || !opt.fileName) return
  let file = await get(opt)
  return base64ToJson(file?.content)
}
async function config( { user, email, dir } ){
  let status = await shell.exec(`git config --global user.email "${email}"`)
  if(status?.code == 0) status = await shell.exec(`git config --global user.name "${user}"`)
  if(status?.code == 0) status = await shell.exec(`git config --global --add safe.directory ${dir}`)
  if(status?.code == 0) return true
}
export default { clone, config, get, getJson, getSha, list, push, pull}
