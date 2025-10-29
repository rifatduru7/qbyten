import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const starsCanvas = document.getElementById('stars-canvas');
const starsCtx = starsCanvas.getContext('2d');
const section = document.querySelector('.products-3d-section');

function resizeCanvas() {
    starsCanvas.width = section.offsetWidth;
    starsCanvas.height = section.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

class Star {
    constructor() {
        this.reset();
        // Her yıldız için farklı yanıp sönme özellikleri
        this.twinkleSpeed = Math.random() * 0.003 + 0.001; // Daha yavaş ve gerçekçi
        this.twinkleOffset = Math.random() * Math.PI * 2; // Rastgele başlangıç fazı
        this.baseOpacity = Math.random() * 0.3 + 0.5; // 0.5-0.8 arası temel parlaklık
        this.twinkleIntensity = Math.random() * 0.4 + 0.2; // Yanıp sönme şiddeti
    }
    reset() {
        this.x = Math.random() * starsCanvas.width;
        this.y = Math.random() * starsCanvas.height;
        this.size = Math.random() * 1.8 + 0.3; // 0.3-2.1 arası boyut
        this.opacity = Math.random();
    }
    update() {
        // Gerçekçi yanıp sönme - sinüs dalgası ile
        const twinkle = Math.sin(Date.now() * this.twinkleSpeed + this.twinkleOffset);
        this.opacity = this.baseOpacity + (twinkle * this.twinkleIntensity);
        
        // Bazen daha dramatik yanıp sönme (rastgele)
        if (Math.random() < 0.001) {
            this.opacity *= 0.3;
        }
    }
    draw() {
        starsCtx.save();
        starsCtx.globalAlpha = this.opacity;
        
        // Büyük yıldızlara hafif glow efekti
        if (this.size > 1.5) {
            const gradient = starsCtx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 2
            );
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
            gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
            starsCtx.fillStyle = gradient;
            starsCtx.beginPath();
            starsCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            starsCtx.fill();
        }
        
        // Ana yıldız
        starsCtx.fillStyle = '#ffffff';
        starsCtx.beginPath();
        starsCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        starsCtx.fill();
        starsCtx.restore();
    }
}

const stars = [];
for (let i = 0; i < 400; i++) { // 150'den 400'e çıkarıldı
    stars.push(new Star());
}

function animateStars() {
    starsCtx.fillStyle = '#0a1520';
    starsCtx.fillRect(0, 0, starsCanvas.width, starsCanvas.height);
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    requestAnimationFrame(animateStars);
}
animateStars();

// Three.js Scene
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Mobile detection
const isMobile = window.innerWidth <= 768;
const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;

// Responsive camera settings
const cameraFOV = isMobile ? 85 : 75;
const cameraPosition = isMobile ? [0, 2, 18] : [0, 3, 15];
const camera = new THREE.PerspectiveCamera(cameraFOV, container.offsetWidth / container.offsetHeight, 0.1, 1000);
camera.position.set(...cameraPosition);
camera.lookAt(0, 0, 0); // Merkeze bak

// Responsive renderer settings
const pixelRatio = isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2);
const antialias = !isMobile; // Disable antialiasing on mobile for performance
const renderer = new THREE.WebGLRenderer({ antialias, alpha: true });
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setPixelRatio(pixelRatio);
renderer.setClearColor(0x000000, 0);

// Performance optimizations for mobile
if (isMobile) {
    renderer.powerPreference = 'high-performance';
    // Reduce shadow map quality on mobile
    renderer.shadowMap.enabled = false;
}

container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x6dc5e8, 0.8);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x4fa3d1, 1.8, 60);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Ek ışık kaynağı - küreleri daha belirgin yapmak için
const pointLight2 = new THREE.PointLight(0xffffff, 1.2, 50);
pointLight2.position.set(-10, 5, -10);
scene.add(pointLight2);

const products = [
    {name:'e-Fatura',icon:'📄',color:0x4fa3d1,desc:'Faturalarınızı dijital ortamda düzenleyin.'},
    {name:'e-Arşiv',icon:'📁',color:0x1e5a7d,desc:'E-arşiv faturalarınızı güvenle saklayın.'},
    {name:'e-İrsaliye',icon:'📦',color:0x5bb4dd,desc:'İrsaliyelerinizi elektronik ortamda düzenleyin.'},
    {name:'e-SMM',icon:'📋',color:0x2d7a9e,desc:'Serbest meslek makbuzlarınızı yönetin.'},
    {name:'e-Müstahsil',icon:'🌾',color:0x6dc5e8,desc:'Müstahsil makbuzlarınızı düzenleyin.'},
    {name:'Sanal POS',icon:'💳',color:0x154561,desc:'Güvenli ödeme altyapısı.'}
];

const productMeshes = [];
const radius = 8; // 12'den 8'e düşürüldü - ürünler daha yakın
const angleStep = (Math.PI * 2) / products.length;

// Dijital texture oluşturma fonksiyonları - Daha belirgin ve özenli
function createCircuitTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Arka plan - daha koyu ve net gradient
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.6, 'rgba(20,20,40,0.95)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Ana devre çizgileri - daha parlak ve net
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 200, 255, 0.6)';
    ctx.shadowBlur = 8;
    
    // Izgara sistemi
    for (let i = 0; i < 8; i++) {
        // Yatay çizgiler
        ctx.beginPath();
        ctx.moveTo(0, i * 128 + 64);
        ctx.lineTo(1024, i * 128 + 64);
        ctx.stroke();
        
        // Dikey çizgiler
        ctx.beginPath();
        ctx.moveTo(i * 128 + 64, 0);
        ctx.lineTo(i * 128 + 64, 1024);
        ctx.stroke();
    }
    
    // Bağlantı noktaları - daha büyük ve parlak
    ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';
    ctx.shadowColor = 'rgba(0, 255, 200, 0.8)';
    ctx.shadowBlur = 12;
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            ctx.beginPath();
            ctx.arc(i * 128 + 64, j * 128 + 64, 8, 0, Math.PI * 2);
            ctx.fill();
            
            // İç nokta
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(i * 128 + 64, j * 128 + 64, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';
        }
    }
    
    // Çapraz bağlantılar
    ctx.strokeStyle = 'rgba(0, 150, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        const x1 = Math.random() * 1024;
        const y1 = Math.random() * 1024;
        const x2 = x1 + (Math.random() - 0.5) * 200;
        const y2 = y1 + (Math.random() - 0.5) * 200;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    ctx.shadowBlur = 0;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createHexagonTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Arka plan
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.6, 'rgba(20,20,40,0.95)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Altıgen ızgara - daha net ve parlak
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = 'rgba(0, 200, 255, 0.5)';
    ctx.shadowBlur = 6;
    
    const hexSize = 50;
    for (let y = -hexSize; y < 1024 + hexSize; y += hexSize * 1.73) {
        for (let x = -hexSize; x < 1024 + hexSize; x += hexSize * 3) {
            const offsetX = (Math.floor(y / (hexSize * 1.73)) % 2 === 0) ? 0 : hexSize * 1.5;
            drawHexagon(ctx, x + offsetX, y, hexSize);
            
            // Merkez noktası
            ctx.fillStyle = 'rgba(0, 255, 200, 0.6)';
            ctx.beginPath();
            ctx.arc(x + offsetX, y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Rastgele parlak hexagonlar
    ctx.fillStyle = 'rgba(0, 200, 255, 0.2)';
    for (let i = 0; i < 10; i++) {
        const rx = Math.random() * 1024;
        const ry = Math.random() * 1024;
        drawHexagonFilled(ctx, rx, ry, hexSize * 0.8);
    }
    
    ctx.shadowBlur = 0;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function drawHexagon(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
}

function drawHexagonFilled(ctx, x, y, size) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
}

function createDataFlowTexture(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Arka plan
    const gradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.6, 'rgba(20,20,40,0.95)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.98)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Merkez parlak nokta
    const centerGradient = ctx.createRadialGradient(512, 512, 0, 512, 512, 100);
    centerGradient.addColorStop(0, 'rgba(0, 255, 200, 0.4)');
    centerGradient.addColorStop(1, 'rgba(0, 255, 200, 0)');
    ctx.fillStyle = centerGradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Veri akış çizgileri - daha parlak ve net
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.7)';
    ctx.lineWidth = 3;
    ctx.shadowColor = 'rgba(0, 200, 255, 0.6)';
    ctx.shadowBlur = 8;
    
    for (let i = 0; i < 24; i++) {
        ctx.beginPath();
        const startX = 512;
        const startY = 512;
        const angle = (Math.PI * 2 * i) / 24;
        const endX = startX + Math.cos(angle) * 450;
        const endY = startY + Math.sin(angle) * 450;
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    // Dairesel ring'ler
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.4)';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(512, 512, i * 80, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Veri noktaları - daha büyük ve parlak
    ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';
    ctx.shadowColor = 'rgba(0, 255, 200, 0.8)';
    ctx.shadowBlur = 12;
    
    for (let i = 0; i < 24; i++) {
        const angle = (Math.PI * 2 * i) / 24;
        for (let r = 1; r <= 4; r++) {
            const dist = r * 100;
            const x = 512 + Math.cos(angle) * dist;
            const y = 512 + Math.sin(angle) * dist;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
            
            // İç parlak nokta
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(0, 255, 200, 0.9)';
        }
    }
    
    ctx.shadowBlur = 0;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

products.forEach((product, index) => {
    // Başlangıç açısı offset'i - her açılışta aynı görünüm için
    const angleOffset = Math.PI * 0.3; // 54 derece başlangıç offset
    const angle = angleStep * index + angleOffset;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    
    // Ana küre - dijital texture ile (yüksek çözünürlük)
    const geometry = new THREE.SphereGeometry(1.2, 64, 64);
    
    // Her küre için farklı dijital texture
    let digitalTexture;
    if (index % 3 === 0) {
        digitalTexture = createCircuitTexture(
            'rgba(' + ((product.color >> 16) & 255) + ',' + 
            ((product.color >> 8) & 255) + ',' + 
            (product.color & 255) + ',0.4)'
        );
    } else if (index % 3 === 1) {
        digitalTexture = createHexagonTexture(
            'rgba(' + ((product.color >> 16) & 255) + ',' + 
            ((product.color >> 8) & 255) + ',' + 
            (product.color & 255) + ',0.4)'
        );
    } else {
        digitalTexture = createDataFlowTexture(
            'rgba(' + ((product.color >> 16) & 255) + ',' + 
            ((product.color >> 8) & 255) + ',' + 
            (product.color & 255) + ',0.4)'
        );
    }
    
    const material = new THREE.MeshPhongMaterial({
        color: product.color,
        emissive: product.color,
        emissiveIntensity: 0.5,
        shininess: 120,
        transparent: true,
        opacity: 0, // Başlangıçta görünmez - fade-in yapılacak
        map: digitalTexture,
        side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, 0, z);
    mesh.userData = {product: product, index: index, originalY: 0, targetOpacity: 0.95, currentOpacity: 0};
    
    // Özel halka - her ürün için farklı stil
    let ringGeometry, ringMaterial;
    
    if (index % 3 === 0) {
        // Düz halka
        ringGeometry = new THREE.TorusGeometry(1.6, 0.05, 8, 50);
        ringMaterial = new THREE.MeshBasicMaterial({
            color: product.color,
            transparent: true,
            opacity: 0 // Başlangıçta gizli
        });
    } else if (index % 3 === 1) {
        // Çift halka
        ringGeometry = new THREE.TorusGeometry(1.8, 0.03, 8, 50);
        ringMaterial = new THREE.MeshBasicMaterial({
            color: product.color,
            transparent: true,
            opacity: 0 // Başlangıçta gizli
        });
    } else {
        // Kalın halka
        ringGeometry = new THREE.TorusGeometry(1.5, 0.08, 8, 50);
        ringMaterial = new THREE.MeshBasicMaterial({
            color: product.color,
            transparent: true,
            opacity: 0 // Başlangıçta gizli
        });
    }
    
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.userData = {targetOpacity: index % 3 === 0 ? 0.5 : (index % 3 === 1 ? 0.6 : 0.4)}; // Hedef opacity'yi sakla
    mesh.add(ring);
    
    // İkinci halka (bazı ürünler için)
    if (index % 2 === 0) {
        const ring2Geometry = new THREE.TorusGeometry(2.0, 0.02, 6, 40);
        const ring2Material = new THREE.MeshBasicMaterial({
            color: product.color,
            transparent: true,
            opacity: 0 // Başlangıçta gizli
        });
        const ring2 = new THREE.Mesh(ring2Geometry, ring2Material);
        ring2.rotation.x = Math.PI / 2;
        ring2.rotation.z = Math.PI / 4;
        ring2.userData = {targetOpacity: 0.3}; // Hedef opacity'yi sakla
        mesh.add(ring2);
    }
    
    // Partiküller - az ama görünür
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 20;
    const positions = new Float32Array(particlesCount * 3);
    
    for (let i = 0; i < particlesCount; i++) {
        const angle = (i / particlesCount) * Math.PI * 2;
        const orbitRadius = 1.4 + Math.random() * 0.4;
        const height = (Math.random() - 0.5) * 0.3;
        
        positions[i * 3] = Math.cos(angle) * orbitRadius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * orbitRadius;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        color: product.color,
        size: 0.12,
        transparent: true,
        opacity: 0 // Başlangıçta gizli
    });
    particlesMaterial.userData = {targetOpacity: 0.7}; // Hedef opacity'yi sakla
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    mesh.add(particles);
    
    scene.add(mesh);
    productMeshes.push(mesh);
    
    // HTML Label oluştur - Icon + İsim + Marka
    const labelDiv = document.createElement('div');
    labelDiv.className = 'product-label';
    labelDiv.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 5px;">${product.icon}</div>
        <div class="product-label-name">${product.name}</div>
        <div class="product-label-brand">QbYTen</div>
    `;
    labelDiv.style.display = 'none'; // Başlangıçta gizli
    document.getElementById('labels-container').appendChild(labelDiv);
    mesh.userData.labelDiv = labelDiv;
});

// D1 integration: fetch products; update or rebuild scene
async function __updateProductsFromD1(){
  try {
    const res = await fetch('/api/products');
    if(!res.ok) return;
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return;
    const data = await res.json();
    const list = Array.isArray(data.products) ? data.products : [];
    if(!list.length) return;

    if (list.length !== productMeshes.length) {
      __rebuildProductsFromD1(list);
    } else {
      for (let i = 0; i < list.length; i++) {
        const mesh = productMeshes[i];
        const item = list[i];
        if (!mesh || !item) continue;
        const colorInt = __toHexInt(item.color);
        if (colorInt !== null) {
          mesh.material.color.setHex(colorInt);
          mesh.material.emissive.setHex(colorInt);
        }
        if (mesh.userData && mesh.userData.labelDiv) {
          mesh.userData.labelDiv.querySelector('.product-label-name').textContent = item.title || mesh.userData.product?.name || '';
        }
        if (mesh.userData && mesh.userData.product) {
          mesh.userData.product.name = item.title || mesh.userData.product.name;
          mesh.userData.product.desc = item.description || mesh.userData.product.desc;
        }
      }
      __applyProductLayout(list);
    }
  } catch(e) { console.warn('D1 products fetch failed', e); }
}
__updateProductsFromD1();

// Dijital Dünya Texture Oluşturma
function createDigitalEarthTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Arka plan - koyu mavi gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1024);
    gradient.addColorStop(0, 'rgba(10, 30, 50, 0.95)');
    gradient.addColorStop(0.5, 'rgba(15, 50, 80, 0.95)');
    gradient.addColorStop(1, 'rgba(10, 30, 50, 0.95)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2048, 1024);
    
    // Parlak grid çizgileri - enlem
    ctx.strokeStyle = 'rgba(0, 180, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(0, 180, 255, 0.8)';
    ctx.shadowBlur = 10;
    
    for (let i = 0; i <= 8; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 128);
        ctx.lineTo(2048, i * 128);
        ctx.stroke();
    }
    
    // Boylam çizgileri
    for (let i = 0; i <= 16; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 128, 0);
        ctx.lineTo(i * 128, 1024);
        ctx.stroke();
    }
    
    // Kıtalar simülasyonu - parçalı alanlar
    ctx.fillStyle = 'rgba(0, 220, 180, 0.3)';
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 220, 180, 0.6)';
    
    // Kuzey Amerika
    drawContinent(ctx, 200, 200, 300, 200);
    // Avrupa
    drawContinent(ctx, 900, 250, 200, 150);
    // Asya
    drawContinent(ctx, 1200, 300, 400, 250);
    // Afrika
    drawContinent(ctx, 950, 500, 250, 300);
    // Güney Amerika
    drawContinent(ctx, 400, 600, 200, 300);
    // Avustralya
    drawContinent(ctx, 1500, 700, 200, 150);
    
    // Dijital bağlantı noktaları
    ctx.fillStyle = 'rgba(0, 255, 220, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0, 255, 220, 0.9)';
    
    for (let i = 0; i < 100; i++) {
        const x = Math.random() * 2048;
        const y = Math.random() * 1024;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Binary kod efekti
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = 'rgba(0, 200, 255, 0.3)';
    ctx.shadowBlur = 5;
    for (let i = 0; i < 200; i++) {
        const text = Math.random() > 0.5 ? '1' : '0';
        ctx.fillText(text, Math.random() * 2048, Math.random() * 1024);
    }
    
    ctx.shadowBlur = 0;
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function drawContinent(ctx, x, y, width, height) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    
    // Organik şekil oluştur
    const points = 8;
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radiusX = width / 2 * (0.7 + Math.random() * 0.3);
        const radiusY = height / 2 * (0.7 + Math.random() * 0.3);
        const px = Math.cos(angle) * radiusX;
        const py = Math.sin(angle) * radiusY;
        
        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Dijital Dünya - Yeniden Şekillendirilmiş
const earthGeometry = new THREE.SphereGeometry(2.5, 64, 64);
const digitalEarthTexture = createDigitalEarthTexture();

const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2a7fa8,
    emissive: 0x0d4f6f,
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.95,
    shininess: 120,
    map: digitalEarthTexture,
    side: THREE.DoubleSide
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);

// Başlangıç rotasyonu - her açılışta aynı görünüm
earth.rotation.y = Math.PI * 0.25; // 45 derece başlangıç
earth.rotation.x = 0;

scene.add(earth);

// Dijital grid çizgileri - daha parlak
const gridGroup = new THREE.Group();

// 5 Enlem
for (let i = 1; i < 5; i++) {
    const lat = (i / 5) * Math.PI;
    const radius = Math.sin(lat) * 2.52;
    const y = Math.cos(lat) * 2.52;
    
    const circleGeometry = new THREE.TorusGeometry(radius, 0.015, 4, 50);
    const circleMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ccff,
        transparent: true,
        opacity: 0.6,
        emissive: 0x00ccff,
        emissiveIntensity: 0.5
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.position.y = y;
    circle.rotation.x = Math.PI / 2;
    gridGroup.add(circle);
}

// 6 Boylam
for (let i = 0; i < 6; i++) {
    const circleGeometry = new THREE.TorusGeometry(2.52, 0.015, 4, 50);
    const circleMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ccff,
        transparent: true,
        opacity: 0.6,
        emissive: 0x00ccff,
        emissiveIntensity: 0.5
    });
    const circle = new THREE.Mesh(circleGeometry, circleMaterial);
    circle.rotation.y = (i / 6) * Math.PI;
    gridGroup.add(circle);
}
earth.add(gridGroup);

// Yuvarlak nokta texture'ı oluştur
function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Dijital kıta noktaları - daha çok ve parlak
const continentParticles = new THREE.BufferGeometry();
const continentCount = 500;
const continentPositions = new Float32Array(continentCount * 3);

for (let i = 0; i < continentCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.55;
    
    continentPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    continentPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    continentPositions[i * 3 + 2] = r * Math.cos(phi);
}

continentParticles.setAttribute('position', new THREE.BufferAttribute(continentPositions, 3));
const continentMaterial = new THREE.PointsMaterial({
    color: 0x00ffdd,
    size: 0.1,
    map: createCircleTexture(),
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true
});
const continents = new THREE.Points(continentParticles, continentMaterial);
earth.add(continents);

// Dijital Atmosfer - kaldırıldı

// Işık hüzmesi bağlantı çizgileri
const connectionLines = [];
productMeshes.forEach((mesh, index) => {
    const points = [];
    points.push(new THREE.Vector3(0, 0, 0));
    points.push(mesh.position.clone());
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Ana parlak çizgi - güneş ışığı rengi
    const mainLineMaterial = new THREE.LineBasicMaterial({
        color: 0xffd700, 
        transparent: true, 
        opacity: 0.3,
        linewidth: 2
    });
    const mainLine = new THREE.Line(lineGeometry.clone(), mainLineMaterial);
    scene.add(mainLine);
    
    // Glow katmanı 1 - açık sarı
    const glowMaterial1 = new THREE.LineBasicMaterial({
        color: 0xffffaa, 
        transparent: true, 
        opacity: 0.2,
        linewidth: 3,
        blending: THREE.AdditiveBlending
    });
    const glowLine1 = new THREE.Line(lineGeometry.clone(), glowMaterial1);
    scene.add(glowLine1);
    
    // Glow katmanı 2 - çok açık
    const glowMaterial2 = new THREE.LineBasicMaterial({
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.1,
        linewidth: 5,
        blending: THREE.AdditiveBlending
    });
    const glowLine2 = new THREE.Line(lineGeometry.clone(), glowMaterial2);
    scene.add(glowLine2);
    
    // Işık parçacıkları - çizgi boyunca (seyrek)
    const particleCount = 8;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        const pos = new THREE.Vector3().lerpVectors(
            new THREE.Vector3(0, 0, 0),
            mesh.position.clone(),
            t
        );
        particlePositions[i * 3] = pos.x;
        particlePositions[i * 3 + 1] = pos.y;
        particlePositions[i * 3 + 2] = pos.z;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xffffcc,
        size: 0.12,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const lineParticles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(lineParticles);
    
    // Animasyon için sakla
    connectionLines.push({
        main: mainLine,
        glow1: glowLine1,
        glow2: glowLine2,
        particles: lineParticles,
        mesh: mesh,
        startPos: new THREE.Vector3(0, 0, 0),
        endPos: mesh.position.clone()
    });
});

// Samanyolu Galaksisi - Sol uzak köşede
const galaxyGroup = new THREE.Group();

// Galaksi parametreleri
const galaxyParticleCount = 10000; // Optimize edilmiş parçacık sayısı
const galaxyGeometry = new THREE.BufferGeometry();
const galaxyPositions = new Float32Array(galaxyParticleCount * 3);
const galaxyColors = new Float32Array(galaxyParticleCount * 3);

// Spiral galaksi oluştur
for (let i = 0; i < galaxyParticleCount; i++) {
    const i3 = i * 3;
    
    // Spiral parametreleri
    const radius = Math.pow(Math.random(), 1.5) * 18; // Daha düzgün dağılım
    const spinAngle = radius * 0.5; // Daha açık spiral (2'den 0.5'e düşürüldü)
    const branchAngle = ((i % 3) / 3) * Math.PI * 2; // 3 spiral kol (daha az kalabalık)
    
    // Spiral pozisyon hesapla
    const angle = spinAngle + branchAngle;
    
    // Daha kontrollü random dağılım
    const randomX = Math.pow(Math.random(), 4) * (Math.random() < 0.5 ? 1 : -1) * 0.8;
    const randomY = Math.pow(Math.random(), 5) * (Math.random() < 0.5 ? 1 : -1) * 0.2; // Y'de çok az dağılım
    const randomZ = Math.pow(Math.random(), 4) * (Math.random() < 0.5 ? 1 : -1) * 0.8;
    
    galaxyPositions[i3] = Math.cos(angle) * radius + randomX;
    galaxyPositions[i3 + 1] = randomY * 0.15; // Y düzleminde çok daha az dağılım (0.3'ten 0.15'e)
    galaxyPositions[i3 + 2] = Math.sin(angle) * radius + randomZ;
    
    // Gerçekçi galaksi renk gradyanı - Beyaz (merkez) → Mavi (spiral) → Mor (kenar)
    const colorMix = radius / 18;
    
    if (colorMix < 0.3) {
        // Merkez bölge: Parlak beyaz-sarımsı (yaşlı yıldızlar)
        const innerMix = colorMix / 0.3;
        galaxyColors[i3] = 1.0; // R - Tam beyaz
        galaxyColors[i3 + 1] = 0.95 + innerMix * 0.05; // G - Hafif sarımsı
        galaxyColors[i3 + 2] = 0.9 + innerMix * 0.1; // B - Hafif mavi
    } else if (colorMix < 0.7) {
        // Spiral kollar: Parlak mavi-beyaz (genç yıldızlar)
        const midMix = (colorMix - 0.3) / 0.4;
        galaxyColors[i3] = 0.85 - midMix * 0.2; // R - Azalıyor
        galaxyColors[i3 + 1] = 0.9 - midMix * 0.1; // G - Hafif azalıyor
        galaxyColors[i3 + 2] = 1.0; // B - Tam mavi
    } else {
        // Dış kenar: Mor-mavi tonlar
        const outerMix = (colorMix - 0.7) / 0.3;
        galaxyColors[i3] = 0.7 + outerMix * 0.2; // R - Mora geçiş
        galaxyColors[i3 + 1] = 0.6 - outerMix * 0.2; // G - Azalıyor
        galaxyColors[i3 + 2] = 1.0; // B - Tam mavi
    }
}

galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(galaxyPositions, 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

// Yuvarlak parçacık texture'ı oluştur - profesyonel görünüm için
const canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = 32;
const ctx = canvas.getContext('2d');

// Radial gradient ile yumuşak yuvarlak parçacık
const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.4)');
gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.2)');
gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 32, 32);

const particleTexture = new THREE.CanvasTexture(canvas);

const galaxyMaterial = new THREE.PointsMaterial({
    size: 0.15, // Biraz daha büyük - yuvarlaklık daha iyi görünecek
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9, // Daha parlak
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: particleTexture // Yuvarlak texture uygula
});

const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
galaxyGroup.add(galaxy);

// Galactic Center - Gerçekçi galaksi merkez renkleri (Beyaz → Mavi → Mor)

// Katman 1: En içteki çekirdek - Parlak beyaz (Supermassive Black Hole çevresi)
const core1Geo = new THREE.SphereGeometry(0.5, 32, 32);
const core1Mat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF, // Parlak beyaz
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide
});
const galaxyCore1 = new THREE.Mesh(core1Geo, core1Mat);
galaxyGroup.add(galaxyCore1);

// Katman 2: Beyaz-Mavi geçiş (Yoğun yıldız kümesi)
const core2Geo = new THREE.SphereGeometry(0.75, 32, 32);
const core2Mat = new THREE.MeshBasicMaterial({
    color: 0xF0F8FF, // Alice Blue - Beyaz-mavi
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false
});
const galaxyCore2 = new THREE.Mesh(core2Geo, core2Mat);
galaxyGroup.add(galaxyCore2);

// Katman 3: Açık mavi (Merkez yıldızları)
const core3Geo = new THREE.SphereGeometry(1.0, 32, 32);
const core3Mat = new THREE.MeshBasicMaterial({
    color: 0xCCE5FF, // Açık mavi
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false
});
const galaxyCore3 = new THREE.Mesh(core3Geo, core3Mat);
galaxyGroup.add(galaxyCore3);

// Katman 4: Parlak mavi
const core4Geo = new THREE.SphereGeometry(1.3, 32, 32);
const core4Mat = new THREE.MeshBasicMaterial({
    color: 0x99CCFF, // Parlak mavi
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    depthWrite: false
});
const galaxyCore4 = new THREE.Mesh(core4Geo, core4Mat);
galaxyGroup.add(galaxyCore4);

// Katman 5: Derin mavi
const core5Geo = new THREE.SphereGeometry(1.6, 32, 32);
const core5Mat = new THREE.MeshBasicMaterial({
    color: 0x6699FF, // Derin mavi
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false
});
const galaxyCore5 = new THREE.Mesh(core5Geo, core5Mat);
galaxyGroup.add(galaxyCore5);

// Katman 6: Mavi-Mor geçiş
const core6Geo = new THREE.SphereGeometry(2.0, 32, 32);
const core6Mat = new THREE.MeshBasicMaterial({
    color: 0x6666FF, // Mavi-mor
    transparent: true,
    opacity: 0.32,
    side: THREE.DoubleSide,
    depthWrite: false
});
const galaxyCore6 = new THREE.Mesh(core6Geo, core6Mat);
galaxyGroup.add(galaxyCore6);

// Katman 7: Mor ton
const core7Geo = new THREE.SphereGeometry(2.5, 32, 32);
const core7Mat = new THREE.MeshBasicMaterial({
    color: 0x9966FF, // Mor
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false
});
const galaxyCore7 = new THREE.Mesh(core7Geo, core7Mat);
galaxyGroup.add(galaxyCore7);

// Katman 8: En dış mor-mavi atmosfer
const core8Geo = new THREE.SphereGeometry(3.0, 32, 32);
const core8Mat = new THREE.MeshBasicMaterial({
    color: 0xAA88FF, // Açık mor
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false
});
const galaxyCore8 = new THREE.Mesh(core8Geo, core8Mat);
galaxyGroup.add(galaxyCore8);

// Işık halkası (galaksi etrafında) - Mavi-mor
const ringGeometry = new THREE.RingGeometry(1.2, 1.8, 64);
const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x8899FF, // Mavi-mor ton
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
});
const galaxyRing = new THREE.Mesh(ringGeometry, ringMaterial);
galaxyRing.rotation.x = Math.PI / 2;
galaxyGroup.add(galaxyRing);

// Galaksiyi sol köşeye yerleştir - görünür mesafede
galaxyGroup.position.set(-22, 8, -12); // Sol üst, optimal görünür mesafe
galaxyGroup.rotation.x = Math.PI / 6; // Hafif eğim
galaxyGroup.rotation.z = Math.PI / 8;

scene.add(galaxyGroup);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// OrbitControls - Mouse ve Touch ile döndürme ve sınırlı zoom
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Yumuşak hareket

// Responsive control settings
const dampingFactor = isMobile ? 0.12 : 0.08;
const autoRotateSpeed = isMobile ? 0.2 : 0.3;
const rotateSpeed = isMobile ? 0.4 : 0.6;
const zoomSpeed = isMobile ? 0.8 : 0.5;
const minDistance = isMobile ? 18 : 15;
const maxDistance = isMobile ? 30 : 27;

controls.dampingFactor = dampingFactor;
controls.enableZoom = false; // Zoom başlangıçta kapalı - sadece kürelerin üzerinde aktif
controls.minDistance = minDistance;
controls.maxDistance = maxDistance;
controls.enablePan = false; // Pan'i kapat (sadece döndürme ve zoom)
controls.autoRotate = true; // Hafif otomatik dönüş
controls.autoRotateSpeed = autoRotateSpeed;
controls.rotateSpeed = rotateSpeed;
controls.zoomSpeed = zoomSpeed;

// Touch-specific settings
if (isMobile) {
    // Enable touch gestures
    controls.touches = {
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
    };
    
    // Adjust zoom for touch
    controls.enableZoom = true;
    controls.zoomToCursor = false;
}

// 3D section içinde scroll ile sadece zoom yap, sayfa kaydırmasını engelle (sadece zoom aktifse)
const products3dSection = document.querySelector('.products-3d-section');
products3dSection.addEventListener('wheel', (event) => {
    if (controls.enableZoom) {
        event.preventDefault();
        event.stopPropagation();
    }
}, { passive: false });

// Mouse ile etkileşime girdiğinde auto-rotate'i durdur
let userInteracting = false;
let interactionTimeout;

container.addEventListener('mousedown', () => {
    userInteracting = true;
    controls.autoRotate = false;
    clearTimeout(interactionTimeout);
});

container.addEventListener('mouseup', () => {
    userInteracting = false;
    // 3 saniye hareketsizlikten sonra auto-rotate'i tekrar başlat
    interactionTimeout = setTimeout(() => {
        if (!userInteracting) {
            controls.autoRotate = true;
        }
    }, 3000);
});

container.addEventListener('mousemove', (event) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / container.offsetWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / container.offsetHeight) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    
    // Ürün kürelerini kontrol et
    const intersects = raycaster.intersectObjects(productMeshes);
    
    // Galaksi grubundaki tüm mesh'leri kontrol et
    const galaxyIntersects = raycaster.intersectObjects(galaxyGroup.children, true);
    
    productMeshes.forEach(mesh => {
        mesh.userData.hovered = false;
    });
    
    // Galaksi hover durumu
    let isOverGalaxy = galaxyIntersects.length > 0;
    
    if (intersects.length > 0) {
        const mesh = intersects[0].object;
        mesh.userData.hovered = true;
        
        // Küre üzerindeyken zoom'u aktif et
        controls.enableZoom = true;
        
        const panel = document.getElementById('product-info');
        panel.querySelector('h3').textContent = mesh.userData.product.name;
        panel.querySelector('p').textContent = mesh.userData.product.desc;
    } else if (isOverGalaxy) {
        // Galaksi üzerindeyken zoom'u aktif et
        controls.enableZoom = true;
        
        const panel = document.getElementById('product-info');
        panel.querySelector('h3').textContent = 'Samanyolu Galaksisi';
        panel.querySelector('p').textContent = 'Milyarlarca yıldız ve gezegeni barındıran spiral galaksimiz. QbYTen ile dijital dönüşümünüz de bu kadar büyüleyici olacak.';
    } else {
        // Hiçbir şeyin üzerinde değilken zoom'u kapat
        controls.enableZoom = false;
    }
});

// Enhanced mobile touch support with pinch-to-zoom and swipe gestures
let touchStartDistance = 0;
let initialZoom = 0;
let touchStartTime = 0;
let lastTouchX = 0;
let lastTouchY = 0;

function handleTouchStart(event) {
    if (event.touches.length === 1) {
        // Single touch - record position for swipe detection
        touchStartTime = Date.now();
        lastTouchX = event.touches[0].clientX;
        lastTouchY = event.touches[0].clientY;
        
        const touch = event.touches[0];
        const rect = container.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / container.offsetWidth) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / container.offsetHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(productMeshes);
        const galaxyIntersects = raycaster.intersectObjects(galaxyGroup.children, true);
        
        productMeshes.forEach(mesh => {
            mesh.userData.hovered = false;
        });
        
        let isOverGalaxy = galaxyIntersects.length > 0;
        
        if (intersects.length > 0) {
            const mesh = intersects[0].object;
            mesh.userData.hovered = true;
            controls.enableZoom = true;
            
            const panel = document.getElementById('product-info');
            panel.querySelector('h3').textContent = mesh.userData.product.name;
            panel.querySelector('p').textContent = mesh.userData.product.desc;
        } else if (isOverGalaxy) {
            controls.enableZoom = true;
            
            const panel = document.getElementById('product-info');
            panel.querySelector('h3').textContent = 'Samanyolu Galaksisi';
            panel.querySelector('p').textContent = 'Milyarlarca yıldız ve gezegeni barındıran spiral galaksimiz. QbYTen ile dijital dönüşümünüz de bu kadar büyüleyici olacak.';
        }
    } else if (event.touches.length === 2) {
        // Two fingers - pinch to zoom
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
        initialZoom = camera.position.distanceTo(controls.target);
    }
}

function handleTouchMove(event) {
    if (event.touches.length === 2) {
        // Pinch to zoom
        event.preventDefault();
        const dx = event.touches[0].clientX - event.touches[1].clientX;
        const dy = event.touches[0].clientY - event.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (touchStartDistance > 0) {
            const scale = distance / touchStartDistance;
            const newDistance = initialZoom / scale;
            
            // Clamp to min/max distance
            const clampedDistance = Math.max(minDistance, Math.min(maxDistance, newDistance));
            
            // Update camera position
            const direction = new THREE.Vector3();
            direction.subVectors(camera.position, controls.target).normalize();
            direction.multiplyScalar(clampedDistance);
            camera.position.copy(controls.target).add(direction);
        }
    }
}

function handleTouchEnd(event) {
    if (event.touches.length === 0) {
        // Check for swipe gesture
        const touchEndTime = Date.now();
        const touchDuration = touchEndTime - touchStartTime;
        
        if (touchDuration < 300) {
            // Quick tap - could be used for selection
        }
        
        touchStartDistance = 0;
    }
}

container.addEventListener('touchstart', handleTouchStart, { passive: false });
container.addEventListener('touchmove', handleTouchMove, { passive: false });
container.addEventListener('touchend', handleTouchEnd, { passive: true });

// Add touch indicators for mobile
if (isMobile) {
    const touchIndicator = document.createElement('div');
    touchIndicator.id = 'touch-indicator';
    touchIndicator.innerHTML = `
        <div class="touch-hint">
            <div class="touch-icon">👆</div>
            <div class="touch-text">Swipe to rotate • Pinch to zoom</div>
        </div>
    `;
    touchIndicator.style.cssText = `
        position: absolute;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 25px;
        font-size: 14px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        text-align: center;
    `;
    container.appendChild(touchIndicator);
    
    // Show touch hint on first interaction
    let touchHintShown = false;
    container.addEventListener('touchstart', () => {
        if (!touchHintShown) {
            touchIndicator.style.opacity = '1';
            setTimeout(() => {
                touchIndicator.style.opacity = '0';
            }, 3000);
            touchHintShown = true;
        }
    }, { once: true });
}

let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Controls güncelleme
    controls.update();
    
    // Zoom seviyesini güncelle
    const distance = camera.position.distanceTo(controls.target);
    const minDistance = 15;  // Minimum zoom mesafesi
    const maxDistance = 100; // Maximum zoom mesafesi
    const zoomPercent = Math.max(0, Math.min(100, ((maxDistance - distance) / (maxDistance - minDistance)) * 100));
    
    // Zoom indicator'ı güncelle
    const zoomPercentageEl = document.getElementById('zoom-percentage');
    const zoomLevelFill = document.getElementById('zoom-level-fill');
    if (zoomPercentageEl && zoomLevelFill) {
        zoomPercentageEl.textContent = Math.round(zoomPercent) + '%';
        zoomLevelFill.style.width = zoomPercent + '%';
    }
    
    // Dijital Dünya - pulse efekti ile
    earth.rotation.y += 0.002;
    
    // Samanyolu Galaksisi - yavaş dönüş animasyonu
    galaxyGroup.rotation.y += 0.0005; // Çok yavaş spiral dönüş
    galaxyGroup.rotation.z += 0.0002; // Hafif sallanma
    
    // Galaksi parçacıklarına pulse efekti
    const galaxyPulse = Math.sin(time * 0.5) * 0.1 + 0.9;
    galaxy.material.opacity = 0.7 + galaxyPulse * 0.25;
    
    // Galactic Center - 8 katmanlı gerçekçi pulse animasyonu
    // Her katman farklı frekansta - merkezden dışa doğru yavaşlayan
    
    // Katman 1: En hızlı pulse (merkez)
    const pulse1 = Math.sin(time * 3.0) * 0.15 + 0.85;
    galaxyCore1.scale.set(pulse1, pulse1, pulse1);
    
    // Katman 2: Çok hızlı
    const pulse2 = Math.sin(time * 2.5 + 0.3) * 0.12 + 0.88;
    galaxyCore2.material.opacity = 0.85 + pulse2 * 0.15;
    galaxyCore2.scale.set(pulse2, pulse2, pulse2);
    
    // Katman 3: Hızlı
    const pulse3 = Math.sin(time * 2.0 + 0.6) * 0.15 + 0.85;
    galaxyCore3.material.opacity = 0.65 + pulse3 * 0.15;
    galaxyCore3.scale.set(pulse3, pulse3, pulse3);
    
    // Katman 4: Orta-hızlı
    const pulse4 = Math.sin(time * 1.7 + 0.9) * 0.18 + 0.82;
    galaxyCore4.material.opacity = 0.5 + pulse4 * 0.15;
    galaxyCore4.scale.set(pulse4, pulse4, pulse4);
    
    // Katman 5: Orta
    const pulse5 = Math.sin(time * 1.4 + 1.2) * 0.2 + 0.8;
    galaxyCore5.material.opacity = 0.35 + pulse5 * 0.15;
    galaxyCore5.scale.set(pulse5, pulse5, pulse5);
    
    // Katman 6: Orta-yavaş
    const pulse6 = Math.sin(time * 1.1 + 1.5) * 0.22 + 0.78;
    galaxyCore6.material.opacity = 0.25 + pulse6 * 0.12;
    galaxyCore6.scale.set(pulse6, pulse6, pulse6);
    
    // Katman 7: Yavaş
    const pulse7 = Math.sin(time * 0.9 + 1.8) * 0.25 + 0.75;
    galaxyCore7.material.opacity = 0.16 + pulse7 * 0.08;
    galaxyCore7.scale.set(pulse7, pulse7, pulse7);
    
    // Katman 8: En yavaş (dış halo)
    const pulse8 = Math.sin(time * 0.6 + 2.1) * 0.25 + 0.75;
    galaxyCore8.material.opacity = 0.08 + pulse8 * 0.06;
    galaxyCore8.scale.set(pulse8, pulse8, pulse8);
    
    // Işık halkası rotasyon
    galaxyRing.rotation.z += 0.001;
    
    // Kıta parçacıklarına pulse efekti
    const continentPulse = Math.sin(time * 2) * 0.3 + 0.7;
    continents.material.opacity = 0.6 + continentPulse * 0.2;
    continents.material.size = 0.1 + continentPulse * 0.03;
    
    // Grid çizgilerine pulse efekti
    gridGroup.children.forEach((child, index) => {
        const pulse = Math.sin(time * 1.5 + index * 0.3) * 0.2 + 0.8;
        child.material.opacity = 0.6 * pulse;
    });
    
    // Işık hüzmeleri animasyonu - Güneş ışığı efekti
    connectionLines.forEach((line, index) => {
        // Her çizgi için sıralı başlangıç
        const offset = index * 0.6;
        
        // Hafif pulse efekti - daha yumuşak
        const pulse = Math.sin(time * 1.2 + offset) * 0.2 + 0.8;
        
        // Ana çizgi - çok hafif
        line.main.material.opacity = 0.25 * pulse;
        line.glow1.material.opacity = 0.15 * pulse;
        line.glow2.material.opacity = 0.08 * pulse;
        
        // Çizgiyi küre pozisyonuyla güncelle
        const points = [];
        points.push(line.startPos);
        points.push(line.mesh.position.clone());
        
        line.main.geometry.setFromPoints(points);
        line.glow1.geometry.setFromPoints(points);
        line.glow2.geometry.setFromPoints(points);
        
        // Yavaş akış efekti - seyrek parçacıklar
        const positions = line.particles.geometry.attributes.position.array;
        const particleCount = positions.length / 3;
        
        for (let i = 0; i < particleCount; i++) {
            // Yavaş akış
            const flow = ((time * 0.3 + offset + (i / particleCount) * 0.8) % 1.0);
            
            const pos = new THREE.Vector3().lerpVectors(
                line.startPos,
                line.mesh.position.clone(),
                flow
            );
            
            positions[i * 3] = pos.x;
            positions[i * 3 + 1] = pos.y;
            positions[i * 3 + 2] = pos.z;
        }
        line.particles.geometry.attributes.position.needsUpdate = true;
        
        // Parçacık - sabit ve yumuşak
        line.particles.material.opacity = 0.4;
        line.particles.material.size = 0.12;
    });
    
    productMeshes.forEach((mesh, index) => {
        // Fade-in animasyonu - küreleri yumuşak bir şekilde belirginleştir
        if (mesh.userData.currentOpacity < mesh.userData.targetOpacity) {
            mesh.userData.currentOpacity += 0.02; // Yavaş fade-in
            mesh.material.opacity = Math.min(mesh.userData.currentOpacity, mesh.userData.targetOpacity);
        }
        
        const hoverOffset = mesh.userData.hovered ? Math.sin(time * 3) * 0.4 : 0;
        mesh.position.y = mesh.userData.originalY + Math.sin(time + index) * 0.3 + hoverOffset;
        mesh.rotation.y += 0.004;
        
        // Ana halka - yavaşlatılmış + fade-in
        const ring = mesh.children[0];
        if (ring && ring.type === 'Mesh') {
            ring.rotation.z += 0.005;
            // Fade-in animasyonu
            if (ring.userData.targetOpacity && ring.material.opacity < ring.userData.targetOpacity) {
                ring.material.opacity += 0.015;
            }
        }
        
        // İkinci halka (varsa) - yavaşlatılmış + fade-in
        const ring2 = mesh.children[1];
        if (ring2 && ring2.type === 'Mesh' && ring2.geometry.type === 'TorusGeometry') {
            ring2.rotation.z -= 0.004;
            // Fade-in animasyonu
            if (ring2.userData.targetOpacity && ring2.material.opacity < ring2.userData.targetOpacity) {
                ring2.material.opacity += 0.015;
            }
        }
        
        // Partiküller - yavaşlatılmış + fade-in
        const particles = mesh.children.find(child => child.type === 'Points');
        if (particles) {
            particles.rotation.y += 0.008;
            // Fade-in animasyonu
            if (particles.material.userData.targetOpacity && particles.material.opacity < particles.material.userData.targetOpacity) {
                particles.material.opacity += 0.015;
            }
        }
        
        // Hover efekti - sadece fade-in tamamlandıktan sonra
        if (mesh.userData.currentOpacity >= mesh.userData.targetOpacity) {
            if (mesh.userData.hovered) {
                mesh.material.emissiveIntensity = 0.8;
                mesh.material.opacity = 1.0;
                mesh.scale.set(1.1, 1.1, 1.1);
            } else {
                mesh.material.emissiveIntensity = 0.5;
                mesh.material.opacity = 0.95;
                mesh.scale.set(1, 1, 1);
            }
        }
        
        // Label pozisyonunu güncelle - sadece fade-in tamamlandıysa göster
        const labelDiv = mesh.userData.labelDiv;
        if (labelDiv && mesh.userData.currentOpacity >= mesh.userData.targetOpacity) {
            // 3D pozisyonu label pozisyonuna çevir (kürenin üstü)
            const labelPosition = mesh.position.clone();
            labelPosition.y += 2.5; // Kürenin üstüne - icon için daha yüksek
            
            // 3D'den 2D'ye project et
            const vector = labelPosition.clone().project(camera);
            
            // Ekranın arkasındaysa gizle
            if (vector.z > 1) {
                labelDiv.style.display = 'none';
            } else {
                const x = (vector.x * 0.5 + 0.5) * container.offsetWidth;
                const y = (-(vector.y) * 0.5 + 0.5) * container.offsetHeight;
                
                labelDiv.style.display = 'block';
                labelDiv.style.left = x + 'px';
                labelDiv.style.top = y + 'px';
                labelDiv.style.transform = 'translate(-50%, -100%)';
            }
        } else if (labelDiv) {
            // Fade-in sırasında label'ı gizli tut
            labelDiv.style.display = 'none';
        }
    });
    
    pointLight.intensity = 1.8;
    pointLight2.intensity = 1.2;
    
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    // Update mobile detection on resize
    const newIsMobile = window.innerWidth <= 768;
    const newIsTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    
    // Update camera settings if device type changed
    if (newIsMobile !== isMobile || newIsTablet !== isTablet) {
        location.reload(); // Simple reload to reinitialize with proper settings
    }
    
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    resizeCanvas();
});

// Performance monitoring for mobile
if (isMobile) {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function checkPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = frameCount;
            frameCount = 0;
            lastTime = currentTime;
            
            // Reduce quality if performance is poor
            if (fps < 30) {
                // Reduce particle count or other performance-intensive features
                console.log('Performance optimization triggered, FPS:', fps);
                
                // Optionally reduce quality dynamically
                if (galaxy && galaxy.material) {
                    galaxy.material.opacity = Math.max(0.5, galaxy.material.opacity - 0.1);
                }
            }
        }
        
        requestAnimationFrame(checkPerformance);
    }
    
    // Start performance monitoring after a delay
    setTimeout(checkPerformance, 2000);
}


// D1-driven layout: reposition meshes based on product count
function __applyProductLayout(list){
  try{
    const activeCount = Math.min(Array.isArray(list)? list.length : 0, productMeshes.length) || productMeshes.length;
    const step = (Math.PI * 2) / activeCount;
    for(let i=0;i<productMeshes.length;i++){
      const mesh = productMeshes[i];
      const labelDiv = mesh?.userData?.labelDiv;
      if(i < activeCount){
        const angle = step * i + (Math.PI * 0.3);
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        mesh.visible = true;
        mesh.position.x = x; mesh.position.z = z;
        if (labelDiv) labelDiv.style.display = '';
      } else {
        mesh.visible = false;
        if (labelDiv) labelDiv.style.display = 'none';
      }
    }
  }catch(e){ console.warn('layout error', e); }
}

// Helpers for D1-driven rebuild
function __toHexInt(c){
  if(!c) return null;
  if (typeof c === 'number') return c >>> 0;
  const m = String(c).trim().match(/^#?([0-9a-fA-F]{6})$/);
  if(!m) return null;
  return parseInt('0x'+m[1]);
}
function __rgbaFromInt(intColor, a){
  const r=(intColor>>16)&255, g=(intColor>>8)&255, b=intColor&255;
  return `rgba(${r},${g},${b},${a})`;
}
function __clearProducts(){
  try{
    const labels = document.getElementById('labels-container');
    if (labels) labels.innerHTML = '';
    while (productMeshes.length) {
      const m = productMeshes.pop();
      try { if (m.userData && m.userData.labelDiv) m.userData.labelDiv.remove(); } catch(_){}
      scene.remove(m);
    }
  }catch(e){ console.warn('clear error', e); }
}
function __buildProductMesh(item, index, count){
  const angleOffset = Math.PI * 0.3;
  const angle = ((Math.PI * 2) / count) * index + angleOffset;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  const fallback = 0x4fa3d1;
  const colorInt = __toHexInt(item?.color) ?? fallback;
  const rgba = __rgbaFromInt(colorInt, 0.4);

  const geometry = new THREE.SphereGeometry(1.2, 64, 64);
  let digitalTexture;
  if (index % 3 === 0) digitalTexture = createCircuitTexture(rgba);
  else if (index % 3 === 1) digitalTexture = createHexagonTexture(rgba);
  else digitalTexture = createDataFlowTexture(rgba);

  const material = new THREE.MeshPhongMaterial({
    color: colorInt,
    emissive: colorInt,
    emissiveIntensity: 0.5,
    shininess: 120,
    transparent: true,
    opacity: 0,
    map: digitalTexture,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 0, z);
  mesh.userData = { product: { name: item?.title || 'Ürün', desc: item?.description || '' }, index, originalY:0, targetOpacity:0.95, currentOpacity:0 };

  // Rings
  let ringGeometry, ringMaterial;
  if (index % 3 === 0) { ringGeometry = new THREE.TorusGeometry(1.6, 0.05, 8, 50); }
  else if (index % 3 === 1) { ringGeometry = new THREE.TorusGeometry(1.8, 0.03, 8, 50); }
  else { ringGeometry = new THREE.TorusGeometry(1.5, 0.08, 8, 50); }
  ringMaterial = new THREE.MeshBasicMaterial({ color: colorInt, transparent:true, opacity:0 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI/2;
  ring.userData = { targetOpacity: index % 3 === 0 ? 0.5 : (index % 3 === 1 ? 0.6 : 0.4) };
  mesh.add(ring);
  if (index % 2 === 0) {
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.0, 0.02, 6, 40), new THREE.MeshBasicMaterial({ color: colorInt, transparent:true, opacity:0 }));
    ring2.rotation.x = Math.PI/2; ring2.rotation.z = Math.PI/4; ring2.userData = { targetOpacity: 0.3 };
    mesh.add(ring2);
  }

  // Particles
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 20;
  const positions = new Float32Array(particlesCount * 3);
  for (let i=0;i<particlesCount;i++){
    const a=(i/particlesCount)*Math.PI*2; const orbit=1.4+Math.random()*0.4; const h=(Math.random()-0.5)*0.3;
    positions[i*3] = Math.cos(a)*orbit; positions[i*3+1]=h; positions[i*3+2]=Math.sin(a)*orbit;
  }
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const particlesMaterial = new THREE.PointsMaterial({ color: colorInt, size:0.12, transparent:true, opacity:0 });
  particlesMaterial.userData = { targetOpacity: 0.7 };
  mesh.add(new THREE.Points(particlesGeometry, particlesMaterial));

  scene.add(mesh);
  productMeshes.push(mesh);

  // Label
  const labelDiv = document.createElement('div');
  labelDiv.className = 'product-label';
  labelDiv.innerHTML = `
    <div style="font-size: 2.5rem; margin-bottom: 5px;"></div>
    <div class="product-label-name">${item?.title || 'Ürün'}</div>
    <div class="product-label-brand">QbYTen</div>
  `;
  labelDiv.style.display = 'none';
  document.getElementById('labels-container')?.appendChild(labelDiv);
  mesh.userData.labelDiv = labelDiv;
}

function __rebuildConnectionLines(){
  try{
    if (Array.isArray(connectionLines)) {
      for (const l of connectionLines) {
        try { scene.remove(l.main); scene.remove(l.glow1); scene.remove(l.glow2); scene.remove(l.particles); } catch(_){ }
      }
      connectionLines.length = 0;
    }
    productMeshes.forEach((mesh) => {
      const points = [ new THREE.Vector3(0,0,0), mesh.position.clone() ];
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const mainLine = new THREE.Line(lineGeometry.clone(), new THREE.LineBasicMaterial({ color:0xffd700, transparent:true, opacity:0.3, linewidth:2 }));
      const glowLine1 = new THREE.Line(lineGeometry.clone(), new THREE.LineBasicMaterial({ color:0xffffaa, transparent:true, opacity:0.2, linewidth:3, blending:THREE.AdditiveBlending }));
      const glowLine2 = new THREE.Line(lineGeometry.clone(), new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0.1, linewidth:5, blending:THREE.AdditiveBlending }));
      scene.add(mainLine); scene.add(glowLine1); scene.add(glowLine2);
      const particleCount=8; const particleGeometry=new THREE.BufferGeometry(); const particlePositions=new Float32Array(particleCount*3);
      for(let i=0;i<particleCount;i++){ const t=i/particleCount; const pos=new THREE.Vector3().lerpVectors(new THREE.Vector3(0,0,0), mesh.position.clone(), t); particlePositions[i*3]=pos.x; particlePositions[i*3+1]=pos.y; particlePositions[i*3+2]=pos.z; }
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions,3));
      const lineParticles=new THREE.Points(particleGeometry, new THREE.PointsMaterial({ color:0xffffcc, size:0.12, transparent:true, opacity:0.4, blending:THREE.AdditiveBlending, sizeAttenuation:true }));
      scene.add(lineParticles);
      connectionLines.push({ main:mainLine, glow1:glowLine1, glow2:glowLine2, particles:lineParticles, mesh, startPos:new THREE.Vector3(0,0,0), endPos:mesh.position.clone() });
    });
  }catch(e){ console.warn('rebuild lines error', e); }
}

function __rebuildProductsFromD1(list){
  if (!Array.isArray(list) || !list.length) return;
  __clearProducts();
  const count = list.length;
  for (let i=0;i<count;i++) __buildProductMesh(list[i], i, count);
  __rebuildConnectionLines();
  __applyProductLayout(list);
}
