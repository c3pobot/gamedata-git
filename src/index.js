import log from './logger.js'
import swgohClient from './swgoh_client.js'
import getInitalFiles from './get_initial_files.js'
import sync from './sync/index.js'

async function checkFiles(){
  try{
    let status = await getInitalFiles()
    if(status) return checkClient()
    setTimeout(checkFiles, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkFiles, 5000)
  }
}
async function checkClient(){
  try{
    let meta = await swgohClient.getMetaData()
    if(meta?.latestGamedataVersion){
      log.info(`SWGoH API is ready...`)
      return sync.start()
    }
    setTimeout(checkClient, 5000)
  }catch(e){
    log.error(e)
    setTimeout(checkClient, 5000)
  }
}
checkFiles()
