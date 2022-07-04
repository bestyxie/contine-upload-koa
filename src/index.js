const http = require('http');
const Koa = require('koa');
const Route = require('koa-router')
const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body')
const multer = require('@koa/multer')
const fs = require('node:fs/promises')
const path = require('path')
const cors = require('koa2-cors');
const constants = require('./consts')

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
    console.log(ctx.request.file)
    console.log(__dirname, path.resolve(__dirname, '../public/uploads'))
    await fs.writeFile(path.resolve(__dirname, `../public/uploads/${ctx.request.file.originalname}`), ctx.request.file.buffer)
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
