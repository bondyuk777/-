(function () {
    'use strict';

    // ================== ПЕРЕМЕННЫЕ ==================
    let keyBindings = {
        autoE: 'Space',
        autoGH: 'KeyF',
        autoLeave: 'F2',
        autoSwap: 'KeyG',
        autoX: 'KeyX'
    };

    let waitingKey = null;

    // ================== СОСТОЯНИЯ ==================
    const autoState = {
        autoE: { enabled: false, held: false, timer: null },
        autoGH: { enabled: false, held: false, timer: null },
        autoSwap: { enabled: false, held: false, timer: null },
        autoLeave: { enabled: false, held: false, timer: null },
        autoX: { enabled: false, held: false, timer: null }
    };


    // ================== МЕНЮ ==================
const menu = document.createElement('div');
menu.style.position = 'fixed';
menu.style.top = '120px';
menu.style.left = '120px';
menu.style.background = 'rgba(20,20,35,0.9)';
menu.style.border = '1px solid #0ff';
menu.style.borderRadius = '8px';
menu.style.padding = '0';
menu.style.fontFamily = 'monospace';
menu.style.color = '#0ff';
menu.style.zIndex = '999999';
menu.style.userSelect = 'none';
menu.innerHTML = `
    <div id="menuHeader" style="cursor:move; text-align:center; padding:5px; background:rgba(30,30,50,0.9); border-bottom:1px solid #0ff; position:relative;">
        ᴬᵉʳᵒˢᵒᶠᵗ
        <span id="closeMenuBtn"
              style="position:absolute; right:6px; top:2px; cursor:pointer; color:#f55;">✕</span>
    </div>
    <div id="menuContent" style="padding:10px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>ᴀᴜᴛᴏ-ᴇ</span>
            <span class="k-btn" data-func="autoE">[${keyBindings.autoE}]</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>ᴀᴜᴛᴏ ɢʜ</span>
            <span class="k-btn" data-func="autoGH">[${keyBindings.autoGH}]</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>ᴀᴜᴛᴏ ꜱᴡᴀᴘ</span>
            <span class="k-btn" data-func="autoSwap">[${keyBindings.autoSwap}]</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>ᴀᴜᴛᴏ ʟᴇᴀᴠᴇ</span>
            <span class="k-btn" data-func="autoLeave">[${keyBindings.autoLeave}]</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span>ᴀᴜᴛᴏ ʙᴏᴏᴍ</span>
            <span class="k-btn" data-func="autoX">[${keyBindings.autoX}]</span>
        </div>

        <label style="display:flex; align-items:center; margin-top:6px;">
            <input type="checkbox" id="autoEToggle" style="transform:scale(1.3); margin-right:6px;"> ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ-ᴇ
        </label>
        <label style="display:flex; align-items:center; margin-top:6px;">
            <input type="checkbox" id="autoGHToggle" style="transform:scale(1.3); margin-right:6px;"> ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ɢʜ
        </label>
        <label style="display:flex; align-items:center; margin-top:6px;">
            <input type="checkbox" id="autoSwapToggle" style="transform:scale(1.3); margin-right:6px;"> ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ꜱᴡᴀᴘ
        </label>
        <label style="display:flex; align-items:center; margin-top:6px;">
            <input type="checkbox" id="autoLeaveToggle" style="transform:scale(1.3); margin-right:6px;"> ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ʟᴇᴀᴠᴇ
        </label>
        <label style="display:flex; align-items:center; margin-top:6px;">
            <input type="checkbox" id="autoXToggle" style="transform:scale(1.3); margin-right:6px;"> ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ʙᴏᴏᴍ
        </label>

        <div style="margin-top:10px; text-align:center;">
            <button id="bgToggleBtn" style="background:none; border:1px solid #0ff; color:#0ff; padding:4px 8px; border-radius:6px; cursor:pointer;">
                ᴜᴄᴛᴀɴᴏᴠɪᴛь ꜰᴏɴ ˖✧ +18 ✧˖
            </button>
        </div>
        <label style="display:flex; align-items:center; margin-top:6px;">
            <input type="checkbox" id="fpsToggle" style="transform:scale(1.3); margin-right:6px;"> ᴘᴏᴋᴀᴢʏᴠᴀᴛь ғᴘs
        </label>

        <div style="margin-top:10px; text-align:center; font-size:11px; color:rgba(0,255,255,0.35); font-family:monospace;">
            𝑨𝒆𝒓𝒐𝑪𝒉𝒂𝒕 𝑭𝟖
        </div>
    </div>
`;


document.body.appendChild(menu);
    // ================== ЗВУК НАЖАТИЯ (WebAudio, без ссылок) ==================
let UI_AUDIO_CTX;

function playUIClick(isOn = true) {
    // Инициализация/разблокировка аудиоконтекста при первом клике
    if (!UI_AUDIO_CTX) UI_AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();
    if (UI_AUDIO_CTX.state === 'suspended') UI_AUDIO_CTX.resume();

    const ctx = UI_AUDIO_CTX;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Два тона: включение повыше, выключение пониже
    osc.type = 'square';
    osc.frequency.value = isOn ? 1300 : 900;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);   // атака
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09); // затухание

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
}

// Звук для всех кнопок и .k-btn
menu.querySelectorAll('button, .k-btn').forEach(el => {
    el.addEventListener('click', () => playUIClick(true));
});

// Для чекбоксов — разные тона для on/off
menu.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', (e) => playUIClick(e.target.checked));
});

    // ================== FPS БЛОК ==================
const fpsBox = document.createElement("div");
fpsBox.style.position = "fixed";
fpsBox.style.top = "5px";
fpsBox.style.left = "5px";
fpsBox.style.padding = "4px 8px";
fpsBox.style.fontFamily = "monospace";
fpsBox.style.color = "#0ff";
fpsBox.style.fontSize = "14px";
fpsBox.style.border = "1px solid #0ff";
fpsBox.style.borderRadius = "6px";
fpsBox.style.backgroundImage = "url('https://th.bing.com/th/id/R.c1d14fe56a019705250fa4d40be21005?rik=htXlTJdgq84cUg&pid=ImgRaw&r=0')";
fpsBox.style.backgroundSize = "cover";
fpsBox.style.backgroundPosition = "center";
fpsBox.style.display = "none";
fpsBox.style.zIndex = "999999";
document.body.appendChild(fpsBox);

let lastFrame = performance.now();
let frames = 0;
let fps = 0;

function updateFPS(now) {
    frames++;
    if (now - lastFrame >= 1000) {
        fps = frames;
        frames = 0;
        lastFrame = now;
        fpsBox.textContent = `FPS: ${fps}`;
    }
    requestAnimationFrame(updateFPS);
}
requestAnimationFrame(updateFPS);

// переключатель
document.getElementById("fpsToggle").addEventListener("change", e => {
    fpsBox.style.display = e.target.checked ? "block" : "none";
});

    // ================== КНОПКА ФОНА ==================
const bgToggleBtn = menu.querySelector("#bgToggleBtn");
let bgActive = false;
const bgUrl = "https://chohanpohan.com/uploads/posts/2021-12/1640711934_25-chohanpohan-com-p-porno-polnostyu-golie-tyanki-33.jpg";

bgToggleBtn.addEventListener("click", () => {
    if (!bgActive) {
        menu.style.backgroundImage = `url('${bgUrl}')`;
        menu.style.backgroundSize = "cover";
        menu.style.backgroundPosition = "center";
        bgToggleBtn.textContent = "ᴜʙᴘᴀᴛь ꜰᴏɴ ˖✧ +18 ✧˖";
        bgActive = true;
    } else {
        menu.style.backgroundImage = "";
        bgToggleBtn.textContent = "ᴜᴄᴛᴀɴᴏᴠɪᴛь ꜰᴏɴ ˖✧ +18 ✧˖";
        bgActive = false;
    }
});



// кнопка для повторного открытия меню
const reopenBtn = document.createElement("div");
reopenBtn.textContent = "⚙ Menu";
reopenBtn.style.position = "fixed";
reopenBtn.style.bottom = "10px";
reopenBtn.style.right = "10px";
reopenBtn.style.background = "rgba(20,20,35,0.9)";
reopenBtn.style.border = "1px solid #0ff";
reopenBtn.style.borderRadius = "6px";
reopenBtn.style.padding = "4px 8px";
reopenBtn.style.fontFamily = "monospace";
reopenBtn.style.color = "#0ff";
reopenBtn.style.cursor = "pointer";
reopenBtn.style.zIndex = "999999";
reopenBtn.style.display = "none";
document.body.appendChild(reopenBtn);

// логика скрытия / открытия
document.getElementById("closeMenuBtn").addEventListener("click", () => {
    menu.style.display = "none";
    reopenBtn.style.display = "block";
});

reopenBtn.addEventListener("click", () => {
    menu.style.display = "block";
    reopenBtn.style.display = "none";
});

// ================== ДВИЖЕНИЕ МЕНЮ ==================
(function dragElement(el, handle) {
    let dx = 0, dy = 0, dragging = false;

    handle.onmousedown = e => {
        dragging = true;
        dx = e.clientX - el.offsetLeft;
        dy = e.clientY - el.offsetTop;
        document.onmousemove = ev => {
            if (!dragging) return;
            el.style.left = (ev.clientX - dx) + "px";
            el.style.top = (ev.clientY - dy) + "px";
        };
        document.onmouseup = () => {
            dragging = false;
            document.onmousemove = null;
            document.onmouseup = null;
        };
    };
})(menu, document.getElementById("menuHeader"));


    // ================== ЯРКОСТЬ CANVAS ==================
    const canvas = document.getElementById("unity-canvas");
    const brightnessControl = document.createElement("div");
    brightnessControl.style.marginTop = "10px";
    brightnessControl.innerHTML = `
        <label style="font-size:12px; color:#0ff;">ʙʀɪɢʜᴛɴᴇꜱꜱ</label><br>
        <input id="brightnessSlider" type="range" min="50" max="150" value="100" style="width:160px;">
    `;
    menu.appendChild(brightnessControl);
    const slider = document.getElementById("brightnessSlider");
    slider.addEventListener("input", () => {
        const val = slider.value;
        if (canvas) canvas.style.filter = `brightness(${val}%)`;
    });

    // ================== ДВИЖЕНИЕ МЕНЮ ==================
    (function drag(el) {
        let dx = 0, dy = 0;
        el.firstChild.onmousedown = e => {
            e.preventDefault();
            dx = e.clientX - el.offsetLeft;
            dy = e.clientY - el.offsetTop;
            document.onmousemove = ev => {
                el.style.left = (ev.clientX - dx) + "px";
                el.style.top = (ev.clientY - dy) + "px";
            };
            document.onmouseup = () => { document.onmousemove = null; document.onmouseup = null; };
        };
    })(menu);

    // ================== НАЗНАЧЕНИЕ КЛАВИШ ==================
    const btns = menu.querySelectorAll('.k-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const func = btn.getAttribute('data-func');
            btn.textContent = '[Press Key]';
            waitingKey = func;
        });
    });

    window.addEventListener('keydown', e => {
        if (waitingKey) {
            e.preventDefault();
            keyBindings[waitingKey] = e.code;
            menu.querySelector(`.k-btn[data-func="${waitingKey}"]`).textContent = `[${e.code}]`;
            waitingKey = null;
        }
    });

    window.addEventListener('mousedown', e => {
        if (waitingKey) {
            e.preventDefault();
            keyBindings[waitingKey] = "Mouse" + e.button;
            menu.querySelector(`.k-btn[data-func="${waitingKey}"]`).textContent = `[Mouse${e.button}]`;
            waitingKey = null;
        }
    });

    // ================== TOGGLES ==================
    document.getElementById('autoEToggle').addEventListener('change', e => autoState.autoE.enabled = e.target.checked);
    document.getElementById('autoGHToggle').addEventListener('change', e => autoState.autoGH.enabled = e.target.checked);
    document.getElementById('autoSwapToggle').addEventListener('change', e => autoState.autoSwap.enabled = e.target.checked);
    document.getElementById('autoLeaveToggle').addEventListener('change', e => autoState.autoLeave.enabled = e.target.checked);

    // ================== ХЕЛПЕРЫ ==================
    let cursorX = 0, cursorY = 0;
    document.addEventListener("mousemove", e => { cursorX = e.clientX; cursorY = e.clientY; });

    function pressKey(key, code, keyCode) {
        const opts = { key, code, keyCode, which: keyCode, bubbles: true, cancelable: true };
        window.dispatchEvent(new KeyboardEvent("keydown", opts));
        window.dispatchEvent(new KeyboardEvent("keyup", opts));
    }

    async function clickAtCursorFunc() {
        const el = document.elementFromPoint(cursorX, cursorY);
        if (!el || el.closest(".menu,.ui,.disabled")) return;
        const opts = { bubbles: true, cancelable: true, button: 0, clientX: cursorX, clientY: cursorY };
        el.dispatchEvent(new MouseEvent("mousedown", opts));
        await new Promise(res => setTimeout(res, 54));
        el.dispatchEvent(new MouseEvent("mouseup", opts));
    }

    // ================== АВТО E ==================
   // ================== AUTO E + SPEEDHACK ==================
(function(){
    'use strict';

    let running = false;   // Auto E
    let held = false;      // SpeedHack
    let timer = null;
    let waitingKey = null; // для назначения клавиши

    // Сохраняем кнопку меню и чекбокс
    const autoEBtn = menu.querySelector('.k-btn');
    const autoEToggle = document.getElementById('autoEToggle');

    // === Auto E функция ===
    function sendE() {
        const VK_E = 69;
        const letter = String.fromCharCode(VK_E);
        ['keydown','keyup'].forEach(type => {
            const ev = new KeyboardEvent(type, {
                key: letter,
                code: 'Key' + letter,
                keyCode: VK_E,
                which: VK_E,
                bubbles: true
            });
            document.dispatchEvent(ev);
        });
    }

    function loop() {
        if(!running) return;
        const burst = Math.floor(Math.random()*3)+1;
        for(let i=0;i<burst;i++) setTimeout(sendE,i*30);
        const delay = 0.001 + Math.random()*0.1; // 80- 120
        timer = setTimeout(loop, delay);
    }

    // === Кнопка меню для назначения клавиши ===
    autoEBtn.addEventListener('click', () => {
        autoEBtn.textContent = '[Press Key]';
        waitingKey = 'autoE';
    });

    window.addEventListener('keydown', e => {
        // если ждём назначения клавиши
        if(waitingKey==='autoE'){
            e.preventDefault();
            keyBindings.autoE = e.code;
            autoEBtn.textContent = `[${e.code}]`;
            waitingKey = null;
            return;
        }

        // если клавиша совпадает с выбранной и чекбокс включён
        if(e.code === keyBindings.autoE && autoEToggle.checked && !held){
            held = true;
            running = true;
            loop();
            autoEBtn.style.color = "#0f0";
        }
    });

    window.addEventListener('keyup', e => {
        if(e.code === keyBindings.autoE){
            held = false;
            running = false;
            clearTimeout(timer);
            autoEBtn.style.color = "#0ff";
        }
    });

    // === SpeedHack через Date.now прокси ===
    const original = Date.now.bind(Date);
    let last = original();
    let offset = 0;

    Date.now = new Proxy(original, {
        apply(target, thisArg, args){
            const t = Reflect.apply(target, thisArg, args);
            if(held && autoEToggle.checked){
                offset += (t-last)*100; // ускорение
            }
            last = t;
            return Math.floor(t + offset);
        }
    });
})();

    // ================== АВТО GH ==================
    async function ghLoop() {
        if (!autoState.autoGH.held || !autoState.autoGH.enabled) return;
        pressKey("0", "Digit0", 48);
        await new Promise(res => setTimeout(res, 56));
        await clickAtCursorFunc();
        pressKey("1", "Digit1", 49);
        autoState.autoGH.timer = setTimeout(ghLoop, 60);
    }

    // ================== АВТО SWAP ==================
    async function swapLoop() {
        if (!autoState.autoSwap.held || !autoState.autoSwap.enabled) return;
        pressKey("8", "Digit8", 56);
        await delay(62);
        await clickAtCursorFunc();
        pressKey("7", "Digit7", 55);
        autoState.autoSwap.timer = setTimeout(swapLoop, 350);
    }

   // ================== AUTO HEAL (X) ==================
let xActionRunning = false;
let isXPressed = false;

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

async function clickAtCursor() {
    const el = document.elementFromPoint(cursorX, cursorY);
    if (!el) return;
    const opts = { bubbles: true, cancelable: true, button: 0, clientX: cursorX, clientY: cursorY };
    el.dispatchEvent(new MouseEvent("mousedown", opts));
    await delay(54);
    el.dispatchEvent(new MouseEvent("mouseup", opts));
}

async function performXActions() {
    if (xActionRunning) return;
    xActionRunning = true;

    while (isXPressed && autoState.autoX.enabled) {
        await pressKey("6", "Digit6", 56);
        await delay(62);
        await clickAtCursor();
        await pressKey("5", "Digit5", 55);
        await delay(200);

        // Проверяем состояние чекбокса каждый цикл
        if (!autoState.autoX.enabled) break;
    }

    xActionRunning = false;
}

// ================== КНОПКА И ТОГГЛ В МЕНЮ ==================
const autoXBtn = menu.querySelector('.k-btn[data-func="autoX"]');
const autoXToggle = document.getElementById('autoXToggle');

// Назначение новой клавиши
autoXBtn.addEventListener('click', () => {
    autoXBtn.textContent = '[Press Key]';
    waitingKey = 'autoX';
});

// Переключатель включения/выключения
autoXToggle.addEventListener('change', e => autoState.autoX.enabled = e.target.checked);

// ================== СЛУШАТЕЛИ КЛАВИШ ==================
document.addEventListener('keydown', e => {
    if (e.repeat) return;

    // Назначение клавиши
    if (waitingKey === 'autoX') {
        e.preventDefault();
        keyBindings.autoX = e.code;
        autoXBtn.textContent = `[${e.code}]`;
        waitingKey = null;
        return;
    }

    // Запуск Auto Heal
    if (autoState.autoX.enabled && e.code === keyBindings.autoX) {
        isXPressed = true;
        performXActions();
        e.preventDefault();
    }
});

document.addEventListener('keyup', e => {
    if (e.code === keyBindings.autoX) isXPressed = false;
});

    // ================== АВТО LEAVE ==================
    function leaveLoop() {
        if (!autoState.autoLeave.held || !autoState.autoLeave.enabled) return;
        pressKey("e", "KeyE", 69);
        autoState.autoLeave.timer = setTimeout(leaveLoop, 50);
    }

    // ================== ГЛОБАЛЬНЫЕ КЛАВИШИ ==================
    document.addEventListener("keydown", e => {
    if (e.repeat) return;
        if (autoState.autoGH.enabled && e.code === keyBindings.autoGH) {
            autoState.autoGH.held = true;
            ghLoop();
            e.preventDefault();
        }
        if (autoState.autoSwap.enabled && e.code === keyBindings.autoSwap) {
            autoState.autoSwap.held = true;
            swapLoop();
            e.preventDefault();
        }
        if (autoState.autoLeave.enabled && e.code === keyBindings.autoLeave) {
            autoState.autoLeave.held = !autoState.autoLeave.held; // toggle
            if (autoState.autoLeave.held) leaveLoop();
            else { clearTimeout(autoState.autoLeave.timer); autoState.autoLeave.timer = null; }
            e.preventDefault();
        }
    });

    document.addEventListener("keyup", e => {
        if (e.code === keyBindings.autoE) { autoState.autoE.held = false; clearTimeout(autoState.autoE.timer); }
        if (e.code === keyBindings.autoGH) { autoState.autoGH.held = false; clearTimeout(autoState.autoGH.timer); }
        if (e.code === keyBindings.autoSwap) { autoState.autoSwap.held = false; clearTimeout(autoState.autoSwap.timer); }
    });


})();

(function () {
  'use strict';

  const TOGGLE_KEY = "F8";
  let isOpen = false;

  // Чат
  const frame = document.createElement("iframe");
  frame.src = "about:blank";
  frame.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 450px;
    height: 350px;
    border: 2px solid #555;
    border-radius: 10px;
    z-index: 999999;
    display: none;
    background: #111827;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(0,255,255,0.2);
  `;
  document.body.appendChild(frame);

  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open();
  doc.write(`
<html>
<head>
  <style>
    html, body {
      margin:0;
      height:100%;
      background: #111827;
      color: #0ff;
      font-family: sans-serif;
      display:flex;
      flex-direction:column;
    }
    #msgs {
      flex:1;
      overflow-y:auto;
      padding:5px;
      font-size:14px;
      background: #1f2937;
      border-radius: 10px;
      margin:5px;
      border: 2px solid #555;
      box-shadow: 0 0 10px rgba(0,255,255,0.2), inset 0 2px 5px rgba(0,0,0,0.3);
    }
    #inp {
      width:100%;
      height:50px;
      border:0;
      border-top:2px solid #555;
      padding:5px;
      font-size:14px;
      outline:none;
      background:#0f172a;
      color:#0ff;
      resize:none;
      font-family: monospace;
      border-radius: 0 0 10px 10px;
      box-shadow: 0 0 10px rgba(0,255,255,0.2), inset 0 2px 5px rgba(0,0,0,0.3);
    }
  </style>
</head>
<body>
  <div id="msgs"></div>
  <textarea id="inp" placeholder="Сообщение... (Enter=отправить)"></textarea>
</body>
</html>
  `);
  doc.close();

  const msgs = doc.querySelector("#msgs");
  const inp = doc.querySelector("#inp");

  // Уведомления в правом верхнем углу
  const notificationDiv = document.createElement("div");
  notificationDiv.style.position = "fixed";
  notificationDiv.style.top = "20px";
  notificationDiv.style.right = "20px";
  notificationDiv.style.display = "flex";
  notificationDiv.style.flexDirection = "column";
  notificationDiv.style.gap = "10px";
  notificationDiv.style.zIndex = "1000000";
  document.body.appendChild(notificationDiv);

  const ws = new WebSocket("wss://adadadadad-production.up.railway.app");

  ws.onopen = () => {
    const savedNick = localStorage.getItem("chat_nick");
    const savedPass = localStorage.getItem("chat_pass");
    if(savedNick && savedPass){
        setTimeout(()=> {
            ws.send(`/login ${savedNick} ${savedPass}`);
        }, 500);
    }
  };

  ws.onmessage = (event) => {
    const msg = event.data;

    if(msg.startsWith("[Система]")) {
      addSystemMsg(msg); // только в чат
      return;
    }

    addPlayerMsg(msg); // чат + уведомления
  };

  function addSystemMsg(text){
    const m = doc.createElement("div");
    m.style.color = "#888"; // серый для системных сообщений
    m.style.marginBottom = "3px";
    m.textContent = text;
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addPlayerMsg(text){
    const m = doc.createElement("div");
    m.style.display = "flex";
    m.style.alignItems = "center";
    m.style.marginBottom = "2px";

    const nickPart = text.split(":")[0];
    const msgPart = text.includes(":") ? text.split(":").slice(1).join(":") : text;

    const avatar = doc.createElement("div");
    avatar.style.width = "24px";
    avatar.style.height = "24px";
    avatar.style.borderRadius = "50%";
    avatar.style.backgroundColor = stringToColor(nickPart);
    avatar.style.color = "#0ff";
    avatar.style.display = "flex";
    avatar.style.alignItems = "center";
    avatar.style.justifyContent = "center";
    avatar.style.fontSize = "14px";
    avatar.style.fontWeight = "bold";
    avatar.style.marginRight = "5px";
    avatar.style.cursor = "pointer";
    avatar.textContent = nickPart[0].toUpperCase();
    avatar.onclick = () => ws.send(`/профиль ${nickPart}`);

    const msgText = doc.createElement("span");
    msgText.style.display = "flex";
    msgText.style.alignItems = "center";
    msgText.appendChild(doc.createTextNode(msgPart ? `${nickPart}: ${msgPart}` : text));

    m.appendChild(avatar);
    m.appendChild(msgText);
    msgs.appendChild(m);
    msgs.scrollTop = msgs.scrollHeight;

    // уведомления
    showNotification(`${nickPart}: ${msgPart}`);
  }

  function showNotification(text){
    const n = document.createElement("div");
    n.textContent = text;
    n.style.background = "#1f2937";
    n.style.color = "#0ff";
    n.style.padding = "8px 12px";
    n.style.borderRadius = "8px";
    n.style.border = "2px solid #555";
    n.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5), 0 0 10px rgba(0,255,255,0.2)";
    n.style.fontFamily = "monospace";
    n.style.opacity = "0";
    n.style.transform = "translateX(50px)";
    n.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    notificationDiv.appendChild(n);

    requestAnimationFrame(() => {
      n.style.opacity = "1";
      n.style.transform = "translateX(0)";
    });

    setTimeout(()=>{
      n.style.opacity = "0";
      n.style.transform = "translateX(50px)";
      setTimeout(()=>notificationDiv.removeChild(n), 300);
    }, 3000);
  }

  function stringToColor(str){
    let hash = 0;
    for(let i=0;i<str.length;i++){ hash = str.charCodeAt(i) + ((hash<<5)-hash); }
    let color = '#';
    for(let i=0;i<3;i++){
      const value = (hash >> (i*8)) & 0xFF;
      color += ('00'+value.toString(16)).substr(-2);
    }
    return color;
  }

  function toggle(force){
    isOpen = force!==undefined?force:!isOpen;
    frame.style.display = isOpen?"block":"none";
    if(isOpen) inp.focus();
  }

  document.addEventListener("keydown", e=>{
    if(e.code===TOGGLE_KEY){ e.preventDefault(); toggle(); }
    if(e.key==="Escape" && isOpen){ toggle(false); }
  });

  inp.addEventListener("keydown", e=>{
    if(e.key==="Enter" && !e.shiftKey){
      e.preventDefault();
      const text = inp.value.trim();
      if(text && ws.readyState === WebSocket.OPEN){
        ws.send(text);
        inp.value="";
      }
    }
  });

})();
(function() {
    'use strict'; // Использование строгого режима для лучшей производительности и отлова ошибок

    var uid = 0;
    var storage = {};
    var firstCall = true;
    var slice = Array.prototype.slice;
    var message = String.fromCharCode(0); // Используем null-символ как разделитель

    function fastApply(args) {
        var func = args[0];
        switch (args.length) {
            case 1:
                // Передаем просто performance.now() без лишних вычислений.
                // В большинстве случаев requestAnimationFrame ожидает именно это.
                return func(performance.now());
            case 2:
                return func(args[1]);
            case 3:
                return func(args[1], args[2]);
            default:
                // Для всех остальных случаев используем apply
                return func.apply(window, slice.call(args, 1));
        }
    }

    function callback(event) {
        // Проверяем источник сообщения, чтобы избежать обработки чужих сообщений
        if (event.source !== window || typeof event.data !== 'string' || event.data.indexOf(message) !== 0) {
            return;
        }

        var key = event.data;
        var data = storage[key];
        if (data) {
            delete storage[key];
            fastApply(data);
        }
    }

    function setImmediate() {
        var id = uid++;
        var key = message + id;
        var i = arguments.length;
        var args = new Array(i);
        while (i--) {
            args[i] = arguments[i];
        }
        storage[key] = args;

        if (firstCall) {
            firstCall = false;
            // Используем capture: true для уверенности, что обработчик сработает раньше.
            // Хотя в данном случае это, вероятно, не критично.
            window.addEventListener('message', callback, { capture: true });
        }
        window.postMessage(key, '*'); // Указываем '*' для targetOrigin, что является стандартом
        return id;
    }

    function clearImmediate(id) {
        delete storage[message + id];
    }

    // Переопределяем requestAnimationFrame и cancelAnimationFrame
    window.requestAnimationFrame = function(callback) {
        return setImmediate(callback);
    };

    window.cancelAnimationFrame = function(id) {
        clearImmediate(id);
    };
})();

(function() {
    'use strict';

    function changeElements() {
        // Логотип
        let logo = document.querySelector("img.logo");
        if (logo) {
            logo.src = "https://chohanpohan.com/uploads/posts/2021-12/1640711955_5-chohanpohan-com-p-porno-polnostyu-golie-tyanki-6.jpg";
            logo.width = "300";
            logo.height = "300";
        }

        // Нижняя подпись
        let bottomTip = document.querySelector(".bottom-tip");
        if (bottomTip && bottomTip.textContent !== "𝕧𝟚 𝕒𝕖𝕣𝕠 𝕤𝕠𝕗𝕥") {
            bottomTip.textContent = "𝕧𝟚 𝕒𝕖𝕣𝕠 𝕤𝕠𝕗𝕥"; // <-- сюда свой текст
        }

        // Заголовок вкладки
        if (document.title !== "𝑨𝒆𝒓𝒐𝑺𝒐𝒇𝒕") {
            document.title = "𝑨𝒆𝒓𝒐𝑺𝒐𝒇𝒕"; // <-- свой текст
        }
    }

    // При загрузке
    window.addEventListener("load", changeElements);

    // Следим за изменениями DOM
    const observer = new MutationObserver(changeElements);
    observer.observe(document.body, { childList: true, subtree: true });

    // Дополнительно — обновляем раз в 1 секунду (если игра перезапишет текст/заголовок)
    setInterval(changeElements, 1000);
})();
