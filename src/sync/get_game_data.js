import log from '../logger.js'
import file from './file.js'
import swgohClient from '../swgoh_client.js'
import getGasUnits from './get_gas_units.js'

const compressedSet = new Set([ 'units', 'campain', 'effect' ])

async function saveUnits( data = [], version, gitVersions = {} ){
  if(data.length === 0) return
  let saveSuccess = 0
  let units = await file.save('units.json.br', { version, data: data.filter(x=>x.obtainable === true && x.obtainableTime === "0") })
  if(units){
    gitVersions['units.json.br'] = version
    saveSuccess++
  }
  let units_pve = await file.save('units_pve.json.br', { version, data: data.filter(x=>x.obtainable !== true || x.obtainableTime !== "0") })
  if(units_pve){
    gitVersions['units_pve.json.br'] = version
    saveSuccess++
  }
  let gasUnits = getGasUnits(data.filter(x=>x.obtainable === true && x.obtainableTime === "0")), gasUnitsSave
  if(gasUnits?.length > 0) gasUnitsSave = file.save('units_gas.json', { version, data: gasUnits })
  if(gasUnitsSave){
    gitVersions['units_gas.json'] = version
    saveSuccess++
  }
  if(saveSuccess === 3) return true
}
async function getGameData( version, gitVersions = {} ){
  let count = 0, saveSuccess = 0
  let data = await swgohClient.getGameData(version)
  if(!data) return
  for(let i in data){
    if(!data[i] || data[i]?.length === 0) continue;
    count++;
    if(i === 'units'){
      let units = await saveUnits(data[i], version, gitVersions)
      if(units === true) saveSuccess++
    }else{
      let fileName = `${i}.json`
      if(compressedSet.has(i)) fileName += '.br'
      let status = await file.save(fileName, { version, data: data[i] })
      if(status){
        gitVersions[fileName] = version
        saveSuccess++
      }
    }
  }
  log.info(`Retrieved ${saveSuccess}/${count} files...`)
  if(count === saveSuccess) return true;
}
export default async function(version, gitVersions = {}){
  log.info(`Getting gameData Files for ${version}...`)
  let count = 0, saveSuccess = 0
  let enums = await swgohClient.getEnums()
  if(!enums || !enums['GameDataSegment']) throw('Error getting enums...')

  let enumSave = await file.save('enums.json', { version, data: enums })
  if(!enumSave) throw('Error saving enums...')

  gitVersions['enums.json'] = version

  return await await getGameData(version, gitVersions)
}
