import log from '../logger.js'
import fs from 'fs'
import zlib from 'node:zlib'
const DATA_DIR = process.env.DATA_DIR || '/app/data/files'

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
function read(fileName){
  try{
    let obj = fs.readFileSync(`${DATA_DIR}/${fileName}`)
    if(obj){
      if(fileName?.endsWith('.br')) return decompressData(obj)
      return JSON.parse(obj)
    }
  }catch(e){
    log.error(`error reading ${DATA_DIR}/${fileName}`)
  }
}
function save(fileName, data){
  try{
    let jsonString = JSON.stringify(data)
    if(fileName?.endsWith('.br')) jsonString = compressData(jsonString)
    fs.writeFileSync(`${DATA_DIR}/${fileName}`, jsonString)
    return true
  }catch(e){
    log.error(e)
  }
}
export default { read, save }
