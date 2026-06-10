import log from '../logger.js'
import fs from 'fs'
import file from './file.js'

const DATA_DIR = process.env.DATA_DIR || '/app/data'
const GIT_DIR = `${DATA_DIR}/git/files`

async function getFileNames(){
  try{
    let fileNames = await fs.readdirSync(GIT_DIR)
    if(fileNames?.length > 0) return fileNames?.filter(x=>x.endsWith('.json') || x.endsWith('.json.br') || x.endsWith('.md'))
  }catch(e){
    log.error(e)
  }
}
export default async function(gitVersions = {}){
  try{
    let fileNames = await getFileNames(), count = 0
    if(!fileNames || fileNames?.length == 0) return
    for(let f of fileNames){
      let data = await file.read(f)
      if(!data) continue
      if(data?.version){
        if(data.version !== gitVersions.gameVersion && data.version !== gitVersions.localeVersion) continue
      }
      count++
      let newFileName = f
      if(!newFileName?.endsWith('.br')) newFileName += '.br'
      let status = await file.save(newFileName, data, 'gd')
      if(!status) return
    }
    log.info(`compressed ${count} gd files for website...`)
    return true
  }catch(e){
    log.error(e)
  }
}
