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

  // ================== СТИЛИ МЕНЮ ==================
  const menuStylesId = 'aeroMenuStylesV8';
  if (!document.getElementById(menuStylesId)) {
    const style = document.createElement('style');
    style.id = menuStylesId;
    style.textContent = `
      :root{
        --aero-accent:#00f0ff;
        --aero-text:#d2f7ff;
        --aero-muted:#9bd9e4;
        --aero-border:rgba(0,240,255,.25);
        --card-bg:linear-gradient(180deg, rgba(255,255,255,.04), rgba(0,0,0,.20));
      }
      .aero-menu{
        position:fixed; top:120px; left:120px; width:720px;
        color:var(--aero-text); z-index:999999; border-radius:16px;
        border:1px solid var(--aero-border);
        background: linear-gradient(180deg, rgba(13,17,27,.96), rgba(9,12,20,.96));
        box-shadow: 0 12px 36px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.03) inset;
        backdrop-filter: blur(10px) saturate(140%); -webkit-backdrop-filter: blur(10px) saturate(140%);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Segoe UI Emoji";
        user-select:none; overflow:hidden;
      }
      .aero-header{
        display:flex; align-items:center; justify-content:center; gap:8px; padding:6px 8px; cursor:move;
        background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,0));
        border-bottom:1px solid var(--aero-border);
        text-transform:uppercase; letter-spacing:.12em; font-weight:700; font-size:12px;
        text-shadow: 0 0 10px rgba(0,240,255,.35); position:relative;
      }
      #closeMenuBtn{
        position:absolute; right:8px; top:4px; line-height:1; font-size:14px;
        color:#ff6b6b; background:transparent; border:0; cursor:pointer; padding:6px; border-radius:8px;
        transition: transform .06s ease, filter .2s ease;
      }
      #closeMenuBtn:hover{ filter: drop-shadow(0 0 8px rgba(255,107,107,.7)); transform: translateY(-1px); }

      .aero-layout{ display:grid; grid-template-columns:150px 1fr; gap:8px; padding:8px; }
      .sidebar{ background: var(--card-bg); border:1px solid var(--aero-border); border-radius:12px; padding:6px; height:max-content; }
      .nav-item{ display:flex; align-items:center; gap:8px; padding:6px 8px; border-radius:8px; color:var(--aero-muted); cursor:pointer; }
      .nav-item.active{ color:var(--aero-text); background: rgba(0,240,255,.08); border:1px solid var(--aero-border); }
      .nav-sep{ height:1px; background:linear-gradient(90deg, rgba(0,240,255,0), rgba(0,240,255,.25), rgba(0,240,255,0)); margin:6px 0; border-radius:999px; }

      .content{ display:grid; grid-template-columns: 1fr 1fr; gap:6px; }
      .card{ background: var(--card-bg); border:1px solid var(--aero-border); border-radius:12px; padding:6px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.02); }
      .card.autoe{ grid-column: span 2; }
      .card h6{ margin:0 0 6px 0; font-size:12px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:#bff8ff; opacity:.9; }

      .keys-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:6px; }
      .row{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:4px 6px;
            border:1px dashed rgba(0,240,255,.20); border-radius:10px; background:rgba(255,255,255,.02);
            transition: box-shadow .2s ease, border-color .2s ease, transform .06s ease; }
      .row:hover{ box-shadow: 0 6px 16px rgba(0,240,255,.08); border-color:rgba(0,240,255,.35); transform: translateY(-1px); }
      .row-label{ font-variant: all-small-caps; opacity:.95; }
      .k-btn{
        display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px;
        border:1px solid var(--aero-border);
        background: linear-gradient(180deg, rgba(0,240,255,.15), rgba(0,0,0,.2));
        box-shadow: inset 0 0 15px rgba(0,240,255,.14), 0 0 0 1px rgba(255,255,255,.04);
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
        font-size:12px; color:#affbff; cursor:pointer; transition: transform .06s ease, box-shadow .2s ease, opacity .2s ease;
      }
      .k-btn:hover{ transform: translateY(-1px); box-shadow: inset 0 0 20px rgba(0,240,255,.22), 0 8px 18px rgba(0,240,255,.08); }

      .toggles-grid{ display:grid; grid-template-columns: 1fr 1fr; gap:6px; }
      .switch{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:4px 6px;
               border:1px dashed rgba(0,240,255,.15); border-radius:10px; background:rgba(255,255,255,.02); }
      .switch .label{ font-size:12px; opacity:.88; }
      .switch input[type="checkbox"]{
        appearance:none; width:42px; height:22px; border-radius:999px; position:relative; outline:none; cursor:pointer;
        background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.25));
        border:1px solid rgba(255,255,255,.12); box-shadow: inset 0 0 10px rgba(0,0,0,.35);
        transition: background .2s ease, box-shadow .2s ease, border-color .2s ease;
      }
      .switch input[type="checkbox"]::after{
        content:""; position:absolute; top:2px; left:2px; width:18px; height:18px; border-radius:999px;
        background: radial-gradient(circle at 30% 30%, #fff, #d7fbff);
        box-shadow: 0 2px 6px rgba(0,0,0,.45); transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .2s ease;
      }
      .switch input[type="checkbox"]:checked{ border-color: var(--aero-accent); box-shadow: inset 0 0 16px rgba(0,240,255,.28); }
      .switch input[type="checkbox"]:checked::after{ transform: translateX(20px); box-shadow: 0 0 14px rgba(0,240,255,.65); }

      .slider{ display:flex; flex-direction:column; gap:8px; }
      .slider-row{ display:grid; grid-template-columns: 160px 1fr 48px; align-items:center; gap:8px; }
      .slider-row .slabel{ font-size:12px; color:var(--aero-muted); }
      .slider-row .sval{ font-size:12px; text-align:right; color:#bff8ff; }
      .slider-row input[type="range"]{ width:100%; accent-color: var(--aero-accent); }

      .inline{ display:flex; align-items:center; gap:8px; }
      .aero-btn{ padding:6px 8px; border-radius:10px; cursor:pointer; font-weight:600; flex:1;
        border:1px solid var(--aero-border); color:#bffcff; background:linear-gradient(180deg, rgba(0,240,255,.16), rgba(0,0,0,.25));
        transition: filter .2s ease, transform .06s ease; }
      .aero-btn:hover{ filter: drop-shadow(0 0 12px rgba(0,240,255,.35)); transform: translateY(-1px); }

      .footer{ margin-top:4px; text-align:center; font-size:11px; color: rgba(175,255,255,.55); }
      @media (max-width:820px){ .aero-menu{ width:92vw; } .content{ grid-template-columns: 1fr; } .card.autoe{ grid-column:auto; } }
    `;
    document.head.appendChild(style);
  }

  // ================== МЕНЮ ==================
  const menu = document.createElement('div');
  menu.className = 'aero-menu';
  menu.innerHTML = `
    <div id="menuHeader" class="aero-header">
      𝐓𝐚𝐦𝐢𝐍𝐞𝐠 𝐯𝟑   · ᴬᵉʳᵒˢᵒᶠᵗ
      <button id="closeMenuBtn">✕</button>
    </div>

    <div class="aero-layout">
      <div class="sidebar">
        <div class="nav-item active" data-tab="home">Главная</div>
        <div class="nav-item" data-tab="visual">Визуал</div>
        <div class="nav-item" data-tab="clans"></div>
        <div class="nav-item" data-tab="graphics"></div>
        <div class="nav-sep"></div>
        <div class="nav-item" data-tab="net"></div>
        <div class="nav-item" data-tab="overlays">TamiNeg Chat F8</div>
      </div>

      <!-- Главная -->
      <div class="content content-home">
        <div class="card">
          <h6>Клавиши</h6>
          <div class="keys-grid">
            <div class="row"><span class="row-label">ᴀᴜᴛᴏ-ᴇ</span><span class="k-btn" data-func="autoE">[${keyBindings.autoE}]</span></div>
            <div class="row"><span class="row-label">ᴀᴜᴛᴏ ɢʜ</span><span class="k-btn" data-func="autoGH">[${keyBindings.autoGH}]</span></div>
            <div class="row"><span class="row-label">ᴀᴜᴛᴏ ꜱᴡᴀᴘ</span><span class="k-btn" data-func="autoSwap">[${keyBindings.autoSwap}]</span></div>
            <div class="row"><span class="row-label">ᴀᴜᴛᴏ ʟᴇᴀᴠᴇ</span><span class="k-btn" data-func="autoLeave">[${keyBindings.autoLeave}]</span></div>
            <div class="row"><span class="row-label">ᴀᴜᴛᴏ ʙᴏᴏᴍ(НЕ РАБОТАЕТ)</span><span class="k-btn" data-func="autoX">[${keyBindings.autoX}]</span></div>
          </div>
        </div>

        <div class="card">
          <h6>Тогглы</h6>
          <div class="toggles-grid">
            <div class="switch"><span class="label">ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ-ᴇ</span><input type="checkbox" id="autoEToggle"></div>
            <div class="switch"><span class="label">ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ɢʜ</span><input type="checkbox" id="autoGHToggle"></div>
            <div class="switch"><span class="label">ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ꜱᴡᴀᴘ</span><input type="checkbox" id="autoSwapToggle"></div>
            <div class="switch"><span class="label">ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ʟᴇᴀᴠᴇ</span><input type="checkbox" id="autoLeaveToggle"></div>
            <div class="switch"><span class="label">ᴇɴᴀʙʟᴇ ᴀᴜᴛᴏ ʙᴏᴏᴍ</span><input type="checkbox" id="autoXToggle"></div>
          </div>
        </div>

        <div class="card autoe">
          <h6>Auto-E (настроить под свой мс)</h6>
          <div class="slider">
            <div class="slider-row">
              <span class="slabel">E (шт/тик)</span>
              <input type="range" id="autoEBurst" min="1" max="10" value="3">
              <span class="sval" id="autoEBurstVal">3×</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Задержка</span>
              <input type="range" id="autoEDelay" min="5" max="400" step="5" value="80">
              <span class="sval" id="autoEDelayVal">80</span>
            </div>
            <!-- SpeedHack, привязан к Auto-E -->
            <div class="slider-row">
              <span class="slabel">Скорость</span>
              <input type="range" id="speedFactorAE" min="1" max="300" step="1" value="100">
              <span class="sval" id="speedFactorAEVal">100×</span>
            </div>
            <div class="slider-row">
              <span class="slabel">задержка скорости</span>
              <input type="range" id="speedDelayAE" min="5" max="200" step="5" value="20">
              <span class="sval" id="speedDelayAEVal">20</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Визуал -->
      <div class="content content-visual" style="display:none">
        <div class="card">
          <h6>Экран</h6>
          <div class="slider">
            <div class="slider-row">
              <span class="slabel">Яркость (%)</span>
              <input type="range" id="scrBright" min="50" max="200" value="100">
              <span class="sval" id="scrBrightVal">100</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Контраст (%)</span>
              <input type="range" id="scrContrast" min="50" max="200" value="100">
              <span class="sval" id="scrContrastVal">100</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Насыщенность (%)</span>
              <input type="range" id="scrSatur" min="0" max="300" value="100">
              <span class="sval" id="scrSaturVal">100</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Оттенок (°)</span>
              <input type="range" id="scrHue" min="-180" max="180" value="0">
              <span class="sval" id="scrHueVal">0°</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Сепия (%)</span>
              <input type="range" id="scrSepia" min="0" max="100" value="0">
              <span class="sval" id="scrSepiaVal">0</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Ч/Б (%)</span>
              <input type="range" id="scrGray" min="0" max="100" value="0">
              <span class="sval" id="scrGrayVal">0</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Тонировка</span>
              <input type="color" id="scrTintColor" value="#00ffff">
              <span class="sval" id="scrTintColorVal">#00FFFF</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Интенсивность тона (%)</span>
              <input type="range" id="scrTintAlpha" min="0" max="100" value="0">
              <span class="sval" id="scrTintAlphaVal">0</span>
            </div>
            <div class="slider-row">
              <span class="slabel">Режим смешивания</span>
              <select id="scrBlend">
                <option value="multiply">multiply</option>
                <option value="overlay">overlay</option>
                <option value="screen">screen</option>
                <option value="soft-light">soft-light</option>
                <option value="color">color</option>
              </select>
              <span class="sval" style="opacity:.6">&nbsp;</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="inline">
            <button id="bgToggleBtn" class="aero-btn">ᴜᴄᴛᴀɴᴏᴠɪᴛь ꜰᴏɴ ˖✧ +18 ✧˖</button>
            <div class="switch mini"><span class="label">FPS</span><input type="checkbox" id="fpsToggle"></div>
          </div>
          <div class="footer">𝑬кран · фильтры и тонировка</div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(menu);

  // === Переключение вкладок ===
  (() => {
    const tabs = menu.querySelectorAll('.sidebar .nav-item');
    const show = (tab) => {
      menu.querySelector('.content-home').style.display   = (tab === 'home')   ? '' : 'none';
      menu.querySelector('.content-visual').style.display = (tab === 'visual') ? '' : 'none';
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    };
    tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
    // по умолчанию «Главная»
    show('home');
  })();

  // === Insert: toggle menu show/hide ===
  (() => {
    const TOGGLE_KEY = 'Insert';
    document.addEventListener('keydown', (e) => {
      if (e.code !== TOGGLE_KEY) return;
      e.preventDefault();
      const hidden = menu.style.display === 'none';
      menu.style.display = hidden ? 'block' : 'none';
      const reopenEl = Array.from(document.querySelectorAll('div'))
        .find(el => el.textContent && el.textContent.trim() === '⚙ Menu');
      if (reopenEl) reopenEl.style.display = hidden ? 'none' : 'block';
    });
  })();

  // обновление чисел возле слайдеров (Auto-E + SpeedHack AE)
  (() => {
    const burst = menu.querySelector('#autoEBurst');
    const burstVal = menu.querySelector('#autoEBurstVal');
    const delay = menu.querySelector('#autoEDelay');
    const delayVal = menu.querySelector('#autoEDelayVal');
    const sf = menu.querySelector('#speedFactorAE');
    const sfVal = menu.querySelector('#speedFactorAEVal');
    const sd = menu.querySelector('#speedDelayAE');
    const sdVal = menu.querySelector('#speedDelayAEVal');
    const upd = () => {
      burstVal && burst && (burstVal.textContent = `${burst.value}×`);
      delayVal && delay && (delayVal.textContent = `${delay.value}`);
      sfVal && sf && (sfVal.textContent = `${sf.value}×`);
      sdVal && sd && (sdVal.textContent = `${sd.value}`);
    };
    burst?.addEventListener('input', upd);
    delay?.addEventListener('input', upd);
    sf?.addEventListener('input', upd);
    sd?.addEventListener('input', upd);
    upd();
  })();

  // ================== FPS оверлей ==================
  const fpsBox = document.createElement("div");
  Object.assign(fpsBox.style, {
    position: "fixed", top: "5px", left: "5px", padding: "4px 8px",
    fontFamily: "monospace", color: "#0ff", fontSize: "14px",
    border: "1px solid #0ff", borderRadius: "6px",
    backgroundImage: "url('https://th.bing.com/th/id/R.c1d14fe56a019705250fa4d40be21005?rik=htXlTJdgq84cUg&pid=ImgRaw&r=0')",
    backgroundSize: "cover", backgroundPosition: "center",
    display: "none", zIndex: "999997"
  });
  document.body.appendChild(fpsBox);

  let lastFrame = performance.now();
  let frames = 0;
  function updateFPS(now) {
    frames++;
    if (now - lastFrame >= 1000) {
      fpsBox.textContent = `FPS: ${frames}`;
      frames = 0;
      lastFrame = now;
    }
    requestAnimationFrame(updateFPS);
  }
  requestAnimationFrame(updateFPS);
  document.getElementById("fpsToggle").addEventListener("change", e => {
    fpsBox.style.display = e.target.checked ? "block" : "none";
  });

  // ================== КНОПКА ФОНА (вкладка Визуал) ==================
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

  // кнопка «⚙ Menu» для повторного открытия
  const reopenBtn = document.createElement("div");
  reopenBtn.textContent = "⚙ Menu";
  Object.assign(reopenBtn.style, {
    position:"fixed", bottom:"10px", right:"10px", background:"rgba(20,20,35,0.9)",
    border:"1px solid #0ff", borderRadius:"6px", padding:"4px 8px",
    fontFamily:"monospace", color:"#0ff", cursor:"pointer", zIndex:"999999", display:"none"
  });
  document.body.appendChild(reopenBtn);
  document.getElementById("closeMenuBtn").addEventListener("click", () => {
    menu.style.display = "none"; reopenBtn.style.display = "block";
  });
  reopenBtn.addEventListener("click", () => {
    menu.style.display = "block"; reopenBtn.style.display = "none";
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
  document.getElementById('autoXToggle')?.addEventListener('change', e => autoState.autoX.enabled = e.target.checked);

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

  // ================== AUTO-E + индикатор + SpeedHack (привязан к Auto-E) ==================
  (function(){
    // styles for indicator
    const indStyleId = 'aeroAutoEIndicatorStylesV2';
    if (!document.getElementById(indStyleId)) {
      const st = document.createElement('style'); st.id = indStyleId;
      st.textContent = `
        #ae-indicator{ --size:56px; --spinDur:1.1s; --dot:6px; --core:10px; --orbitR:20px; --ringStroke:2px; --capSize:10px; --capOffset:6px;
          position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(.96); width:var(--size); height:var(--size);
          pointer-events:none; z-index:999998; opacity:0; transition: opacity .15s ease, transform .15s ease; filter: drop-shadow(0 0 12px rgba(0,240,255,.55)); }
        #ae-indicator.active{ opacity:1; transform:translate(-50%,-50%) scale(1); }
        #ae-indicator .ring{ position:absolute; inset:0; border-radius:50%; box-shadow: inset 0 0 0 var(--ringStroke) rgba(0,240,255,.35), inset 0 0 24px rgba(0,240,255,.15); }
        #ae-indicator .sweep{ position:absolute; inset:0; border-radius:50%; background: conic-gradient(from 0deg, rgba(0,240,255,.85) 0 28%, transparent 28% 100%); -webkit-mask: radial-gradient(circle, transparent 56%, #000 57%); mask: radial-gradient(circle, transparent 56%, #000 57%); animation: ae-spin var(--spinDur) linear infinite; mix-blend-mode: screen; opacity:.9; }
        #ae-indicator .orbits{ position:absolute; inset:0; border-radius:50%; animation: ae-spin var(--spinDur) linear infinite; }
        #ae-indicator .orb{ position:absolute; top:50%; left:50%; width:var(--dot); height:var(--dot); border-radius:50%; background:#00f0ff; box-shadow: 0 0 14px rgba(0,240,255,.9);
          transform-origin:center left; transform: rotate(var(--ang)) translate(var(--orbitR)) rotate(calc(-1*var(--ang))); animation: ae-pulse 1.2s ease-in-out infinite; }
        #ae-indicator .core{ position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:var(--core); height:var(--core); border-radius:50%;
          background:#bffcff; box-shadow: 0 0 22px rgba(0,240,255,.75), inset 0 0 8px rgba(255,255,255,.9); opacity:.95; animation: ae-breathe 2.2s ease-in-out infinite; }
        #ae-indicator .caption{ position:absolute; top:calc(100% + var(--capOffset)); left:50%; transform:translateX(-50%);
          font: 600 var(--capSize)/1.05 ui-sans-serif, system-ui; letter-spacing:.12em; text-transform:uppercase; color:#bffcff; opacity:.9; pointer-events:none; text-shadow: 0 0 4px rgba(0,240,255,.75), 0 0 10px rgba(0,240,255,.35); }
        #ae-indicator.flash .ring{ box-shadow: inset 0 0 0 var(--ringStroke) rgba(0,240,255,.55), inset 0 0 28px rgba(0,240,255,.28); }
        @keyframes ae-spin { to { transform: rotate(360deg); } }
        @keyframes ae-pulse { 50% { transform: rotate(var(--ang)) translate(var(--orbitR)) rotate(calc(-1*var(--ang))) scale(1.18); } }
        @keyframes ae-breathe { 50% { transform: translate(-50%,-50%) scale(1.08); } }
      `;
      document.head.appendChild(st);
    }

    // indicator DOM
    let aeIndicator = document.getElementById('ae-indicator');
    if (!aeIndicator) {
      aeIndicator = document.createElement('div');
      aeIndicator.id = 'ae-indicator';
      aeIndicator.innerHTML = `<div class="ring"></div><div class="sweep"></div><div class="orbits"></div><div class="core"></div><div class="caption">autoE</div>`;
      document.body.appendChild(aeIndicator);
    }
    const orbitsEl = aeIndicator.querySelector('.orbits');
    function rebuildOrbits(burst){
      orbitsEl.innerHTML = ''; const n = Math.max(1, Math.min(16, burst|0));
      for (let i=0; i<n; i++){ const d = document.createElement('div'); d.className='orb'; d.style.setProperty('--ang', `${(360/n)*i}deg`); orbitsEl.appendChild(d); }
    }
    function mapDelayToSpin(delayMs){
      const clamped = Math.max(5, Math.min(400, delayMs|0));
      const t = (clamped - 5) / (400 - 5); return Math.max(0.3, Math.min(3.0, 0.35 + t * (2.5 - 0.35)));
    }
    function updateIndicatorFromSliders(){
      const burst = parseInt(document.getElementById('autoEBurst')?.value || '3', 10);
      const delay = parseInt(document.getElementById('autoEDelay')?.value || '80', 10);
      rebuildOrbits(burst);
      aeIndicator.style.setProperty('--spinDur', `${mapDelayToSpin(delay)}s`);
    }
    ['autoEBurst','autoEDelay'].forEach(id=>document.getElementById(id)?.addEventListener('input', updateIndicatorFromSliders));
    updateIndicatorFromSliders();

    // Auto-E loop
    let running=false, held=false, timer=null, activeMouseKey=null;
    const autoEBtn = menu.querySelector('.k-btn'); // первая .k-btn = autoE
    const autoEToggle = document.getElementById('autoEToggle');
    const getBurstEl = () => document.getElementById('autoEBurst');
    const getDelayEl = () => document.getElementById('autoEDelay');

    function sendE(){ const VK_E=69; ['keydown','keyup'].forEach(type=>document.dispatchEvent(new KeyboardEvent(type,{key:'E',code:'KeyE',keyCode:VK_E,which:VK_E,bubbles:true}))); }
    function loop(){
      if(!running) return;
      const burst = Math.max(1, parseInt(getBurstEl()?.value || 3,10));
      const delayMs = Math.max(0, parseInt(getDelayEl()?.value || 80,10));
      for(let i=0;i<burst;i++) setTimeout(sendE, i*22);
      aeIndicator.classList.add('flash'); setTimeout(()=>aeIndicator.classList.remove('flash'),100);
      timer = setTimeout(loop, delayMs);
    }
    const showIndicator=()=>{ updateIndicatorFromSliders(); aeIndicator.classList.add('active'); };
    const hideIndicator=()=>{ aeIndicator.classList.remove('active'); };

    function startAutoE(){ if(held || !autoEToggle?.checked) return; held=true; running=true; loop(); if(autoEBtn) autoEBtn.style.color="#0f0"; showIndicator(); }
    function stopAutoE(){ held=false; running=false; clearTimeout(timer); if(autoEBtn) autoEBtn.style.color="#0ff"; hideIndicator(); }
    const fromMenu = (t)=> !!(t && (t.closest('.aero-menu') || t.closest('#menuContent') || t.closest('#menuHeader')));

    autoEBtn.addEventListener('click', ()=>{ autoEBtn.textContent='[Press Key]'; waitingKey='autoE'; });
    window.addEventListener('keydown', e=>{
      if(waitingKey==='autoE'){ e.preventDefault(); keyBindings.autoE=e.code; autoEBtn.textContent=`[${e.code}]`; waitingKey=null; return; }
      if(e.code===keyBindings.autoE && autoEToggle.checked && !held){ e.preventDefault(); startAutoE(); }
    },{capture:true});
    window.addEventListener('keyup', e=>{ if(e.code===keyBindings.autoE) stopAutoE(); },{capture:true});
    function handleDown(button, target){
      if (waitingKey) return; if (fromMenu(target)) return;
      const key=`Mouse${button}`; if (keyBindings.autoE===key && autoEToggle.checked && !held){ try{ event?.preventDefault(); }catch{} activeMouseKey=key; startAutoE(); }
    }
    function handleUp(button){ const key=`Mouse${button}`; if(activeMouseKey===key){ activeMouseKey=null; stopAutoE(); } }
    window.addEventListener('pointerdown', e=>handleDown(e.button,e.target), {capture:true, passive:false});
    window.addEventListener('pointerup',   e=>handleUp(e.button),            {capture:true});
    window.addEventListener('mousedown',   e=>handleDown(e.button,e.target), {capture:true, passive:false});
    window.addEventListener('mouseup',     e=>handleUp(e.button),            {capture:true});
    window.addEventListener('auxclick',    e=>{ if(`Mouse${e.button}`===keyBindings.autoE) e.preventDefault(); }, {capture:true, passive:false});
    window.addEventListener('contextmenu', e=>{ if(keyBindings.autoE==='Mouse2' && held) e.preventDefault(); },   {capture:true, passive:false});

    // SpeedHack через Date.now — привязан к Auto-E и читает слайдеры
    const originalNow = Date.now.bind(Date);
    let lastReal = originalNow(), offset = 0, acc = 0;
    Date.now = new Proxy(originalNow, {
      apply(target,thisArg,args){
        const t = Reflect.apply(target,thisArg,args);
        const dt = t - lastReal; lastReal = t;
        if (held && autoEToggle?.checked) {
          const factor = Math.max(1, parseInt(document.getElementById('speedFactorAE')?.value || '100',10));
          const delayMs= Math.max(5, parseInt(document.getElementById('speedDelayAE') ?.value || '20', 10));
          acc += dt;
          if(acc >= delayMs){ const n = Math.floor(acc/delayMs); offset += n*delayMs*(factor-1); acc -= n*delayMs; }
        } else { acc = 0; }
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
  function delay(ms){ return new Promise(res=>setTimeout(res, ms)); }
  async function swapLoop() {
    if (!autoState.autoSwap.held || !autoState.autoSwap.enabled) return;
    pressKey("8", "Digit8", 56);
    await delay(62);
    await clickAtCursorFunc();
    pressKey("7", "Digit7", 55);
    autoState.autoSwap.timer = setTimeout(swapLoop, 376);
  }

  // ================== AUTO HEAL (X) ==================
  let xActionRunning = false, isXPressed = false;
  async function clickAtCursor() {
    const el = document.elementFromPoint(cursorX, cursorY); if (!el) return;
    const opts = { bubbles:true, cancelable:true, button:0, clientX:cursorX, clientY:cursorY };
    el.dispatchEvent(new MouseEvent("mousedown", opts)); await delay(54); el.dispatchEvent(new MouseEvent("mouseup", opts));
  }
  async function performXActions() {
    if (xActionRunning) return; xActionRunning = true;
    while (isXPressed && autoState.autoX.enabled) {
      await pressKey("6", "Digit6", 56); await delay(62); await clickAtCursor(); await pressKey("5", "Digit5", 55); await delay(105);
      if (!autoState.autoX.enabled) break;
    }
    xActionRunning = false;
  }
  const autoXBtn = menu.querySelector('.k-btn[data-func="autoX"]');
  const autoXToggle = document.getElementById('autoXToggle');
  autoXBtn.addEventListener('click', ()=>{ autoXBtn.textContent='[Press Key]'; waitingKey='autoX'; });
  autoXToggle.addEventListener('change', e => autoState.autoX.enabled = e.target.checked);
  document.addEventListener('keydown', e => {
    if (e.repeat) return;
    if (waitingKey === 'autoX') { e.preventDefault(); keyBindings.autoX = e.code; autoXBtn.textContent = `[${e.code}]`; waitingKey = null; return; }
    if (autoState.autoX.enabled && e.code === keyBindings.autoX) { isXPressed = true; performXActions(); e.preventDefault(); }
  });
  document.addEventListener('keyup', e => { if (e.code === keyBindings.autoX) isXPressed = false; });

  // ================== АВТО LEAVE ==================
  let wsConnection = null;
  const OriginalWebSocket = window.WebSocket;
  window.WebSocket = class extends OriginalWebSocket { constructor(...args){ super(...args); wsConnection = this; } };
  const autoLeavePacket = [255, 0, 0, 1];
  let autoLeaveKey = keyBindings.autoLeave;
  const autoLeaveBtn = menu.querySelector('.k-btn[data-func="autoLeave"]');
  function sendLeavePacket(){ if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) return; wsConnection.send(new Uint8Array(autoLeavePacket)); }
  autoLeaveBtn.addEventListener('click', ()=>{ autoLeaveBtn.textContent='[Press Key]'; waitingKey='autoLeave'; });
  document.addEventListener('keydown', e => {
    if (waitingKey === 'autoLeave') { e.preventDefault(); keyBindings.autoLeave = e.code; autoLeaveKey = e.code; autoLeaveBtn.textContent = `[${e.code}]`; waitingKey = null; return; }
    if (e.code === autoLeaveKey && autoState.autoLeave.enabled) { sendLeavePacket(); e.preventDefault(); }
  });

  // ================== ГЛОБАЛЬНЫЕ КЛАВИШИ ==================
  document.addEventListener("keydown", e => {
    if (e.repeat) return;
    if (autoState.autoGH.enabled && e.code === keyBindings.autoGH) { autoState.autoGH.held = true; ghLoop(); e.preventDefault(); }
    if (autoState.autoSwap.enabled && e.code === keyBindings.autoSwap) { autoState.autoSwap.held = true; swapLoop(); e.preventDefault(); }
    if (autoState.autoLeave.enabled && e.code === keyBindings.autoLeave) {
      autoState.autoLeave.held = !autoState.autoLeave.held;
      if (!autoState.autoLeave.held) { clearTimeout(autoState.autoLeave.timer); autoState.autoLeave.timer = null; }
      e.preventDefault();
    }
  });
  document.addEventListener("keyup", e => {
    if (e.code === keyBindings.autoE)    { autoState.autoE.held = false;  clearTimeout(autoState.autoE.timer); }
    if (e.code === keyBindings.autoGH)   { autoState.autoGH.held = false; clearTimeout(autoState.autoGH.timer); }
    if (e.code === keyBindings.autoSwap) { autoState.autoSwap.held = false; clearTimeout(autoState.autoSwap.timer); }
  });

  // ================== «Экран»: фильтры и тонировка (вкладка Визуал) ==================
  (() => {
    const canvas = document.getElementById("unity-canvas");
    const targetEl = canvas || document.documentElement;

    // полупрозрачный цветной слой
    let tint = document.getElementById("screenTint");
    if (!tint) {
      tint = document.createElement("div");
      tint.id = "screenTint";
      Object.assign(tint.style, { position:"fixed", inset:"0", pointerEvents:"none", zIndex:"999996",
        background:"transparent", mixBlendMode:"multiply", opacity:"0" });
      document.body.appendChild(tint);
    }

    function updateFilters() {
      const b  = +document.getElementById("scrBright").value;
      const ct = +document.getElementById("scrContrast").value;
      const st = +document.getElementById("scrSatur").value;
      const h  = +document.getElementById("scrHue").value;
      const sp = +document.getElementById("scrSepia").value;
      const g  = +document.getElementById("scrGray").value;

      document.getElementById("scrBrightVal").textContent  = b;
      document.getElementById("scrContrastVal").textContent= ct;
      document.getElementById("scrSaturVal").textContent   = st;
      document.getElementById("scrHueVal").textContent     = `${h}°`;
      document.getElementById("scrSepiaVal").textContent   = sp;
      document.getElementById("scrGrayVal").textContent    = g;

      targetEl.style.filter =
        `brightness(${b}%) contrast(${ct}%) saturate(${st}%) hue-rotate(${h}deg) sepia(${sp}%) grayscale(${g}%)`;
    }

    function updateTint() {
      const col  = document.getElementById("scrTintColor").value.toUpperCase();
      const a    = +document.getElementById("scrTintAlpha").value;
      const mode = document.getElementById("scrBlend").value;

      document.getElementById("scrTintColorVal").textContent = col;
      document.getElementById("scrTintAlphaVal").textContent = a;

      tint.style.background    = col;
      tint.style.opacity       = String(a / 100);
      tint.style.mixBlendMode  = mode;
    }

    ["scrBright","scrContrast","scrSatur","scrHue","scrSepia","scrGray"].forEach(id=>{
      document.getElementById(id).addEventListener("input", updateFilters);
    });
    ["scrTintColor","scrTintAlpha","scrBlend"].forEach(id=>{
      const el = document.getElementById(id);
      el.addEventListener("input", updateTint);
      el.addEventListener("change", updateTint);
    });

    updateFilters();
    updateTint();
  })();

})();

/* ================== rAF override (как было, можно убрать по желанию) ================== */
(function() {
  'use strict';
  const frameInterval = 5; // 5 мс ≈ 200 FPS
  let lastTime = 0;
  const _requestAnimationFrame = window.requestAnimationFrame;
  const _cancelAnimationFrame = window.cancelAnimationFrame;
  window.requestAnimationFrame = function(callback) {
    const now = performance.now();
    const delay = Math.max(0, frameInterval - (now - lastTime));
    lastTime = now + delay;
    return setTimeout(() => { callback(performance.now()); }, delay);
  };
  window.cancelAnimationFrame = function(id) { clearTimeout(id); };
})();

/* ================== Лого/титлы ================== */
(function() {
  'use strict';
  function changeElements() {
    const logo = document.querySelector("img.logo");
    if (logo) { logo.src = "https://chohanpohan.com/uploads/posts/2021-12/1640711955_5-chohanpohan-com-p-porno-polnostyu-golie-tyanki-6.jpg"; logo.width = "300"; logo.height = "300"; }
    const bottomTip = document.querySelector(".bottom-tip");
    if (bottomTip && bottomTip.textContent !== "𝕧𝟚 𝕒𝕖𝕣𝕠 𝕤𝕠𝕗𝕥") bottomTip.textContent = "𝕧𝟚 𝕒𝕖𝕣𝕠 𝕤𝕠𝕗𝕥";
    if (document.title !== "𝑨𝒆𝒓𝒐𝑺𝒐𝒇𝒕") document.title = "𝑨𝒆𝒓𝒐𝑺𝒐𝒇𝒕";
  }
  window.addEventListener("load", changeElements);
  const observer = new MutationObserver(changeElements);
  observer.observe(document.body, { childList: true, subtree: true });
  setInterval(changeElements, 1000);
})();
