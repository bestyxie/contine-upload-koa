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
    const filename = query.filename
    const fileMd5 = query.fileMd5
    getChunkList(
      path.join(constants.uploadPath, filename),
      path.join(constants.uploadPath, fileMd5),
      (data) => {
        ctx.body = data
      }
    )
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

// app
//   // .use(bodyParser())
//   .use(koaBody({
//     multipart: true,
//     formidable: {
//       // uploadDir: path.join(__dirname, 'public/uploads'),
//       // keepExtensions: true,
//       // multipart: true,
//       maxFileSize: 200 * 1024 * 1024
//     },
//   }))
//   .use(router.routes())
//   .use(router.allowedMethods())

http.createServer(app.callback()).listen(8000);
