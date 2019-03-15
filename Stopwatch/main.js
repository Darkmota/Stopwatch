let canvas = document.getElementById('main')
let ctx = canvas.getContext('2d')
let trigger = {}
let elements = []
let status = 0
let records = []
let startTime = 0
let currentTime = 0
let pauseTime = 0
canvas.width = 800
canvas.height = 800
ctx.width = 800
ctx.height = 800

function doNothing() {}

function addEvent(eventName, fn) {
  if (!trigger[eventName]) {
    trigger[eventName] = []
  }
  trigger[eventName].push({
    element: this,
    fn: fn.bind(this)
  })
}

canvas.addEventListener('click', (e) => {
  mouseX = e.pageX - canvas.getBoundingClientRect().left
  mouseY = e.pageY - canvas.getBoundingClientRect().top
  for (let t of trigger.click) {
    if (mouseX >= t.element.x && mouseX <= t.element.x + t.element.w && mouseY >= t.element.y && mouseY <= t.element.y + t.element.h) {
      t.fn()
      break
    }
  }
})

class Button {
  constructor (x, y, w, h, color, text, font) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.color = color || 'rgba(128,128,128,.5)'
    this.text = text || 'no text'
    this.font = font || '20px consolas'
    this.highLight = 0
    elements.push(this)
  }

  update () {
    ctx.fillStyle = this.color
    ctx.text = this.text
    ctx.font = this.font
    ctx.fillRect(this.x, this.y, this.w, this.h)
    if (--this.highLight) {
      ctx.fillStyle = `rgba(255,255,255,${this.highLight / 100})`
      ctx.fillRect(this.x, this.y, this.w, this.h)
    }
    ctx.fillStyle = `white`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.text, this.x + this.w / 2, this.y + this.h / 2)
  }

  bindEvent (eventName, fn) {
    addEvent.call(this, eventName, fn)
  }
}

function formatMs (ms) {
  let minute = String(Math.floor(ms / 60000))
  if (minute == 0) {
    minute = '00'
  } else if (minute <= 9) {
    minute = `0${minute}`
  }
  ms %= 60000
  let second = String(Math.floor(ms / 1000))
  if (second == 0) {
    second = '00'
  } else if (second <= 9) {
    second = `0${second}`
  }
  ms %= 1000
  let millisecond = ms
  if (millisecond == 0) {
    millisecond = '000'
  } else if (millisecond <= 9) {
    millisecond = `00${millisecond}`
  } else if (millisecond <= 99) {
    millisecond = `0${millisecond}`
  }
  return `${minute}:${second}.${millisecond}`
}

function saveRecord(time) {
  if (records.length === 3) {
    records.shift()
  }
  records.push(time)
}

let startButton = new Button(100, 400, 200, 100, 'rgba(0,0,0,1)', 'Start', '20px consolas')
startButton.bindEvent('click', function () {
  this.highLight = 50
  switch (status) {
    case 0:
      status = 1
      this.text = 'Pause'
      this.color = 'red'
      startTime = Date.now()
      break
    case 1:
      status = 2
      this.text = 'Resume'
      this.color = 'blue'
      pauseTime = Date.now()
      break
    case 2:
      this.text = 'Pause'
      this.color = 'red'
      startTime += currentTime - pauseTime
      status = 1
      break
  }
})

let recordButton = new Button(300, 400, 200, 100, 'rgba(0,0,0,1)', 'Record', '20px consolas')
recordButton.bindEvent('click', function () {
  this.highLight = 50
  switch (status) {
    case 0:
      doNothing()
      break
    case 1:
      saveRecord(currentTime - startTime)
      break
    case 2:
      saveRecord(pauseTime - startTime)
      break
  }
})

let clearButton = new Button(500, 400, 200, 100, 'rgba(0,0,0,1)', 'Clear', '20px consolas')
clearButton.bindEvent('click', function () {
  this.highLight = 50
  switch (status) {
    case 0:
      doNothing()
      break
    case 1:
      startButton.text = 'Start'
      startButton.color = 'black'
      status = 0
      records = []
      break
    case 2:
      startButton.text = 'Start'
      startButton.color = 'black'
      status = 0
      records = []
      break
  }
})

function main() {
  currentTime = Date.now()
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  for (let element of elements) {
    element.update()
  }
  ctx.fillStyle = 'red'
  let displayTime = 0
  switch (status) {
    case 0:
      displayTime = 0
      break
    case 1:
      displayTime = currentTime - startTime
      break
    case 2:
      displayTime = pauseTime - startTime
      break
  }
  ctx.fillText(formatMs(displayTime), 400, 200)
  ctx.fillStyle = 'blue'
  for (let i = 0; i < records.length; ++i) {
    ctx.fillText(`Record ${i + 1}: ${formatMs(records[i])}`, 400, 240 + i * 20)
  }
  window.requestAnimationFrame(main)
}

main()
