const http = require('http');
const Koa = require('koa');
const Route = require('koa-router')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')
const multer = require('@koa/multer')
const fs = require('fs-extra')
const path = require('path')
const cors = require('koa2-cors');
const constants = require('./consts.js')
const utils = require('./utils.js')

const upload = multer()

const app = new Koa();

const router = new Route()

router.get('/users', (ctx, next) => {
  ctx.body = 'hello world'
})
  .get('/', (ctx, next) => {
    ctx.body = 'Wendy'
  })
  .post('/upload', upload.single('file'), async (ctx, next) => {
    const file = ctx.request.file
    const fileMd5Value = ctx.request.body.fileMd5Value
    const index = ctx.request.body.index
    const folderPath = path.resolve(__dirname, `../public/uploads/${fileMd5Value}`)
    const isFolderExist = await utils.isExist(folderPath)
    if (isFolderExist) {
      await fs.writeFile(path.resolve(folderPath, index + ''), file.buffer)
    } else {
      fs.ensureDirSync(folderPath)
      await fs.writeFile(path.resolve(folderPath, index + ''), file.buffer)
    }
    ctx.body = 'uploaded'
    next()
  })
  .get('/check', async (ctx, next) => {
    const query = ctx.request.query
    const filename = query.fileName
    const fileMd5 = query.fileMd5Value
    console.log(constants.uploadPath)
    const data = await utils.getChunkList(
      path.join(constants.uploadPath, filename),
      path.join(constants.uploadPath, fileMd5),
    )
    ctx.body = data
    next()
  })
  .get('/merge', async (ctx, next) => {
    const fileName = ctx.request.query.fileName
    const fileMd5Value = ctx.request.query.fileMd5Value
    const folderPath = path.resolve(__dirname, `../public/uploads/${fileMd5Value}`)
    const fileList = await utils.listDir(folderPath)
    const filePath = path.resolve(__dirname, `../public/uploads/${fileName}`)
    const writable = fs.createWriteStream(filePath, { autoClose: false })
    writable.on('close', () => {
      fs.rm(folderPath, { recursive: true, force: true })
    })
    utils.mergeRecursive(fileList, writable, folderPath)
    ctx.body = 'done'
    next()
  })

app
  .use(cors({
    origin: '*',
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
  }))
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

http.createServer(app.callback()).listen(8000);
