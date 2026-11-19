class SimulatedBCIDevice extends EventTarget {
  constructor() {
    super();
    this.connected = false;
    this._timer = null;
    this.attention = 0.4;
    this.meditation = 0.5;
  }

  connect() {
    this.connected = true;
    this._timer = setInterval(() => this._tick(), 100);
    this.dispatchEvent(new Event('connect'));
  }

  disconnect() {
    this.connected = false;
    clearInterval(this._timer);
    this.dispatchEvent(new Event('disconnect'));
  }

  _tick() {
    this.attention  = this._walk(this.attention);
    this.meditation = this._walk(this.meditation);
    this.dispatchEvent(new CustomEvent('data', {
      detail: { attention: this.attention, meditation: this.meditation }
    }));
  }

  _walk(v) {
    v += (Math.random() - 0.5) * 0.12;
    return Math.max(0, Math.min(1, v));
  }

  blink() {
    if (!this.connected) return;
    this.dispatchEvent(new Event('blink'));
  }
}

const device = new SimulatedBCIDevice();

const orb        = document.querySelector('#orb');
const orb2       = document.querySelector('#orb2');
const pulse      = document.querySelector('#pulse');
const rig        = document.querySelector('#rig');
const hud3d      = document.querySelector('#hud3d');
const boxEl      = document.querySelector('a-box');
const cylinderEl = document.querySelector('a-cylinder');

const attnBar    = document.querySelector('#attn span');
const mediBar    = document.querySelector('#medi span');
const attnV      = document.querySelector('#attn-v');
const mediV      = document.querySelector('#medi-v');
const statusEl   = document.querySelector('#status');
const connectBtn = document.querySelector('#connect');
const blinkBtn   = document.querySelector('#blink');

if (orb) {
  orb.setAttribute('material', {
    metalness: 0.35,
    roughness: 0.25,
    opacity: 0.9,
    transparent: true
  });
  orb.setAttribute('animation__spin', {
    property: 'rotation',
    to: '0 360 0',
    dur: 8000,
    loop: true,
    easing: 'linear'
  });
}

if (orb2) {
  orb2.setAttribute('material', {
    metalness: 0.3,
    roughness: 0.35,
    emissive: '#F43B2A',
    emissiveIntensity: 0.25
  });
}

if (boxEl) {
  boxEl.classList.add('interactivo');
  boxEl.setAttribute('material', {
    metalness: 0.5,
    roughness: 0.25
  });
}

if (cylinderEl) {
  cylinderEl.classList.add('interactivo');
  cylinderEl.setAttribute('material', {
    metalness: 0.25,
    roughness: 0.3,
    emissive: '#FFC65D',
    emissiveIntensity: 0.1
  });
  cylinderEl.setAttribute('animation__spin', {
    property: 'rotation',
    from: '0 0 0',
    to: '0 360 0',
    dur: 10000,
    loop: true,
    easing: 'linear'
  });
}

document.querySelectorAll('.interactivo').forEach((el) => {
  el.addEventListener('mouseenter', () => {
    el.setAttribute('animation__hover', {
      property: 'scale',
      to: '1.18 1.18 1.18',
      dur: 180,
      easing: 'easeOutQuad'
    });
  });

  el.addEventListener('mouseleave', () => {
    el.setAttribute('animation__hover', {
      property: 'scale',
      to: '1 1 1',
      dur: 180,
      easing: 'easeOutQuad'
    });
  });
});

function meditationColor(m) {
  const hue = 200 - m * 180;
  return `hsl(${hue}, 80%, 55%)`;
}

device.addEventListener('data', (e) => {
  const { attention, meditation } = e.detail;

  const y = 1.0 + attention * 1.8;
  const r = 0.4 + attention * 0.6;
  orb.setAttribute('position', { x: 0, y, z: -3 });
  orb.setAttribute('radius', r);
  pulse.setAttribute('position', { x: 0, y, z: -3 });

  const spinDur = Math.round(8000 - attention * 6200);
  orb.setAttribute('animation__spin', 'dur', spinDur);

  const color = meditationColor(meditation);
  orb.setAttribute('color', color);
  orb.setAttribute('material', 'emissive', color);
  orb.setAttribute('material', 'emissiveIntensity', (0.1 + meditation * 0.45).toFixed(2));

  if (orb2) {
    orb2.setAttribute('material', 'emissiveIntensity', (0.2 + attention * 0.8).toFixed(2));
    const orb2Scale = (1 + attention * 0.25).toFixed(2);
    orb2.setAttribute('scale', `${orb2Scale} ${orb2Scale} ${orb2Scale}`);
  }

  if (cylinderEl) {
    const newHeight = 1.0 + meditation * 1.6;
    const newY = newHeight / 2;

    cylinderEl.setAttribute('height', newHeight.toFixed(2));
    cylinderEl.setAttribute('position', { x: 1, y: newY, z: -3 });
    cylinderEl.setAttribute('material', 'emissiveIntensity', (0.1 + meditation * 0.5).toFixed(2));
  }

  const a = Math.round(attention * 100);
  const m = Math.round(meditation * 100);
  attnBar.style.width = a + '%';
  attnV.textContent = a + '%';
  mediBar.style.width = m + '%';
  mediV.textContent = m + '%';
  hud3d.setAttribute('value', `Atencion: ${a}%\nMeditacion: ${m}%`);
});

device.addEventListener('blink', () => {
  pulse.setAttribute('visible', true);
  pulse.setAttribute('scale', '0.5 0.5 0.5');
  pulse.setAttribute('material', 'shader: flat; opacity: 0.8; transparent: true');
  pulse.setAttribute('animation__grow',
    'property: scale; to: 3 3 3; dur: 400; easing: easeOutQuad');
  pulse.setAttribute('animation__fade',
    'property: material.opacity; from: 0.8; to: 0; dur: 400');
  setTimeout(() => pulse.setAttribute('visible', false), 420);

  const p = rig.getAttribute('position');
  rig.setAttribute('animation__move',
    `property: position; to: ${p.x} ${p.y} ${p.z - 0.8}; dur: 300; easing: easeOutQuad`);

  if (boxEl) {
    boxEl.setAttribute('animation__blink', {
      property: 'position',
      from: '-1 0.5 -3',
      to: '-1 1.0 -3',
      dir: 'alternate',
      dur: 220,
      loop: 1,
      easing: 'easeOutQuad'
    });
  }

  if (cylinderEl) {
    cylinderEl.setAttribute('animation__blink', {
      property: 'material.emissiveIntensity',
      from: 0.1,
      to: 0.9,
      dir: 'alternate',
      dur: 220,
      loop: 1
    });
  }
});

connectBtn.addEventListener('click', () => {
  if (device.connected) {
    device.disconnect();
  } else {
    device.connect();
  }
});

device.addEventListener('connect', () => {
  connectBtn.textContent = 'Desconectar dispositivo';
  connectBtn.classList.add('off');
  blinkBtn.classList.remove('off');
  statusEl.querySelector('b').textContent = 'conectado';
});

device.addEventListener('disconnect', () => {
  connectBtn.textContent = 'Conectar dispositivo';
  connectBtn.classList.remove('off');
  blinkBtn.classList.add('off');
  statusEl.querySelector('b').textContent = 'desconectado';
});

blinkBtn.addEventListener('click', () => device.blink());
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    device.blink();
  }
});