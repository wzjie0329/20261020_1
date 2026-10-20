
// ==================== 六題拖曳配對測驗 ==================== // 程式用途：p5.js 互動測驗

let quizItems = [ // 建立六道題目與各自的 GIF 動畫
  { question: "建立畫布", answer: "createCanvas()", gif: "https://media.giphy.com/media/L8K62iTDkzGX6/giphy.gif" }, // 第一題
  { question: "設定背景顏色", answer: "background()", gif: "https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif" }, // 第二題
  { question: "設定填滿顏色", answer: "fill()", gif: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" }, // 第三題
  { question: "設定外框顏色", answer: "stroke()", gif: "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif" }, // 第四題
  { question: "繪製圓形", answer: "circle()", gif: "https://media.giphy.com/media/l0HlNQ03J5JxX6lva/giphy.gif" }, // 第五題
  { question: "繪製矩形", answer: "rect()", gif: "https://media.giphy.com/media/26BRuo6sLetdllPAQ/giphy.gif" } // 第六題
]; // 結束題目資料

let options = []; // 儲存隨機排序的答案
let assignments = [-1, -1, -1, -1, -1, -1]; // 儲存每題目前放置的答案索引
let gifImages = []; // 儲存六張 GIF 圖片元素
let layout = {}; // 儲存所有版面座標
let draggingOption = -1; // 儲存目前拖曳的答案索引
let dragOriginSlot = -1; // 儲存答案原本所在的題目
let submitted = false; // 記錄是否已經交卷
let score = 0; // 儲存最後答對題數
let confetti = []; // 儲存撒花動畫粒子

// ==================== 初始化畫面 ==================== // 建立畫布與載入圖片
function setup() { // p5.js 啟動時執行一次
  createCanvas(windowWidth, 830); // 建立符合視窗寬度的畫布
  document.body.style.margin = "0"; // 移除網頁預設外距
  document.body.style.background = "#f6f3ff"; // 設定網頁背景顏色
  document.body.style.fontFamily = "'LXGW WenKai TC', sans-serif"; // 設定繁體中文字型
  document.body.style.overflowX = "hidden"; // 避免網頁出現水平捲動
  options = quizItems.map((item, index) => ({ label: item.answer, correct: index })); // 建立答案與正確題號
  shuffle(options, true); // 隨機打亂六個答案
  for (let i = 0; i < quizItems.length; i++) { // 逐一建立六張 GIF
    gifImages[i] = createImg(quizItems[i].gif, "第" + (i + 1) + "題動畫"); // 載入每題的 GIF 動畫
    gifImages[i].style("object-fit", "contain"); // 保持 GIF 原始比例
    gifImages[i].style("pointer-events", "none"); // 避免 GIF 阻擋拖曳操作
    gifImages[i].style("user-select", "none"); // 避免拖曳時選取圖片
    gifImages[i].style("z-index", "2"); // 將 GIF 放在卡片內容上方
    gifImages[i].attribute("draggable", "false"); // 關閉瀏覽器原生圖片拖曳
  } // 結束 GIF 建立
  calculateLayout(); // 計算所有題目與答案位置
} // 結束初始化函式

// ==================== 計算所有位置 ==================== // 統一繪圖與拖曳座標
function calculateLayout() { // 計算題目卡片和答案卡片位置
  let margin = width < 500 ? 10 : 22; // 設定左右留白
  let gapX = width < 500 ? 7 : 14; // 設定卡片水平間距
  let gapY = 14; // 設定卡片垂直間距
  let cardW = (width - margin * 2 - gapX * 2) / 3; // 計算每張題目卡片寬度
  let cardH = 205; // 設定每張題目卡片高度
  let startY = 92; // 設定第一排題目卡片的起始位置
  layout.margin = margin; // 儲存左右留白
  layout.gapX = gapX; // 儲存水平間距
  layout.gapY = gapY; // 儲存垂直間距
  layout.cardW = cardW; // 儲存卡片寬度
  layout.cardH = cardH; // 儲存卡片高度
  layout.cards = []; // 清空舊的題目卡片座標
  for (let i = 0; i < 6; i++) { // 計算六張題目卡片的位置
    let col = i % 3; // 計算目前題目所在的欄位
    let row = floor(i / 3); // 計算目前題目所在的列
    let x = margin + col * (cardW + gapX); // 計算卡片水平座標
    let y = startY + row * (cardH + gapY); // 計算卡片垂直座標
    layout.cards.push({ x: x, y: y, w: cardW, h: cardH }); // 儲存題目卡片座標
  } // 結束題目卡片位置計算
  layout.bankTitleY = 548; // 設定答案區標題位置
  layout.bankY = 574; // 設定第一排答案卡片位置
  layout.optionH = 43; // 設定答案卡片高度
  layout.optionGapY = 10; // 設定答案卡片垂直間距
  layout.optionW = cardW; // 設定答案卡片寬度
  layout.options = []; // 清空舊的答案卡片座標
  for (let i = 0; i < 6; i++) { // 計算六張答案卡片的位置
    let col = i % 3; // 計算答案所在的欄位
    let row = floor(i / 3); // 計算答案所在的列
    let x = margin + col * (cardW + gapX); // 計算答案卡片水平座標
    let y = layout.bankY + row * (layout.optionH + layout.optionGapY); // 計算答案卡片垂直座標
    layout.options.push({ x: x, y: y, w: layout.optionW, h: layout.optionH }); // 儲存答案卡片座標
  } // 結束答案卡片位置計算
  layout.submit = { x: width / 2 - 95, y: 704, w: 190, h: 48 }; // 設定送出按鈕位置
  layout.resultY = 778; // 設定成績顯示位置
} // 結束版面計算函式

// ==================== 主繪圖函式 ==================== // 每一影格更新畫面
function draw() { // p5.js 每一影格執行
  background("#f6f3ff"); // 繪製淡紫色背景
  drawHeader(); // 繪製標題與操作說明
  drawQuestionCards(); // 繪製兩排三欄的六張題目卡片
  positionGifElements(); // 將 GIF 放在各自的題目卡片內
  drawAnswerBank(); // 繪製下方六個答案選項
  drawSubmitButton(); // 繪製送出答案按鈕
  if (submitted) drawResult(); // 交卷後才顯示成績
  if (draggingOption !== -1) drawDraggingOption(); // 繪製正在拖曳的答案
  updateConfetti(); // 更新撒花動畫
} // 結束主繪圖函式

// ==================== 標題區 ==================== // 繪製測驗標題
function drawHeader() { // 繪製標題和說明文字
  noStroke(); // 移除文字外框
  fill("#45356f"); // 設定標題顏色
  textAlign(CENTER, CENTER); // 將標題置中
  textStyle(BOLD); // 設定標題粗體
  textSize(width < 500 ? 20 : 27); // 根據畫面寬度調整標題大小
  text("p5.js 拖曳配對挑戰", width / 2, 30); // 顯示標題
  textStyle(NORMAL); // 恢復一般字體
  fill("#766c91"); // 設定說明文字顏色
  textSize(width < 500 ? 10 : 13); // 根據畫面寬度調整說明文字
  text("將下方六個答案拖曳到正確的題目框內", width / 2, 62); // 顯示操作說明
} // 結束標題函式

// ==================== 繪製六張題目卡片 ==================== // 每排三題，共兩排
function drawQuestionCards() { // 繪製題號、題目文字與答案框
  for (let i = 0; i < quizItems.length; i++) { // 逐一繪製六道題目
    let c = layout.cards[i]; // 取得目前題目卡片的座標
    noStroke(); // 移除卡片外框
    fill(0, 0, 0, 12); // 設定卡片陰影顏色
    rect(c.x, c.y + 4, c.w, c.h, 16); // 繪製卡片陰影
    fill("#ffffff"); // 設定卡片背景顏色
    rect(c.x, c.y, c.w, c.h, 16); // 繪製白色圓角卡片
    fill("#e9e2ff"); // 設定題號圓形底色
    circle(c.x + 19, c.y + 19, 25); // 繪製題號圓形
    fill("#5b4894"); // 設定題號文字顏色
    textAlign(CENTER, CENTER); // 將題號置中
    textStyle(BOLD); // 設定題號粗體
    textSize(12); // 設定題號字體大小
    text(i + 1, c.x + 19, c.y + 19); // 顯示題號
    textStyle(NORMAL); // 恢復一般字體
    fill("#403657"); // 設定題目文字顏色
    textAlign(CENTER, CENTER); // 將題目文字置中
    textSize(width < 500 ? 11 : 14); // 根據卡片寬度調整題目字體
    text(quizItems[i].question, c.x + 5, c.y + 112, c.w - 10, 30); // 將題目限制在卡片範圍內
    drawAnswerSlot(i, c); // 繪製此題的答案放置框
  } // 結束六題繪製
} // 結束題目卡片函式

// ==================== 答案框座標 ==================== // 繪圖和拖曳共用相同座標
function getSlotRect(index) { // 取得指定題目的答案框座標
  let c = layout.cards[index]; // 取得該題的卡片位置
  return { x: c.x + 7, y: c.y + 158, w: c.w - 14, h: 32 }; // 回傳答案框的唯一座標設定
} // 結束答案框座標函式

// ==================== 繪製答案放置框 ==================== // 修正答案文字跑到框外
function drawAnswerSlot(index, c) { // 繪製指定題目的答案框
  let slot = getSlotRect(index); // 取得統一的答案框座標
  stroke("#b9addf"); // 設定答案框外框顏色
  strokeWeight(1.5); // 設定答案框外框粗細
  if (assignments[index] === -1) fill("#f7f4ff"); // 未作答時使用淡紫色
  else fill("#e8f8f0"); // 已作答時使用淡綠色
  rect(slot.x, slot.y, slot.w, slot.h, 9); // 繪製答案框
  let answerText = assignments[index] === -1 ? "拖曳答案到這裡" : options[assignments[index]].label; // 決定答案框內的文字
  noStroke(); // 移除文字外框
  fill(assignments[index] === -1 ? "#a29ab5" : "#287453"); // 設定文字顏色
  textAlign(CENTER, CENTER); // 將文字水平與垂直置中
  textStyle(NORMAL); // 使用一般字體
  textSize(width < 500 ? 9 : 12); // 根據卡片寬度調整字體
  text(answerText, slot.x + 3, slot.y + 2, slot.w - 6, slot.h - 4); // 文字框從左上角開始並限制在答案框內
  if (submitted) { // 如果測驗已經交卷
    let isCorrect = assignments[index] !== -1 && options[assignments[index]].correct === index; // 判斷此題答案是否正確
    noFill(); // 不填滿結果外框
    stroke(isCorrect ? "#38a875" : "#e47a88"); // 答對使用綠框，答錯使用紅框
    strokeWeight(2); // 設定結果外框粗細
    rect(slot.x, slot.y, slot.w, slot.h, 9); // 繪製答案結果外框
  } // 結束交卷後的結果顯示
} // 結束答案放置框函式

// ==================== GIF 動畫定位 ==================== // 每題的 GIF 都有獨立位置
function positionGifElements() { // 設定六張 GIF 的位置與大小
  for (let i = 0; i < gifImages.length; i++) { // 逐一處理六張 GIF
    let c = layout.cards[i]; // 取得題目卡片位置
    let gifW = min(c.w - 20, 100); // 計算 GIF 寬度
    let gifH = 60; // 設定 GIF 高度
    gifImages[i].size(gifW, gifH); // 設定 GIF 顯示尺寸
    gifImages[i].position(c.x + (c.w - gifW) / 2, c.y + 35); // 將 GIF 放在卡片上半部
    gifImages[i].style("object-fit", "contain"); // 保持 GIF 原始比例
    gifImages[i].style("pointer-events", "none"); // 避免 GIF 阻擋拖曳
  } // 結束 GIF 定位
} // 結束 GIF 定位函式

// ==================== 判斷答案是否已放置 ==================== // 避免同一答案重複出現
function isAssigned(optionIndex) { // 判斷答案是否已經放入題目
  return assignments.includes(optionIndex); // 如果題目中已有此索引就回傳 true
} // 結束答案使用判斷

// ==================== 繪製下方答案區 ==================== // 六個答案排列為兩排三欄
function drawAnswerBank() { // 繪製答案標題與六張答案卡片
  noStroke(); // 移除標題外框
  fill("#45356f"); // 設定答案區標題顏色
  textAlign(CENTER, CENTER); // 將標題置中
  textStyle(BOLD); // 設定標題粗體
  textSize(17); // 設定標題大小
  text("答案選項", width / 2, layout.bankTitleY); // 顯示答案區標題
  textStyle(NORMAL); // 恢復一般字體
  for (let i = 0; i < options.length; i++) { // 逐一繪製六個答案
    let p = layout.options[i]; // 取得答案卡片座標
    if (isAssigned(i) || draggingOption === i) continue; // 隱藏已放置或正在拖曳的答案
    noStroke(); // 移除答案卡片外框
    fill("#dcd2ff"); // 設定卡片陰影顏色
    rect(p.x, p.y + 3, p.w, p.h, 11); // 繪製卡片陰影
    fill("#ffffff"); // 設定答案卡片背景顏色
    rect(p.x, p.y, p.w, p.h, 11); // 繪製答案卡片本體
    stroke("#c9bdf1"); // 設定答案卡片邊框顏色
    strokeWeight(1); // 設定邊框粗細
    noFill(); // 只繪製卡片外框
    rect(p.x, p.y, p.w, p.h, 11); // 繪製答案卡片外框
    noStroke(); // 移除答案文字外框
    fill("#5b4894"); // 設定答案文字顏色
    textAlign(CENTER, CENTER); // 將答案文字置中
    textStyle(BOLD); // 設定答案文字粗體
    textSize(width < 500 ? 10 : 15); // 根據卡片寬度調整字體
    text(options[i].label, p.x + 3, p.y + 2, p.w - 6, p.h - 4); // 將答案文字限制在卡片內
    textStyle(NORMAL); // 恢復一般字體
  } // 結束答案區繪製
} // 結束答案區函式

// ==================== 繪製送出按鈕 ==================== // 交卷後停止接受作答
function drawSubmitButton() { // 繪製送出按鈕
  let b = layout.submit; // 取得送出按鈕座標
  noStroke(); // 移除按鈕外框
  fill(submitted ? "#aaa3bd" : "#7964c8"); // 依交卷狀態設定按鈕顏色
  rect(b.x, b.y, b.w, b.h, 15); // 繪製圓角按鈕
  fill("#ffffff"); // 設定按鈕文字顏色
  textAlign(CENTER, CENTER); // 將按鈕文字置中
  textStyle(BOLD); // 設定按鈕文字粗體
  textSize(16); // 設定按鈕文字大小
  text(submitted ? "已完成作答" : "送出答案", b.x + b.w / 2, b.y + b.h / 2); // 顯示按鈕文字
  textStyle(NORMAL); // 恢復一般字體
} // 結束送出按鈕函式

// ==================== 顯示測驗成績 ==================== // 交卷後才顯示分數
function drawResult() { // 繪製成績與評語
  fill("#45356f"); // 設定成績文字顏色
  noStroke(); // 移除文字外框
  textAlign(CENTER, CENTER); // 將成績置中
  textStyle(BOLD); // 設定成績粗體
  textSize(19); // 設定成績文字大小
  text("你的成績：" + score + " / 6 題（" + round(score / 6 * 100) + "%）", width / 2, layout.resultY); // 顯示答對題數與百分比
  textStyle(NORMAL); // 恢復一般字體
  fill("#766c91"); // 設定評語文字顏色
  textSize(14); // 設定評語文字大小
  let message = score / 6 > 0.6 ? "太棒了！繼續保持！" : "再練習一次，你會更進步！"; // 根據成績產生評語
  text(message, width / 2, layout.resultY + 25); // 顯示成績評語
} // 結束成績函式

// ==================== 判斷滑鼠是否在矩形內 ==================== // 用於按鈕與答案框的碰撞判定
function insideRect(px, py, r) { // 判斷座標是否落在指定矩形
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h; // 回傳是否位於矩形範圍
} // 結束矩形判斷函式

// ==================== 開始拖曳答案 ==================== // 支援從答案區或題目框拖曳
function mousePressed() { // 偵測滑鼠按下事件
  if (submitted) return false; // 交卷後不允許再拖曳
  if (insideRect(mouseX, mouseY, layout.submit)) return false; // 不從送出按鈕開始拖曳
  draggingOption = -1; // 清除目前拖曳索引
  dragOriginSlot = -1; // 清除原本題目索引
  for (let i = 0; i < assignments.length; i++) { // 先檢查題目框內的答案
    let slot = getSlotRect(i); // 取得與繪圖相同的答案框座標
    if (assignments[i] !== -1 && insideRect(mouseX, mouseY, slot)) { // 如果按到題目框內的答案
      draggingOption = assignments[i]; // 設定正在拖曳的答案
      dragOriginSlot = i; // 記錄答案原本所在的題目
      assignments[i] = -1; // 暫時清空原題答案
      return false; // 結束開始拖曳處理
    } // 結束題目框答案判斷
  } // 結束題目框檢查
  for (let i = 0; i < options.length; i++) { // 再檢查下方答案區
    let p = layout.options[i]; // 取得目前答案卡片座標
    if (!isAssigned(i) && insideRect(mouseX, mouseY, p)) { // 如果按到尚未放置的答案
      draggingOption = i; // 設定正在拖曳的答案
      return false; // 結束開始拖曳處理
    } // 結束答案卡片判斷
  } // 結束答案區檢查
  return false; // 避免瀏覽器執行預設操作
} // 結束開始拖曳函式

// ==================== 拖曳過程 ==================== // 讓答案跟隨滑鼠
function mouseDragged() { // 偵測滑鼠拖曳事件
  return false; // 由 drawDraggingOption 繪製拖曳中的答案
} // 結束拖曳函式

// ==================== 放開滑鼠完成拖曳 ==================== // 將答案放進指定題目
function mouseReleased() { // 偵測滑鼠放開事件
  if (submitted) return false; // 交卷後禁止更改答案
  if (draggingOption === -1) { // 如果目前沒有拖曳答案
    if (insideRect(mouseX, mouseY, layout.submit)) submitQuiz(); // 如果按到送出按鈕就提交測驗
    return false; // 結束放開事件
  } // 結束沒有拖曳答案的判斷
  let targetSlot = -1; // 預設沒有目標題目
  for (let i = 0; i < layout.cards.length; i++) { // 檢查六個題目的答案框
    if (insideRect(mouseX, mouseY, getSlotRect(i))) targetSlot = i; // 記錄滑鼠放開時所在的答案框
  } // 結束目標題目檢查
  if (targetSlot !== -1) { // 如果答案放進了題目框
    let previousAnswer = assignments[targetSlot]; // 儲存目標原本的答案
    assignments[targetSlot] = draggingOption; // 將拖曳答案放入目標題目
    if (previousAnswer !== -1 && dragOriginSlot !== -1) assignments[dragOriginSlot] = previousAnswer; // 原題與目標題都有答案時交換答案
  } else if (dragOriginSlot !== -1) { // 如果答案沒有放進其他題目而且原本來自題目框
    assignments[dragOriginSlot] = draggingOption; // 將答案放回原本的題目框
  } // 結束答案放置處理
  draggingOption = -1; // 清除拖曳答案索引
  dragOriginSlot = -1; // 清除原本題目索引
  return false; // 避免瀏覽器執行預設操作
} // 結束放開滑鼠函式

// ==================== 繪製拖曳中的答案 ==================== // 將拖曳卡片顯示在最上層
function drawDraggingOption() { // 繪製正在拖曳的答案卡片
  let w = layout.optionW; // 取得答案卡片寬度
  let h = layout.optionH; // 取得答案卡片高度
  let x = mouseX - w / 2; // 計算拖曳卡片水平位置
  let y = mouseY - h / 2; // 計算拖曳卡片垂直位置
  noStroke(); // 移除卡片外框
  fill("#dcd2ff"); // 設定卡片陰影顏色
  rect(x, y + 3, w, h, 11); // 繪製卡片陰影
  fill("#ffffff"); // 設定卡片背景顏色
  rect(x, y, w, h, 11); // 繪製白色卡片
  stroke("#7964c8"); // 設定卡片外框顏色
  strokeWeight(2); // 設定外框粗細
  noFill(); // 不填滿外框
  rect(x, y, w, h, 11); // 繪製卡片外框
  noStroke(); // 移除答案文字外框
  fill("#5b4894"); // 設定答案文字顏色
  textAlign(CENTER, CENTER); // 將答案文字置中
  textStyle(BOLD); // 設定答案文字粗體
  textSize(width < 500 ? 10 : 15); // 根據卡片寬度調整文字大小
  text(options[draggingOption].label, x + 3, y + 2, w - 6, h - 4); // 將拖曳中的答案限制在卡片內
  textStyle(NORMAL); // 恢復一般字體
} // 結束拖曳卡片繪製函式

// ==================== 交卷與計分 ==================== // 答案送出後才計算成績
function submitQuiz() { // 計算答對題數
  if (submitted) return; // 避免重複交卷
  submitted = true; // 設定已交卷狀態
  score = 0; // 將成績歸零
  for (let i = 0; i < quizItems.length; i++) { // 逐一檢查六道題目
    if (assignments[i] !== -1 && options[assignments[i]].correct === i) score++; // 答案正確時加一分
  } // 結束答案檢查
  if (score / quizItems.length > 0.6) createConfetti(); // 答對率超過百分之六十時撒花
} // 結束交卷函式

// ==================== 建立撒花動畫 ==================== // 答對率超過百分之六十時呼叫
function createConfetti() { // 建立一百個彩色粒子
  for (let i = 0; i < 100; i++) { // 重複建立撒花粒子
    confetti.push({ x: random(width), y: random(-height, 0), size: random(5, 10), speed: random(2, 5), drift: random(-1.5, 1.5), color: color(random(100, 255), random(100, 255), random(150, 255)) }); // 隨機設定粒子位置、大小、速度與顏色
  } // 結束粒子建立
} // 結束撒花建立函式

// ==================== 更新撒花動畫 ==================== // 讓彩色紙片向下掉落
function updateConfetti() { // 更新所有撒花粒子
  for (let i = confetti.length - 1; i >= 0; i--) { // 從最後一個粒子開始處理
    let p = confetti[i]; // 取得目前的撒花粒子
    noStroke(); // 移除粒子外框
    fill(p.color); // 設定粒子顏色
    rect(p.x, p.y, p.size, p.size * 0.65, 2); // 繪製彩色紙片
    p.y += p.speed; // 讓紙片向下移動
    p.x += p.drift; // 讓紙片左右飄動
    if (p.y > height + 10) confetti.splice(i, 1); // 移除掉出畫面的紙片
  } // 結束粒子更新
} // 結束撒花更新函式

// ==================== 視窗大小改變 ==================== // 視窗改變時重新排版
function windowResized() { // 偵測瀏覽器視窗大小改變
  resizeCanvas(windowWidth, 830); // 重新設定畫布尺寸
  calculateLayout(); // 重新計算所有卡片座標
} // 結束視窗調整函式
