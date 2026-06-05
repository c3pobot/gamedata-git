import log from '../logger.js'
import shell from 'shelljs'
import fetch from './fetch.js'

const DATA_DIR = process.env.DATA_DIR || '/app/data/files', GIT_REPO = process.env.GIT_REPO, GIT_USER = process.env.GITHUB_USER_NAME, GIT_TOKEN = process.env.GITHUB_TOKEN, GIT_EMAIL = process.env.GITHUB_USER_EMAIL
if(!GIT_REPO || !GIT_TOKEN || !GIT_EMAIL || !GIT_USER) throw `Missing GIT info`

function base64ToJson(str){
  if(!str) return
  let json = Buffer.from(str, 'base64').toString()
  if(json) return JSON.parse(json)
}
async function get( fileName ){
  if(!fileName) return
  let uri = `https://api.github.com/repos/${GIT_REPO}/contents/${fileName}`, headers
  if(GIT_TOKEN) header = { 'Authorization': `Bearer ${GIT_TOKEN}` }
  return await fetch(uri, 'GET', null, headers)
}
async function getSha( opt = {} ){
  if(!opt.repo || !opt.fileName) return
  let file = await get(opt)
  return file?.sha
}
async function list( dir){
  let uri = `https://api.github.com/repos/${GIT_REPO}/contents`, headers
  if(dir) uri += `/${dir}`
  if(GIT_TOKEN) header = { 'Authorization': `Bearer ${GIT_TOKEN}` }
  return await fetch(uri, 'GET', null, headers)
}
function shellCmd(cmd, opts = {}){
  if(!cmd) return
  return new Promise((resolve)=>{
    let child = shell.exec(cmd, opts, (code, stdout, stderr)=>{
        if(!code) resolve(true)
        resolve()
    })
  })
}
async function push( commitMsg ){
  let status = await shellCmd('git pull', { cwd: DATA_DIR })
  log.info(`starting git push...`)
  if(status) status = await shellCmd('git add .', { cwd: DATA_DIR })
  if(status) status = await shellCmd(`git commit -m ${commitMsg || 'update'}`, { cwd: DATA_DIR })
  status = await shellCmd('git push', { cwd: DATA_DIR })
  log.info(`git push done...`)
  return status
}
async function clone(){
  let uri = `https://github.com/${GIT_REPO}.git`
  log.info(`starting git clone...`)
  let status = await shellCmd(`git clone --depth=1 --single-branch --branch='main' ${uri} ${DATA_DIR}`)
  log.info(`git clone done...`)
  return status
}
async function pull(){
  log.info(`starting git pull...`)
  let status = await shellCmd(`git pull`, { cwd: DATA_DIR })
  log.info(`git pull done`)
  return status
}
async function getJson( opt = {} ){
  if(!opt.repo || !opt.fileName) return
  let file = await get(opt)
  return base64ToJson(file?.content)
}
async function config(){
  let status = await shellCmd(`git config --global user.email "${GIT_EMAIL}"`)
  if(status) status = await shellCmd(`git config --global user.name "${GIT_USER}"`)
  if(status) status = await shellCmd(`git config --global --add safe.directory ${DATA_DIR}`)
  if(status) return true
}
export default { clone, config, push, pull}
