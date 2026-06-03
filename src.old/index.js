'use strict'
const fs = require('fs')
const log = require('logger')
const SYNC_INTERVAL = +(process.env.SYNC_INTERVAL || 1)
const versions = {
  gameVersion: '',
  localeVersion: '',
  assetVersion: ''
}
const GameClient = require('./client')
const gitClient = require('./gitClient')
const updateData = require('./updateData')
const readFile = require('./readFile')
const DATA_DIR = process.env.DATA_DIR || '/app/data/files', GIT_REPO = process.env.GIT_REPO, GIT_USER = process.env.GITHUB_USER_NAME, GIT_TOKEN = process.env.GITHUB_TOKEN, GIT_EMAIL = process.env.GITHUB_USER_EMAIL

const getInitalFiles = async()=>{
  try{
    let status = true
    if(fs.existsSync(`${DATA_DIR}/.git`)){
      log.info(`${DATA_DIR}/.git exists. Trying git pull...`)
      status = await gitClient.config({ dir: DATA_DIR, user: GIT_USER, email: GIT_EMAIL })
      if(status) status = await gitClient.pull(DATA_DIR)

    }
    if(!status){
      log.info(`Error with git pull deleting ${DATA_DIR}...`)
      await fs.rmSync(DATA_DIR, { recursive: true, force: true })
      await fs.mkdirSync(DATA_DIR, { recursive: true })
      setTimeout(getInitalFiles, 5000)
      return
    }
    if(!status){
      log.info(`Trying git clone...`)
      status = await gitClient.clone({ repo: GIT_REPO, dir: DATA_DIR, user: GIT_USER, token: GIT_TOKEN })
      if(status) status = await gitClient.config({ dir: DATA_DIR, user: GIT_USER, email: GIT_EMAIL })
    }
    if(status){
      log.info(`git pull successfull...`)
      checkAPIReady()
      return
    }
    setTimeout(getInitalFiles, 5000)
  }catch(e){
    log.error(e)
    setTimeout(getInitalFiles, 5000)
  }
}
const checkAPIReady = async()=>{
  try{
    let meta = await GameClient.getMetaData()
    if(meta?.latestGamedataVersion){
      log.info(`SWGoH API is ready...`)
      startSync()
      return
    }
    setTimeout(checkAPIReady, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkAPIReady, 5000)
  }
}
const startSync = async()=>{
  try{
    let meta = await GameClient.getMetaData()
    if(meta?.latestGamedataVersion && (versions.gameVersion !== meta.latestGamedataVersion || versions.localeVersion !== meta.latestLocalizationBundleVersion || versions.assetVersion !== meta?.assetVersion)) await updateData(versions, meta)
    setTimeout(startSync, SYNC_INTERVAL * 10 * 1000)
  }catch(e){
    log.error(e)
    setTimeout(startSync, 5000)
  }
}
getInitalFiles()
