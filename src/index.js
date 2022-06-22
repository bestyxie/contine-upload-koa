const http = require('http');
const Koa = require('koa');
const Route = require('koa-router')
const bodyParser = require('koa-bodyparser')
const multer = require('@koa/multer')
const fs = require('node:fs')
const path = require('path')

const upload = multer()

const app = new Koa();

const router = new Route()

router.get('/users', (ctx, next) => {
  ctx.body = 'hello world'
})
.get('/', (ctx, next) => {
  ctx.body = 'Wendy'
})
.post('/upload', upload.single('avatar'), async (ctx, next) => {
  console.log(ctx.request.file)
  console.log(path.resolve(__dirname, './uploaed-assets'))
  fs.writeFileSync(path.resolve(__dirname, `./uploaed-assets`), ctx.request.file.buffer)
  const reader = fs.createReadStream(ctx.request.file.buffer)
  const upStream = fs.createWriteStream(path.resolve(__dirname, `./uploaed-assets/${ctx.request.file.originalname}`))
  reader.pipe(upStream)
  // await fs.writeFile(path.resolve(__dirname, `./uploaed-assets/${ctx.request.file.filename}`) , ctx.request.file.buffer)
  console.log(ctx.body)
  ctx.response.body = 'hhhh'
})

app
.use(bodyParser())
.use(router.routes())
.use(router.allowedMethods())

http.createServer(app.callback()).listen(8000);
