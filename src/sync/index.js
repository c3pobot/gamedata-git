import log from '../logger.js'
import swgohClient from '../swgoh_client.js'
import { versions } from './version_list.js'
import updateData from './update_data.js'

const SYNC_INTERVAL = +( process.env.SYNC_INTERVAL || 1 )
async function sync(){
  try{
    let meta = await swgohClient.getMetaData()
    if(meta?.latestGamedataVersion && (versions.gameVersion !== meta.latestGamedataVersion || versions.localeVersion !== meta.latestLocalizationBundleVersion || versions.assetVersion !== meta?.assetVersion)){
      await updateData(meta)
    }
    setTimeout(sync, SYNC_INTERVAL * 10 * 1000)
  }catch(e){
    log.error(e)
    setTimeout(sync, 5000)
  }
}
export default { start: sync }
