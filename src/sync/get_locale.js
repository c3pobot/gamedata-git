import log from '../logger.js'
import swgohClient from '../swgoh_client.js'
import file from './file.js'
import JSZip from 'jszip'
import { createInterface } from 'readline'
import { once } from 'events'

async function processStreamByLine( fileStream ){
  const langMap = {};

  try {
    const rl = createInterface({
      input: fileStream,
      //crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const result = processLocalizationLine(line);
      if (result) {
        const [key, val] = result;
        langMap[key] = val;
      }
    });

    await once(rl, 'close');
  } catch (err) {
    log.error(err);
  }

  return langMap;
}

function processLocalizationLine(line){
  if (line.startsWith('#')) return;
  let [ key, val ] = line.split(/\|/g).map(s => s.trim());
  if (!key || !val) return;
  val = val.replace(/^\[[0-9A-F]*?\](.*)\s+\(([A-Z]+)\)\[-\]$/, (m,p1,p2) => p1);
  return [key, val];
}

export default async function( version, gitVersions = {} ){
  log.info(`Getting locale Files for ${version}...`)
  let count = 0, saveSuccess = 0
  let data = await swgohClient.getLocale(version)
  if(!data) return
  let zipped = await (new JSZip())
        .loadAsync(Buffer.from(data.localizationBundle, 'base64'), { base64:true });
  data = Object.entries(zipped.files)
  if(!data) return
  for(let [lang, content] of data){
    count++
    let fileStream = content.nodeStream();
    let langMap = await processStreamByLine(fileStream);
    if(!langMap) continue;
    let status = await file.save(`${lang}.json.br`, {version: version, data: langMap})
    if(status){
      gitVersions[`${lang}.json.br`] = version
      saveSuccess++
    }
  }
  log.info(`Retrieved ${saveSuccess}/${count} locale files`)
  if(count > 0 && count === saveSuccess) return true
}
