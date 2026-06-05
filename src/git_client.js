import log from './logger.js'
import shell from 'shelljs'

const DATA_DIR = process.env.DATA_DIR || '/app/data', GIT_REPO = process.env.GIT_REPO, GIT_USER = process.env.GITHUB_USER_NAME, GIT_TOKEN = process.env.GITHUB_TOKEN, GIT_EMAIL = process.env.GITHUB_USER_EMAIL
if(!GIT_REPO || !GIT_TOKEN || !GIT_EMAIL || !GIT_USER) throw `Missing GIT info`
const GIT_DIR = `${DATA_DIR}/git/files`

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
  let status = await shellCmd('git pull', { cwd: GIT_DIR })
  log.info(`starting git push...`)
  if(status) status = await shellCmd('git add .', { cwd: GIT_DIR })
  if(status) status = await shellCmd(`git commit -m ${commitMsg || 'update'}`, { cwd: GIT_DIR })
  status = await shellCmd('git push', { cwd: GIT_DIR })
  log.info(`git push done...`)
  return status
}
async function clone(){
  let uri = `https://${GIT_USER}:${GIT_TOKEN}@github.com/${GIT_REPO}.git`
  log.info(`starting git clone...`)
  let status = await shellCmd(`git clone --depth=1 --single-branch --branch='main' ${uri} ${GIT_DIR}`)
  log.info(`git clone done...`)
  return status
}
async function pull(){
  log.info(`starting git pull...`)
  let status = await shellCmd(`git pull`, { cwd: GIT_DIR })
  log.info(`git pull done`)
  return status
}
async function config(){
  let status = await shellCmd(`git config --global user.email "${GIT_EMAIL}"`)
  if(status) status = await shellCmd(`git config --global user.name "${GIT_USER}"`)
  if(status) status = await shellCmd(`git config --global --add safe.directory ${GIT_DIR}`)
  if(status) return true
}
export default { clone, config, push, pull}
