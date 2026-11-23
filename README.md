# ZM Generator E-Commerce & Service Web Application
### ဂျပန်တစ်ပတ်ရစ် မီးစက် ရောင်း/ဝယ်/ငှား နှင့် ၂၄ နာရီ ပြုပြင်ရေး ဝန်ဆောင်မှု ဝက်ဘ်ဆိုက်

မီးစက် Secondhand များ ရောင်းချခြင်း၊ ဝယ်ယူခြင်း၊ အငှားဝန်ဆောင်မှုနှင့် ပြုပြင်ထိန်းသိမ်းရေး လုပ်ငန်းများအတွက် **Node.js** နှင့် **SQLite** Database ဖြင့် တည်ဆောက်ထားသော E-Commerce & Service Platform ဖြစ်ပါသည်။

---

## 🌟 အဓိက ပါဝင်သော လုပ်ဆောင်ချက်များ (Key Features)

1. **ရောင်းရန် မီးစက်များ (Secondhand Generators for Sale)**
   - Denyo, Airman, Cummins, Perkins, Kubota, Mitsubishi စသည့် နာမည်ကြီး ဂျပန်စက်များ
   - kVA ပါဝါ (10 kVA မှ 500 kVA အထိ)၊ ဈေးနှုန်း (သိန်း)၊ စက်အမျိုးအစား (Soundproof / Open)၊ လည်ပတ်နာရီ အလိုက် စစ်ထုတ်ခြင်း (Filter)
   - မီးစက် အသေးစိတ် အချက်အလက်နှင့် ဝယ်ယူရန် တောင်းဆိုလွှာ (Inquiry / Order) စနစ်

2. **မီးစက် အငှားဝန်ဆောင်မှု (Generator Rental Service)**
   - ရက်တို / ရက်ရှည် ငှားရမ်းခ တွက်ချက်စက် (Rental Price Estimator)
   - အော်ပရေတာနှင့် ကရိန်းယာဉ် အပါအဝင် အငှားဘိုကင်တင်ခြင်း (Booking Code ထုတ်ပေးခြင်း)

3. **မိမိမီးစက် ပြန်ရောင်းရန် (Sell Your Generator)**
   - သုံးစွဲသူများ မိမိတို့၏ မီးစက်ဟောင်း အချက်အလက်၊ မျှော်မှန်းဈေးနှုန်းနှင့် ဓာတ်ပုံများ တင်ပြနိုင်သည့် စနစ်
   - နေရာအရောက် စစ်ဆေးဝယ်ယူခြင်းနှင့် ချက်ချင်းငွေချေစနစ်

4. **၂၄ နာရီ မီးစက် ပြုပြင်ရေး (24/7 Repair & Maintenance)**
   - Emergency Breakdown (အရေးပေါ် စက်ရပ်တန့်မှု)
   - Periodic Maintenance (ပုံမှန် ဆီနှင့် Filter လဲလှယ်ခြင်း)
   - Alternator Rewinding & AVR (ဒိုင်နမိုပြန်ပတ်ခြင်းနှင့် မီးထိန်းစနစ်)
   - Engine Overhaul (အင်ဂျင်ဆေးကြောစစ်ဆေးခြင်း)
   - Online Ticket ဘိုကင်တင်ခြင်းနှင့် အင်ဂျင်နီယာ တာဝန်ပေးအပ်ခြင်း

5. **အခြေအနေ စစ်ဆေးရန် စနစ် (Live Status Tracker)**
   - လက်မှတ်ကုဒ် (ဥပမာ `REP-...`, `RNT-...`, `SELL-...`, `ORD-...`) သို့မဟုတ် ဖုန်းနံပါတ်ဖြင့် အခြေအနေ တိုက်ရိုက် စစ်ဆေးနိုင်ခြင်း

6. **စီမံခန့်ခွဲသူ စနစ် (Admin Control Panel)**
   - Dashboard စာရင်းအင်းများ (ရောင်းရန်မီးစက်၊ အငှားဘိုကင်၊ ပြုပြင်ရေးလက်မှတ်၊ အဝယ်တင်ပြချက်များ)
   - မီးစက်အသစ် ထည့်သွင်းခြင်း၊ ပြင်ဆင်ခြင်း၊ ဖျက်ပစ်ခြင်း (CRUD)
   - ဘိုကင်၊ လက်မှတ်များနှင့် အမှာစာများ Status ပြောင်းလဲခြင်း
   - ဆက်သွယ်ရန် ဖုန်း၊ Viber၊ လိပ်စာ ပြင်ဆင်ခြင်း

---

## 🛠️ နည်းပညာ အသုံးပြုထားမှု (Tech Stack)

- **Backend**: Node.js, Express.js
- **Database**: SQLite (`node:sqlite` Native DatabaseSync - C++ build tool မလိုဘဲ အလွန်ပေါ့ပါးမြန်ဆန်သည်)
- **File Uploads**: Multer (မီးစက်ဓာတ်ပုံများ၊ တင်ပြချက်များ)
- **Security**: Bcrypt.js (Password Hashing), Session Cookies
- **Frontend**: Modern Responsive HTML5, Tailwind CSS, Lucide Icons, Vanilla JavaScript

---

## 🚀 စတင် အသုံးပြုနည်း (Quick Start)

### ၁။ Dependency များ ထည့်သွင်းခြင်း (ပြီးစီးပြီးဖြစ်ပါသည်)
```bash
npm install
```

### ၂။ Database Seed ပြုလုပ်ခြင်း (နမူနာ မီးစက်များနှင့် Admin အကောင့် ထည့်သွင်းရန်)
```bash
node database/seed.js
```

### ၃။ ဆာဗာ စတင် Run ခြင်း
```bash
npm start
```
သို့မဟုတ်
```bash
node server.js
```

ဆာဗာ ပွင့်သွားပါက Browser တွင် အောက်ပါအတိုင်း ဝင်ရောက်နိုင်ပါသည်-
- 🌐 ဝက်ဘ်ဆိုက် ပင်မစာမျက်နှာ: **http://localhost:3000**
- 🛒 မီးစက် အရောင်းဆိုင်: **http://localhost:3000/generators.html**
- ⚡ မီးစက် အငှားဝန်ဆောင်မှု: **http://localhost:3000/rentals.html**
- 💰 မီးစက် ပြန်ရောင်းရန်: **http://localhost:3000/sell.html**
- 🛠️ ပြုပြင်ရေး ဝန်ဆောင်မှု: **http://localhost:3000/repair.html**
- 🔍 အခြေအနေ စစ်ဆေးရန်: **http://localhost:3000/track.html**
- 🔑 Admin Login: **http://localhost:3000/login.html**
- 📊 Admin Panel: **http://localhost:3000/admin.html**

---

## 🔐 စီမံခန့်ခွဲသူ အကောင့် (Admin Credentials)

- **Username**: `admin`
- **Password**: `admin123`

---

## 📁 ဖိုင်တည်ဆောက်ပုံ (Project Structure)

```
ZM-Geerator-web/
├── database/
│   ├── zm_generator.db         # SQLite database file
│   ├── db.js                   # SQLite schema & connection
│   ├── seed.js                 # Initial seed data script
│   └── create-svg-images.js    # Generator vector graphics generator
├── middleware/
│   ├── auth.js                 # Authentication session middleware
│   └── upload.js               # Multer file upload handler
├── routes/
│   ├── auth.js                 # Admin login / logout
│   ├── generators.js           # Generators CRUD & search/filter API
│   ├── rentals.js              # Rental items & bookings API
│   ├── repairs.js              # Repair service requests API
│   ├── sellRequests.js         # Customer sell submissions API
│   ├── orders.js               # Purchase inquiry orders API
│   ├── track.js                # Status tracking API
│   ├── stats.js                # Dashboard statistics API
│   └── settings.js             # Company contact settings API
├── public/
│   ├── index.html              # Main storefront homepage
│   ├── generators.html         # Generators catalog & filters
│   ├── rentals.html            # Rental service & calculator
│   ├── sell.html               # Customer generator sell portal
│   ├── repair.html             # Repair service booking
│   ├── track.html              # Live status tracker
│   ├── login.html              # Admin authentication login
│   ├── admin.html              # Admin management dashboard
│   ├── css/
│   │   └── style.css           # Styling & fonts
│   ├── js/
│   │   └── main.js             # Shared frontend logic & toast
│   ├── images/                 # Generator SVG vector graphics
│   └── uploads/                # User uploaded photos
├── tests/
│   └── test-endpoints.js       # Automated test suite (16 tests)
├── package.json
├── server.js                   # Main application entry point
└── README.md
```
