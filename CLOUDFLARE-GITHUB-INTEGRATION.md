# Cloudflare Pages - GitHub Otomatik Deployment Kurulumu

## GitHub'a Push Edildi ✅

Tüm değişiklikler GitHub'a başarıyla push edildi:
- **Repository:** https://github.com/rifatduru7/qbyten
- **Branch:** main
- **Son Commit:** feat: add navigation menu management system and improve admin panel

## Cloudflare Pages GitHub Entegrasyonu Kurulumu

Artık her GitHub'a push ettiğinizde otomatik olarak Cloudflare'e deploy olması için aşağıdaki adımları izleyin:

### Adım 1: Cloudflare Pages Dashboard'a Gidin

1. https://dash.cloudflare.com/ adresine gidin
2. Sol menüden **Workers & Pages** seçin
3. **Pages** sekmesine tıklayın

### Adım 2: Mevcut Projeyi GitHub'a Bağlayın

#### Seçenek A: Yeni Proje Oluştur (Önerilen)

1. **Create Application** butonuna tıklayın
2. **Pages** sekmesinde **Connect to Git** seçin
3. **Connect GitHub** butonuna tıklayın
4. GitHub hesabınıza bağlanmak için yetkilendirme yapın
5. Repository listesinden **rifatduru7/qbyten** seçin
6. **Begin setup** butonuna tıklayın

#### Build Ayarları:
```
Project name: qbyten
Production branch: main
Build command: npm run build
Build output directory: dist
```

#### Environment Variables:
Şu an için gerekli değil, ancak ileride API key'ler ekleyebilirsiniz.

7. **Save and Deploy** butonuna tıklayın

#### Seçenek B: Mevcut Projeyi Güncelle

Eğer zaten bir `qbyten` projesi varsa:

1. Cloudflare Pages dashboard'da **qbyten** projesine tıklayın
2. **Settings** sekmesine gidin
3. **Builds & deployments** bölümüne gidin
4. **Configure Production deployments** altında **Connect to Git** seçeneğini bulun
5. GitHub'ı bağlayın ve repository'yi seçin

### Adım 3: Build Ayarlarını Yapılandırın

**Settings > Builds & deployments** bölümünde:

```yaml
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
Node version: 18
```

#### Build Hook (Opsiyonel - Functions için)
Eğer `functions/` ve `admin/` klasörlerini de kopyalamak istiyorsanız:

**Build command'i değiştirin:**
```bash
npm run build && cp -r admin dist/ && cp -r functions dist/
```

Veya `package.json`'a bir script ekleyin:
```json
{
  "scripts": {
    "build": "vite build",
    "build:deploy": "vite build && cp -r admin dist/ && cp -r functions dist/"
  }
}
```

Sonra Cloudflare'de build command olarak:
```bash
npm run build:deploy
```

### Adım 4: Environment Variables (D1 Binding)

**Settings > Functions** bölümünde:

1. **D1 database bindings** seçeneğine tıklayın
2. **Add binding** butonuna tıklayın
3. Ayarları yapın:
   ```
   Variable name: DB
   D1 database: qbyten
   ```
4. **Save** butonuna tıklayın

### Adım 5: Custom Domain (Opsiyonel)

Eğer özel bir domain kullanmak istiyorsanız:

1. **Settings > Domains & URLs** bölümüne gidin
2. **Add a custom domain** butonuna tıklayın
3. Domain'inizi girin (örn: qbyten.com)
4. DNS ayarlarını yapılandırın

### Adım 6: Test Edin

1. GitHub'a bir değişiklik push edin:
   ```bash
   echo "# Test" >> README.md
   git add README.md
   git commit -m "test: verify auto-deployment"
   git push origin main
   ```

2. Cloudflare Pages dashboard'da **Deployments** sekmesine gidin
3. Yeni bir deployment başladığını göreceksiniz
4. Deployment tamamlandığında otomatik olarak yayına alınacak

## Otomatik Deployment Çalışma Şekli

### Her GitHub Push'ta:
1. ✅ GitHub'a kod push edilir
2. ✅ Cloudflare Pages otomatik olarak algılar
3. ✅ `npm install` çalıştırılır
4. ✅ `npm run build` (veya özel build command) çalıştırılır
5. ✅ `dist/` klasörü deploy edilir
6. ✅ Yeni URL oluşturulur (örn: abc123.qbyten.pages.dev)
7. ✅ Production branch'e push ise ana domain güncellenir

### Branch Preview:
- `main` branch → Production deployment
- Diğer branch'ler → Preview deployment (örn: dev-branch.qbyten.pages.dev)
- Pull Request'ler → Preview deployment (PR kapandığında silinir)

## Deployment URL'leri

### Production:
- **Current:** https://8d97f6d2.qbyten.pages.dev
- **GitHub Entegrasyondan Sonra:** https://qbyten.pages.dev (veya özel domain)

### Preview Deployments:
- Her commit için unique URL: `https://[commit-hash].qbyten.pages.dev`
- Branch deployments: `https://[branch-name].qbyten.pages.dev`

## Rollback (Geri Alma)

Eğer bir deployment'ta sorun çıkarsa:

1. Cloudflare Pages dashboard'da **Deployments** sekmesine gidin
2. Önceki başarılı deployment'ı bulun
3. **⋮** (üç nokta) menüsüne tıklayın
4. **Rollback to this deployment** seçin

## Build Log Görüntüleme

Deployment sırasında sorun çıkarsa:

1. **Deployments** sekmesinde başarısız deployment'a tıklayın
2. **View build log** butonuna tıklayın
3. Hataları inceleyin ve düzeltin

## Webhook Notifications (Opsiyonel)

Deployment bildirimleri almak için:

1. **Settings > Notifications** bölümüne gidin
2. Webhook URL ekleyin (Slack, Discord, vb.)
3. Hangi event'lerde bildirim alacağınızı seçin

## Troubleshooting

### Sorun: Build başarısız oluyor
**Çözüm:**
- Build log'ları inceleyin
- `package.json` içinde tüm dependency'lerin olduğundan emin olun
- Node version'ı kontrol edin (Settings > Builds & deployments > Node version)

### Sorun: Functions çalışmıyor
**Çözüm:**
- `functions/` klasörünün `dist/` içine kopyalandığından emin olun
- Build command: `npm run build && cp -r functions dist/`
- D1 binding'in doğru yapılandırıldığından emin olun

### Sorun: Admin panel boş geliyor
**Çözüm:**
- `admin/` klasörünün `dist/` içine kopyalandığından emin olun
- Build command: `npm run build && cp -r admin dist/ && cp -r functions dist/`

### Sorun: Environment variables eksik
**Çözüm:**
- Settings > Environment variables bölümünde tüm gerekli variable'ları ekleyin
- Production ve Preview için ayrı ayrı ayarlayın

## package.json Script Önerisi

Deployment'ı kolaylaştırmak için `package.json`'a bu script'i ekleyin:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:deploy": "vite build && cp -r admin dist/ && cp -r functions dist/",
    "preview": "vite preview"
  }
}
```

Sonra Cloudflare build command'i:
```bash
npm run build:deploy
```

## Sonuç

✅ GitHub repository hazır
✅ Kod push edildi
✅ Talimatlar hazır

Artık yukarıdaki adımları izleyerek Cloudflare Pages'i GitHub'a bağlayabilirsiniz. Her `git push origin main` yaptığınızda otomatik olarak deploy olacak!

## Faydalı Linkler

- **Cloudflare Dashboard:** https://dash.cloudflare.com/
- **GitHub Repository:** https://github.com/rifatduru7/qbyten
- **Cloudflare Pages Docs:** https://developers.cloudflare.com/pages/
- **D1 Database Docs:** https://developers.cloudflare.com/d1/

## Next Steps

1. Cloudflare'de GitHub entegrasyonunu kurun
2. İlk deployment'ın başarılı olduğunu doğrulayın
3. Admin paneli test edin
4. Menu management implementation prompt'u çalıştırın
5. Production domain ayarlayın (opsiyonel)

Başarılar! 🚀
