import log from './logger.js'
import gitClient from './git_client.js'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR || '/app/data'
const GIT_DIR = `${DATA_DIR}/git/files`

export default async function(){
  try{
    let status = false
    if(fs.existsSync(`${GIT_DIR}/.git`)){
      log.info(`${GIT_DIR}/.git exists. Trying git pull...`)
      status = await gitClient.config()
      if(status) status = await gitClient.pull()
    }
    if(!status){
      log.info(`Error with git pull deleting ${GIT_DIR}...`)
      await fs.rmSync(GIT_DIR, { recursive: true, force: true })
      await fs.mkdirSync(GIT_DIR, { recursive: true })
    }
    if(!status){
      log.info(`Trying git clone...`)
      status = await gitClient.clone()
      if(status) status = await gitClient.config()
    }
    if(status) log.info(`git pull successfull...`)
    return status
  }catch(e){
    log.error(e)
  }
}
