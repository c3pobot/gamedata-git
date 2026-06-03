import file from './file.js'
const compressedSet = new Set([ 'units', 'campain', 'effect' ])
const gameDataFilesNeeded = ['equipment', 'relicTierDefinition', 'skill', 'statModSet', 'statProgression', 'table', 'units', 'xpTable']

async function getDataFile(fileName, version){
  let obj = await file.read(fileName)
  if(obj?.version && obj?.data && obj?.version === version) return obj.data
}
export default async function(version){
  let data = {}, count = 0
  for(let i in gameDataFilesNeeded){
    let fileName = `${gameDataFilesNeeded[i]}.json`
    if(compressedSet.has(gameDataFilesNeeded[i])) fileName += '.br'
    let dataFile = await getDataFile(fileName, version)
    if(dataFile?.length > 0){
      data[gameDataFilesNeeded[i]] = dataFile
      count++
    }else{
      return;
    }
  }
  if(count > 0 && count === +gameDataFilesNeeded.length) return data
}
