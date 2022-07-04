// setTimeout(function () { console.log(1) }, 0)
// setTimeout(function () { console.log(2) }, 0)
// setImmediate(function () { console.log('imme 1') })
// setImmediate(function () { console.log('imme 2') })

const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('timeout 1');
    Promise.resolve(10).then(() => console.log('4'))
    setTimeout(() => console.log('timeout 4'))
  }, 0);
  setTimeout(() => {
    console.log('timeout 2');
    Promise.resolve(10).then(() => console.log('5'))
  }, 0);
  setImmediate(() => {
    Promise.resolve(10).then(() => console.log('3'))
    console.log('immediate 1');
    setImmediate(() => {
      console.log('immediate 3');
    });
  });
  setImmediate(() => {
    console.log('immediate 2');
  });
  setTimeout(() => {
    console.log('timeout 3');
  }, 0);
  process.nextTick(() => console.log('n 1'))
  process.nextTick(() => console.log('n 2'))
  Promise.resolve(10).then(() => console.log('1'))
  Promise.resolve(10).then(() => console.log('2'))
  new Promise(r => setTimeout(() => { console.log('p 1'); r() }, 1))
  new Promise(r => setTimeout(() => { console.log('p 2'); r() }, 1))
});