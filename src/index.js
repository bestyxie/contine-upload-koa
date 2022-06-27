const http = require('http');
const Koa = require('koa');
const Route = require('koa-router')
const bodyParser = require('koa-bodyparser')
const multer = require('@koa/multer')
const fs = require('node:fs/promises')
const path = require('path')
const cors = require('koa2-cors');

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
  console.log(path.resolve(__dirname, 'uploaed-assets'))
  await fs.writeFile(ctx.request.file.originalname , ctx.request.file.buffer)
  ctx.body = 'uploaded'
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
