const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'public', 'images');
if (!fs.existsSync(imgDir)) {
  fs.mkdirSync(imgDir, { recursive: true });
}

function makeGeneratorSvg(brand, model, kva, color1, color2, isSilent = true) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="15" flood-color="#000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="800" height="500" fill="url(#bgGrad)"/>
  
  <!-- Subtle Grid Pattern -->
  <g stroke="#334155" stroke-width="0.5" opacity="0.3">
    <path d="M0 50 H800 M0 100 H800 M0 150 H800 M0 200 H800 M0 250 H800 M0 300 H800 M0 350 H800 M0 400 H800 M0 450 H800" />
    <path d="M100 0 V500 M200 0 V500 M300 0 V500 M400 0 V500 M500 0 V500 M600 0 V500 M700 0 V500" />
  </g>

  <!-- Ground Floor Shadow -->
  <ellipse cx="400" cy="420" rx="320" ry="25" fill="#020617" opacity="0.8"/>

  <!-- Skid Base (Black Heavy Steel Channel) -->
  <rect x="120" y="370" width="560" height="35" rx="6" fill="#1e293b" stroke="#0f172a" stroke-width="3"/>
  <!-- Forklift Pockets -->
  <rect x="240" y="380" width="70" height="18" rx="3" fill="#020617"/>
  <rect x="490" y="380" width="70" height="18" rx="3" fill="#020617"/>
  <circle cx="150" cy="387" r="7" fill="#475569"/>
  <circle cx="650" cy="387" r="7" fill="#475569"/>

  <!-- Main Canopy Body -->
  <g filter="url(#shadow)">
    <rect x="140" y="140" width="520" height="235" rx="12" fill="url(#bodyGrad)" stroke="#1e293b" stroke-width="4"/>
    
    <!-- Roof Details -->
    <path d="M140 140 L160 115 L640 115 L660 140 Z" fill="${color1}" stroke="#1e293b" stroke-width="3" opacity="0.9"/>
    
    <!-- Lifting Lug / Crane Eye in Center -->
    <rect x="375" y="85" width="50" height="32" rx="6" fill="#475569" stroke="#1e293b" stroke-width="3"/>
    <circle cx="400" cy="100" r="12" fill="#0f172a"/>
    <circle cx="400" cy="100" r="8" fill="#e2e8f0" opacity="0.4"/>

    <!-- Exhaust Pipe & Rain Cap -->
    <rect x="560" y="70" width="30" height="48" fill="#475569" stroke="#1e293b" stroke-width="2"/>
    <path d="M550 70 L600 60 L600 70 Z" fill="#334155"/>
    <line x1="565" y1="80" x2="565" y2="115" stroke="#64748b" stroke-width="2"/>

    <!-- Door Panels & Hinges -->
    <!-- Door 1 (Left / Engine) -->
    <rect x="160" y="155" width="230" height="205" rx="6" fill="none" stroke="#0f172a" stroke-width="3"/>
    <!-- Door Latches -->
    <rect x="370" y="245" width="12" height="26" rx="2" fill="#0f172a"/>
    <circle cx="376" cy="258" r="3" fill="#cbd5e1"/>
    <!-- Ventilation Louvers (Air Intake) -->
    <g fill="#0f172a">
      <rect x="180" y="270" width="180" height="6" rx="2"/>
      <rect x="180" y="285" width="180" height="6" rx="2"/>
      <rect x="180" y="300" width="180" height="6" rx="2"/>
      <rect x="180" y="315" width="180" height="6" rx="2"/>
      <rect x="180" y="330" width="180" height="6" rx="2"/>
      <rect x="180" y="345" width="180" height="6" rx="2"/>
    </g>

    <!-- Door 2 (Right / Alternator & Control Panel) -->
    <rect x="410" y="155" width="230" height="205" rx="6" fill="none" stroke="#0f172a" stroke-width="3"/>
    <rect x="420" y="245" width="12" height="26" rx="2" fill="#0f172a"/>
    <circle cx="426" cy="258" r="3" fill="#cbd5e1"/>

    <!-- Digital Controller Window (DeepSea / DSE Style) -->
    <rect x="440" y="170" width="170" height="95" rx="6" fill="#090d16" stroke="#334155" stroke-width="2"/>
    <!-- Controller Screen (Green Backlit LCD) -->
    <rect x="455" y="182" width="90" height="50" rx="3" fill="#064e3b" stroke="#047857" stroke-width="1.5"/>
    <text x="465" y="200" fill="#34d399" font-family="monospace" font-size="10" font-weight="bold">400V 50Hz</text>
    <text x="465" y="215" fill="#6ee7b7" font-family="monospace" font-size="11" font-weight="bold">${kva} kVA</text>
    <text x="465" y="226" fill="#a7f3d0" font-family="monospace" font-size="8">READY AUTO</text>
    <!-- Buttons -->
    <circle cx="565" cy="192" r="7" fill="#ef4444"/> <!-- Stop Red -->
    <circle cx="590" cy="192" r="7" fill="#22c55e"/> <!-- Start Green -->
    <circle cx="565" cy="214" r="5" fill="#f59e0b"/> <!-- Auto Amber -->
    <circle cx="590" cy="214" r="5" fill="#94a3b8"/> <!-- Info -->
    <!-- Emergency Stop Push Button -->
    <circle cx="580" cy="242" r="9" fill="#dc2626" stroke="#fff" stroke-width="1.5"/>

    <!-- Alternator Air Exhaust Mesh / Grill -->
    <g fill="#0f172a">
      <rect x="440" y="280" width="170" height="6" rx="2"/>
      <rect x="440" y="295" width="170" height="6" rx="2"/>
      <rect x="440" y="310" width="170" height="6" rx="2"/>
      <rect x="440" y="325" width="170" height="6" rx="2"/>
      <rect x="440" y="340" width="170" height="6" rx="2"/>
    </g>

    <!-- Brand Emblem Badge -->
    <rect x="180" y="175" width="150" height="45" rx="5" fill="#0f172a" stroke="#fbbf24" stroke-width="2"/>
    <text x="255" y="205" fill="#fbbf24" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="900" text-anchor="middle" letter-spacing="2">${brand.toUpperCase()}</text>
    <text x="255" y="216" fill="#94a3b8" font-family="sans-serif" font-size="8" text-anchor="middle">${model}</text>
  </g>

  <!-- Capacity Badge (Top Right Pill) -->
  <g>
    <rect x="610" y="30" width="155" height="50" rx="12" fill="#f59e0b" stroke="#fbbf24" stroke-width="2"/>
    <text x="687" y="62" fill="#000" font-family="Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle">${kva} kVA</text>
  </g>

  <!-- Tag / Feature Highlights -->
  <g>
    <rect x="35" y="35" width="220" height="35" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
    <text x="145" y="58" fill="#60a5fa" font-family="sans-serif" font-size="13" font-weight="bold" text-anchor="middle">⚡ JAPAN DIESEL GENERATOR</text>
  </g>
</svg>`;
}

const list = [
  { name: 'denyo-25kva.svg', brand: 'Denyo', model: 'DCA-25ESK', kva: 25, c1: '#0284c7', c2: '#0369a1' },
  { name: 'airman-45kva.svg', brand: 'Airman', model: 'SDG-45S', kva: 45, c1: '#059669', c2: '#047857' },
  { name: 'cummins-100kva.svg', brand: 'Cummins', model: 'C100D5', kva: 100, c1: '#dc2626', c2: '#991b1b' },
  { name: 'perkins-150kva.svg', brand: 'Perkins', model: '1106A-70', kva: 150, c1: '#2563eb', c2: '#1d4ed8' },
  { name: 'denyo-15kva.svg', brand: 'Denyo', model: 'DCA-15ESX', kva: 15, c1: '#0284c7', c2: '#0369a1' },
  { name: 'mitsubishi-60kva.svg', brand: 'Mitsubishi', model: 'MGS-0060B', kva: 60, c1: '#ea580c', c2: '#c2410c' },
  { name: 'kubota-10kva.svg', brand: 'Kubota', model: 'SQ-1120', kva: 10, c1: '#d97706', c2: '#b45309' },
  { name: 'cummins-250kva.svg', brand: 'Cummins', model: 'QSL9-G5', kva: 250, c1: '#b91c1c', c2: '#7f1d1d' },
  { name: 'rental-15kva.svg', brand: 'Rental', model: '15 kVA Silent', kva: 15, c1: '#4f46e5', c2: '#3730a3' },
  { name: 'rental-25kva.svg', brand: 'Rental', model: '25 kVA Silent', kva: 25, c1: '#0d9488', c2: '#0f766e' },
  { name: 'rental-50kva.svg', brand: 'Rental', model: '50 kVA Industrial', kva: 50, c1: '#e11d48', c2: '#be123c' },
  { name: 'rental-100kva.svg', brand: 'Rental', model: '100 kVA Heavy Duty', kva: 100, c1: '#d97706', c2: '#b45309' },
  { name: 'rental-250kva.svg', brand: 'Rental', model: '250 kVA Mega Project', kva: 250, c1: '#7c3aed', c2: '#5b21b6' },
];

for (const item of list) {
  const svg = makeGeneratorSvg(item.brand, item.model, item.kva, item.c1, item.c2);
  fs.writeFileSync(path.join(imgDir, item.name), svg);
  console.log(`Generated SVG: ${item.name}`);
}
console.log('✅ All generator vector graphics generated successfully!');
