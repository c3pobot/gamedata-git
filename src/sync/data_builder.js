import log from '../logger.js'
import getDataFiles from './get_data_files.js'
import buildData from './build_data.js'
import file from './file.js'

export default async function( version, gitVersions = {} ){
  if(!version) return
  log.info('creating gameData.json for version '+version)
  let gameData = await file.read('gameData.json')
  if(!gameData) gameData = {}

  if(gameData?.version === version && gameData?.data){
    gitVersions['gameData.json'] = version
    return true
  }
  let data = await getDataFiles(version)
  if(!data) return

  gameData.data = buildData(data)
  if(!gameData.data) return

  let status = await file.save('gameData.json', { version, data: gameData.data })
  if(status){
    log.info('gameData.json updated to version '+version+'...')
    gitVersions['gameData.json'] = version
    return true
  }
  log.error('error updating gameData.json')
}
