const grid = document.querySelector('.grid')
const flagsNum = document.querySelector('#flags-num')
const result = document.querySelector('#result')
let width = 10
let blocks = []
let flags = 0
let bombNum = 20
let isGameOver = false
let second = 0
let timer = 0

// 遊戲開始
$('#btn-start').click(() => {
    isGameOver = false
    $(this).attr('disabled', true)
    $('.valid').remove()
    $('.bomb').remove()
    $('.checked').remove()
    $('#result').text('')
    buildGrid()

    second = 0
    $('#second').text(second)

    timer = setInterval(() => {
        second++
        $('#second').text(second)
    }, 1000);


})

// 建立方格
function buildGrid() {
    flagsNum.innerHTML = 0

    // 隨機放炸彈
    const bombArray = Array(bombNum).fill('bomb')
    const emptyArray = Array(width * width - bombNum).fill('valid')
    const gameArray = bombArray.concat(emptyArray).sort(() => 0.5 - Math.random())

    // 跑每個格子的資料
    for (let i = 0; i < width * width; i++) {
        const block = document.createElement('div')
        block.setAttribute('id', i)
        block.classList.add(gameArray[i])
        grid.appendChild(block)
        blocks.push(block)

        // 點選時執行
        block.addEventListener('click', function (e) {
            click(block)
        })

        // 點擊滑鼠右鍵時觸發
        block.oncontextmenu = function (e) {
            e.preventDefault()
            addFlag(block)
        }
    }


    // 在方格內加入周圍炸彈的數量
    // 周圍有8個方格
    for (let i = 0; i < blocks.length; i++) {
        let total = 0
        // 最左右兩條需扣除周圍不相關的方格
        const leftSide = i % width === 0
        const rightSide = i % width === width - 1

        if (blocks[i].classList.contains('valid')) {
            // 炸彈在點選目標左邊、右上、上面、左上、右邊、左下、右下、下面
            // 需>0 否則0-1 =-1 不存在
            if (i > 0 && !leftSide && blocks[i - 1].classList.contains('bomb')) total++
            if (i > 9 && !rightSide && blocks[i - width + 1].classList.contains('bomb')) total++
            if (i > 9 && blocks[i - width].classList.contains('bomb')) total++
            if (i > 11 && !leftSide && blocks[i - width - 1].classList.contains('bomb')) total++
            if (i < 99 && !rightSide && blocks[i + 1].classList.contains('bomb')) total++
            if (i < 90 && !leftSide && blocks[i + width - 1].classList.contains('bomb')) total++
            if (i < 89 && !rightSide && blocks[i + width + 1].classList.contains('bomb')) total++
            if (i < 90 && blocks[i + width].classList.contains('bomb')) total++

            // data-bomb 炸彈的數量
            blocks[i].setAttribute('data-bomb', total)
            // console.log(blocks[i])
        }
    }
}
// buildGrid()

// 點選方塊時執行
function click(block) {
    let nowId = block.id
    if (isGameOver) return
    if (block.classList.contains('checked') || block.classList.contains('flag')) return
    if (block.classList.contains('bomb')) {
        gameOver(block)
    } else {
        let total = block.getAttribute('data-bomb')
        if (total != 0) {
            block.classList.add('checked')
            block.innerHTML = total
            return
        }
        // 當炸彈數量為0時 擴散周圍的方塊
        checkBlock(block, nowId)
    }
    block.classList.add('checked')
}

// 當周圍炸彈數量為0時 檢查周圍的方塊
function checkBlock(block, nowId) {
    const leftSide = (nowId % width === 0)
    const rightSide = (nowId % width === width - 1)

    setTimeout(() => {
        // 左、右上、上面、左上、右邊、左下、右下、下面
        if (nowId > 0 && !leftSide) {
            const newId = parseInt(nowId) - 1
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
        if (nowId > 9 && !rightSide) {
            const newId = parseInt(nowId) - width
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
        if (nowId > 9) {
            const newId = parseInt(nowId) - width + 1
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
        if (nowId > 11 && !leftSide) {
            const newId = parseInt(nowId) - width - 1
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
        if (nowId < 99 && !rightSide) {
            const newId = parseInt(nowId) + 1
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
        if (nowId < 90 && !leftSide) {
            const newId = parseInt(nowId) + width - 1
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
        if (nowId < 89 && !rightSide) {
            const newId = parseInt(nowId) + width + 1
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
        if (nowId < 90) {
            const newId = parseInt(nowId) + width
            const newBlock = document.getElementById(newId)
            click(newBlock)
        }
    }, 10)

}

// 遊戲失敗
function gameOver(block) {
    result.innerHTML = '踩到炸彈啦！遊戲結束'
    isGameOver = true
    console.log('game over');
    clearInterval(timer)


    // 顯示所有炸彈
    blocks.forEach(block => {
        if (block.classList.contains('bomb')) {
            block.innerHTML = '💣'
            block.classList.remove('bomb')
            block.classList.add('checked')
        }

    });
}

// 插旗子
function addFlag(block) {
    if (isGameOver) return
    if (!block.classList.contains('checked') && flags < bombNum) {
        if (!block.classList.contains('flag')) {
            block.classList.add('flag')
            block.innerHTML = '🚩'
            flags++
            flagsNum.innerHTML = flags
            checkWin()
        } else {
            block.classList.remove('flag')
            block.innerHTML = ''
            flags--
            flagsNum.innerHTML = flags

        }
    }
}

// 遊戲完成
function checkWin() {
    let matches = 0

    for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].classList.contains('flag') && blocks[i].classList.contains('bomb')) {
            matches++
            // console.log(matches);
        }
        if (matches === 20) {
            // console.log('done')
            result.innerHTML = '恭喜你完成任務！！'
            isGameOver = true

            clearInterval(timer)
            let nowSec = $('#second').text()
            let recordSec = $('#secondRecord').text()
            if (nowSec < recordSec) {
                $('#secondRecord').text(nowSec)
            }
        }
    }


}

