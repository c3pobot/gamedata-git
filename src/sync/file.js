import log from '../logger.js'
import fs from 'fs'
import zlib from 'node:zlib'
const DATA_DIR = '/app/data'

const brotliOptions = {
  params: {
    // Set compression level (0 to 11)
    [zlib.constants.BROTLI_PARAM_QUALITY]: 8,

    // Set text mode optimized for web assets (HTML, JS, CSS, JSON)
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,

    // Set sliding window size (10 to 24 bits)
    [zlib.constants.BROTLI_PARAM_LGWIN]: 24
  }
};

function compressData(jsonString){
  return zlib.brotliCompressSync(jsonString, brotliOptions)
}
function decompressData(compressedData){
  let decompressedBuffer = zlib.brotliDecompressSync(compressedData);
  let jsonString = decompressedBuffer.toString('utf8');
  if(jsonString) return JSON.parse(jsonString)
}
function read(fileName, dir = 'git/files'){
  try{
    let obj = fs.readFileSync(`${DATA_DIR}/${dir}/${fileName}`)
    if(obj){
      if(fileName?.endsWith('.br')) return decompressData(obj)
      if(fileName?.endsWith('.json')) return JSON.parse(obj)
      return obj
    }
  }catch(e){
    log.error(`error reading ${DATA_DIR}/${dir}/${fileName}`)
  }
}
function save(fileName, data, dir = 'git/files'){
  try{
    let jsonString = data
    if(fileName?.includes('.json')){
      jsonString = JSON.stringify(data)
     if(fileName?.endsWith('.br')) jsonString = compressData(jsonString)
    }
    if(!jsonString) return
    fs.writeFileSync(`${DATA_DIR}/${dir}/${fileName}`, jsonString)
    return true
  }catch(e){
    log.error(e)
  }
}
export default { read, save }
