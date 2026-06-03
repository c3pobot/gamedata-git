process.on('unhandledRejection', (error) => {
  console.error(`[unhandledRejection]`)
  console.error(error)
});
import './src/index.js'
