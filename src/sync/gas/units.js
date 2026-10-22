import file from '../file.js'
function getUnitTier( unitTier = [] ){
  let res = []
  for(let i in unitTier) res.push({ tier: unitTier[i].tier, equipmentSet: unitTier[i].equipmentSet })
  return res
}
function getGasData( units = [] ){
  let res = []
  for(let i in units){
    let tempObj = {
      baseId: units[i].baseId,
      categoryId: units[i].categoryId,
      combatType: units[i].combatType,
      crew: units[i].crew,
      descKey: units[i].descKey,
      exampleSquad: units[i].exampleSquad,
      forceAlignment: units[i].forceAlignment,
      id: units[i].id,
      legend: units[i].legend,
      maxRarity: units[i].maxRarity,
      maxLevelOverride: units[i].maxLevelOverride,
      nameKey: units[i].nameKey,
      obtainable: units[i].obtainable,
      obtainableTime: units[i].obtainableTime,
      rarity: units[i].rarity,
      skillReference: units[i].skillReference,
      limitBreakRef: units[i].limitBreakRef,
      uniqueAbilityRef: units[i].uniqueAbilityRef,
      basicAttackRef: units[i].basicAttackRef,
      leaderAbilityRef: units[i].leaderAbilityRef,
      thumbnailName: units[i].thumbnailName,
      unitTier: getUnitTier(units[i].unitTier || [])
    }
    res.push(tempObj)
  }
  return res
}
export default async function( data = [], version, gitVersions = {} ){
  if(data.length === 0) return
  let saveSuccess = 0
  let status = await file.save('units.json.br', { version, data: data.filter(x=>x.obtainable === true && x.obtainableTime === "0") })
  if(status){
    gitVersions['units.json.br'] = version
    saveSuccess++
  }
  status = await file.save('units_pve.json.br', { version, data: data.filter(x=>x.obtainable !== true || x.obtainableTime !== "0") })
  if(status){
    gitVersions['units_pve.json.br'] = version
    saveSuccess++
  }

  let gasData = getGasData(data.filter(x=>x.obtainable === true && x.obtainableTime === "0")), gasSave
  if(gasData?.length > 0) gasSave = file.save('units_gas.json', { version, data: gasData })
  if(gasSave){
    gitVersions['units_gas.json'] = version
    saveSuccess++
  }
  if(saveSuccess === 3) return true
}
