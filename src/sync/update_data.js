import log from '../logger.js'
import file from './file.js'
import gitClient from '../git_client/index.js'
import getGameData from './get_game_data.js'
import getLocale from './get_locale.js'
import dataBuilder from './data_builder.js'

import { versions }  from './version_list.js'
const DATA_DIR = process.env.DATA_DIR || '/app/data/files'

export default async function( meta = {} ){
  try{
    let status = await gitClient.pull(DATA_DIR)
    if(!status) return log.error(`Error with git pull`)

    let gitVersions = await file.read('allVersions.json')
    if(!gitVersions) gitVersions = {}
    if(gitVersions.gameVersion === meta.latestGamedataVersion && gitVersions.localeVersion === meta.latestLocalizationBundleVersion && gitVersions.assetVersion === meta.assetVersion){
      status = await gitClient.push(DATA_DIR, meta.latestGamedataVersion)
      if(status){
        versions.gameVersion = meta.latestGamedataVersion, versions.localeVersion = meta.latestLocalizationBundleVersion, versions.assetVersion = meta.assetVersion
        return log.info(`local versions match gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`)
      }
    }

    status = await file.save('meta.json', { version: meta.latestGamedataVersion, data: meta }, false)
    if(status){
      gitVersions['meta.json'] = meta.latestGamedataVersion
      status = await getGameData(meta.latestGamedataVersion, gitVersions)
    }
    if(status) status = await getLocale(meta.latestLocalizationBundleVersion, gitVersions)

    if(status) status = await dataBuilder(meta.latestGamedataVersion, gitVersions)
    if(status){
      gitVersions.gameVersion = meta.latestGamedataVersion
      gitVersions.localeVersion = meta.latestLocalizationBundleVersion
      gitVersions.assetVersion = meta.assetVersion
      status = await file.save('allVersions.json', gitVersions)
    }
    if(status) status = await gitClient.push(DATA_DIR, meta.latestGamedataVersion)
    if(status){
      versions.gameVersion = meta.latestGamedataVersion
      versions.localeVersion = meta.latestLocalizationBundleVersion
      versions.assetVersion = meta.assetVersion
      log.info(`git versions updated to gameVersion ${versions.gameVersion}, localeVersion ${versions.localeVersion}, assetVersion ${versions.assetVersion}`)
    }
  }catch(e){
    log.error(e)
  }
}
