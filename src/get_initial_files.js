import log from './logger.js'
import gitClient from './git_client/index.js'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR || '/app/data/files', GIT_REPO = process.env.GIT_REPO, GIT_USER = process.env.GITHUB_USER_NAME, GIT_TOKEN = process.env.GITHUB_TOKEN, GIT_EMAIL = process.env.GITHUB_USER_EMAIL

export default async function(){
  try{
    let status = false
    if(fs.existsSync(`${DATA_DIR}/.git`)){
      log.info(`${DATA_DIR}/.git exists. Trying git pull...`)
      status = await gitClient.config({ dir: DATA_DIR, user: GIT_USER, email: GIT_EMAIL })
      if(status) status = await gitClient.pull(DATA_DIR)

    }
    if(!status){
      log.info(`Error with git pull deleting ${DATA_DIR}...`)
      await fs.rmSync(DATA_DIR, { recursive: true, force: true })
      await fs.mkdirSync(DATA_DIR, { recursive: true })
    }
    if(!status){
      log.info(`Trying git clone...`)
      status = await gitClient.clone({ repo: GIT_REPO, dir: DATA_DIR, user: GIT_USER, token: GIT_TOKEN })
      if(status) status = await gitClient.config({ dir: DATA_DIR, user: GIT_USER, email: GIT_EMAIL })
    }
    if(status){
      log.info(`git pull successfull...`)
      return true
    }
  }catch(e){
    log.error(e)
  }
}
