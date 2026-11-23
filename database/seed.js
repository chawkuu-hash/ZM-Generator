const db = require('./db');
const bcrypt = require('bcryptjs');

function seed() {
  console.log('🌱 Starting database seeding for ZM Generator Web...');

  // 1. Seed Admin User
  const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!existingUser) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO users (username, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run('admin', passwordHash, 'ZM စီမံခန့်ခွဲသူ', 'admin');
    console.log('✅ Admin user created (username: admin, password: admin123)');
  }

  // 2. Seed Settings
  const settingsData = [
    ['site_name', 'ZM Generator Service & Trading (ဇေယျာမင်း မီးစက် ရောင်း/ဝယ်/ငှား/ပြုပြင်)'],
    ['phone_primary', '09 777 888 999'],
    ['phone_secondary', '09 250 123 456'],
    ['viber_phone', '09 777 888 999'],
    ['telegram_username', 'zmgenerator_yangon'],
    ['email', 'contact@zmgenerator.com'],
    ['address', 'အမှတ် (၄၅)၊ စက်မှုဇုန် (၂)၊ ဒဂုံမြို့သစ်တောင်ပိုင်း၊ ရန်ကုန်မြို့။'],
    ['operating_hours', 'တနင်္လာ - စနေ (မနက် ၈:၀၀ မှ ညနေ ၆:၀၀) / ၂၄ နာရီ အရေးပေါ် ဝန်ဆောင်မှု'],
    ['about_summary', 'ZM Generator သည် ဂျပန်မှ တိုက်ရိုက်တင်သွင်းသော Secondhand / Reconditioned မီးစက်များကို အရည်အသွေး အာမခံဖြင့် ရောင်းချပေးခြင်း၊ မီးစက် အငှားဝန်ဆောင်မှုနှင့် စက်မှုဇုန်/ကုမ္ပဏီများအတွက် ၂၄ နာရီ မီးစက်ပြုပြင် ထိန်းသိမ်းရေး ဝန်ဆောင်မှုများကို ဆောင်ရွက်ပေးနေပါသည်။']
  ];

  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, val] of settingsData) {
    insertSetting.run(key, val);
  }
  console.log('✅ Company settings seeded.');

  // 3. Seed Secondhand Generators for Sale
  const countGenerators = db.prepare('SELECT COUNT(*) as count FROM generators').get().count;
  if (countGenerators === 0) {
    const sampleGenerators = [
      {
        title: 'Denyo 25 kVA DCA-25ESK Soundproof Diesel Generator',
        brand: 'Denyo',
        model: 'DCA-25ESK',
        capacity_kva: 25,
        power_kw: 20,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        phase: '3-Phase / 4-Wire (400V/230V)',
        engine_model: 'Kubota V2203-B / Isuzu',
        alternator_brand: 'Denyo Original Brushless',
        condition: 'Japan Reconditioned (92%)',
        running_hours: 3200,
        year_manufactured: 2018,
        price_lakhs: 285,
        price_mmk: 28500000,
        is_negotiable: 1,
        warranty_months: 6,
        location: 'ရန်ကုန် (စက်မှုဇုန်)',
        images: JSON.stringify(['/images/denyo-25kva.svg']),
        featured: 1,
        status: 'available',
        description: 'ဂျပန်အသုံပြီး Original ဆေးသား၊ အသံလုံ ဗူးပါပြီး ရုံးခန်း၊ စတိုးဆိုင်နှင့် အိမ်သုံးအတွက် အထူးသင့်လျော်ပါသည်။ စက်ပိုင်းဆိုင်ရာ အကုန်စစ်ဆေးပြီး အာမခံ ၆ လအပြည့် ပါရှိပါသည်။ ဆီစားသက်သာပြီး ဝန်အပြည့်ခံနိုင်သည်။',
        specifications: JSON.stringify({
          'လောင်စာဆီစားသုံးမှု': '3.8 Liters/hr at 75% load',
          'အသံဆူညံမှု': '63 dB(A) at 7m',
          'ဆီတိုင်ကီပမာဏ': '62 Liters',
          'အလေးချိန်': '780 kg',
          'စတင်စနစ်': '12V Electric Starter'
        })
      },
      {
        title: 'Airman SDG-45S 45 kVA Ultra Silent Diesel Generator',
        brand: 'Airman',
        model: 'SDG-45S',
        capacity_kva: 45,
        power_kw: 36,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        phase: '3-Phase',
        engine_model: 'Isuzu 4BG1-T Turbo Diesel',
        alternator_brand: 'Airman Brushless Synchronous',
        condition: 'Japan Direct Import (90%)',
        running_hours: 4100,
        year_manufactured: 2017,
        price_lakhs: 410,
        price_mmk: 41000000,
        is_negotiable: 1,
        warranty_months: 6,
        location: 'ရန်ကုန်',
        images: JSON.stringify(['/images/airman-45kva.svg']),
        featured: 1,
        status: 'available',
        description: 'Isuzu Turbo အင်ဂျင်တပ်ဆင်ထားပြီး ဆောက်လုပ်ရေးဆိုဒ်များ၊ စက်ရုံအသေးစားများနှင့် ဟိုတယ်/စားသောက်ဆိုင်ကြီးများအတွက် အထူးကောင်းမွန်သည်။ လောင်စာဆီ ချွေတာမှု အထူးကောင်းမွန်ပြီး အသံအလွန်တိတ်ဆိတ်ပါသည်။',
        specifications: JSON.stringify({
          'လောင်စာဆီစားသုံးမှု': '6.8 Liters/hr at 75% load',
          'အသံဆူညံမှု': '61 dB(A) at 7m',
          'ဆီတိုင်ကီပမာဏ': '100 Liters',
          'အလေးချိန်': '1,120 kg',
          'Cooling': 'Water-cooled radiator'
        })
      },
      {
        title: 'Cummins 100 kVA 6BT5.9 Heavy Duty Industrial Generator',
        brand: 'Cummins',
        model: 'C100D5',
        capacity_kva: 100,
        power_kw: 80,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        phase: '3-Phase',
        engine_model: 'Cummins 6BT5.9-G2',
        alternator_brand: 'Stamford UCI274C',
        condition: 'Overhauled & Tested (88%)',
        running_hours: 5800,
        year_manufactured: 2016,
        price_lakhs: 670,
        price_mmk: 67000000,
        is_negotiable: 1,
        warranty_months: 6,
        location: 'ရန်ကုန်',
        images: JSON.stringify(['/images/cummins-100kva.svg']),
        featured: 1,
        status: 'available',
        description: 'Cummins 6BT အင်ဂျင်အကြမ်းခံ၊ စက်ရုံကြီးများ၊ ဆေးရုံ၊ အအေးခန်းနှင့် ကုန်တိုက်များအတွက် စိတ်ချရသော အင်ဂျင်ပါဝါ။ DeepSea digital controller အသစ်လဲလှယ်ထားပြီး အလိုအလျောက် မီးကူးစနစ် (ATS Ready) ပါရှိပါသည်။',
        specifications: JSON.stringify({
          'လောင်စာဆီစားသုံးမှု': '16.5 Liters/hr at 75% load',
          'Controller': 'Deepsea 6020 Auto Start',
          'ဆီတိုင်ကီပမာဏ': '220 Liters',
          'အလေးချိန်': '1,650 kg',
          'အာမခံ': '၆ လ စက်ပိုင်းဆိုင်ရာ အာမခံ'
        })
      },
      {
        title: 'Perkins 150 kVA Soundproof Containerized Generator',
        brand: 'Perkins',
        model: '1106A-70TAG2',
        capacity_kva: 150,
        power_kw: 120,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        phase: '3-Phase',
        engine_model: 'Perkins 1106A UK Engine',
        alternator_brand: 'Leroy Somer',
        condition: 'Excellent Condition (93%)',
        running_hours: 2900,
        year_manufactured: 2019,
        price_lakhs: 980,
        price_mmk: 98000000,
        is_negotiable: 1,
        warranty_months: 6,
        location: 'ရန်ကုန် (စက်မှုဇုန်)',
        images: JSON.stringify(['/images/perkins-150kva.svg']),
        featured: 1,
        status: 'available',
        description: 'UK နာမည်ကြီး Perkins စက်အစစ်၊ Electronic Governor ပါရှိသဖြင့် Frequency တည်ငြိမ်မှု အလွန်ကောင်းမွန်သည်။ ကွန်ဒိုတိုက်ခန်းများ၊ စက်ရုံများနှင့် ပုဂ္ဂလိက ဆေးရုံများအတွက် အထူးသင့်လျော်သည်။',
        specifications: JSON.stringify({
          'လောင်စာဆီစားသုံးမှု': '24 Liters/hr at 75% load',
          'Alternator': 'Leroy Somer TAL-A44-M',
          'ဆီတိုင်ကီပမာဏ': '350 Liters',
          'အလေးချိန်': '2,150 kg',
          'အာမခံ': '၆ လ လက်ခ အခမဲ့'
        })
      },
      {
        title: 'Denyo DCA-15ESX 15 kVA Mini Silent Generator',
        brand: 'Denyo',
        model: 'DCA-15ESX',
        capacity_kva: 15,
        power_kw: 12,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        phase: 'Single Phase / 3-Phase switchable',
        engine_model: 'Yanmar 3TNV88',
        alternator_brand: 'Denyo Brushless',
        condition: 'Japan Reconditioned (95%)',
        running_hours: 1950,
        year_manufactured: 2020,
        price_lakhs: 210,
        price_mmk: 21000000,
        is_negotiable: 1,
        warranty_months: 6,
        location: 'ရန်ကုန်',
        images: JSON.stringify(['/images/denyo-15kva.svg']),
        featured: 0,
        status: 'available',
        description: 'မီးအလွန်စားနည်းပြီး Yanmar အင်ဂျင်ဖြင့် မောင်းနှင်သည်။ အိမ်သုံး၊ လက်ဖက်ရည်ဆိုင်၊ ဆေးခန်းနှင့် အသေးစားစီးပွားရေးလုပ်ငန်းများအတွက် အသံတိတ်ဆိတ်ပြီး သယ်ယူရလွယ်ကူသော မော်ဒယ်ဖြစ်သည်။',
        specifications: JSON.stringify({
          'လောင်စာဆီစားသုံးမှု': '2.3 Liters/hr',
          'ဆီတိုင်ကီပမာဏ': '50 Liters',
          'အလေးချိန်': '550 kg'
        })
      },
      {
        title: 'Mitsubishi 60 kVA Open Type Heavy Diesel Generator',
        brand: 'Mitsubishi',
        model: 'MGS-0060B',
        capacity_kva: 60,
        power_kw: 48,
        fuel_type: 'Diesel',
        type: 'Open',
        phase: '3-Phase',
        engine_model: 'Mitsubishi S4K-T',
        alternator_brand: 'MGS Heavy',
        condition: 'Good Working Condition (85%)',
        running_hours: 6200,
        year_manufactured: 2015,
        price_lakhs: 340,
        price_mmk: 34000000,
        is_negotiable: 1,
        warranty_months: 3,
        location: 'မန္တလေး/ရန်ကုန်',
        images: JSON.stringify(['/images/mitsubishi-60kva.svg']),
        featured: 0,
        status: 'available',
        description: 'Open type ဖြစ်ပြီး စက်ရုံတွင်း စက်ခန်းသီးသန့်ထားရှိမည့် နေရာများအတွက် ဈေးနှုန်း အလွန်သက်သာစွာ ရရှိနိုင်ပါသည်။ အင်ဂျင်ဖိအားကောင်းပြီး ဝန်အပြည့်တင်မောင်းနိုင်ပါသည်။',
        specifications: JSON.stringify({
          'အမျိုးအစား': 'Open Skid Mounted',
          'ဆီစားနှုန်း': '9.2 Liters/hr',
          'အလေးချိန်': '1,050 kg'
        })
      },
      {
        title: 'Kubota 10 kVA SQ-1120 Compact Silent Generator',
        brand: 'Kubota',
        model: 'SQ-1120',
        capacity_kva: 10,
        power_kw: 8,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        phase: 'Single Phase (220V)',
        engine_model: 'Kubota D722 Diesel',
        alternator_brand: 'Kubota',
        condition: 'Japan Reconditioned (94%)',
        running_hours: 1400,
        year_manufactured: 2021,
        price_lakhs: 165,
        price_mmk: 16500000,
        is_negotiable: 1,
        warranty_months: 6,
        location: 'ရန်ကုန်',
        images: JSON.stringify(['/images/kubota-10kva.svg']),
        featured: 0,
        status: 'available',
        description: 'အိမ်သုံးနှင့် ဆိုင်သုံးအတွက် အသင့်တော်ဆုံး၊ ဂျပန်မူရင်း တိတ်ဆိတ်အေးဆေးစွာ လည်ပတ်နိုင်သော Kubota SQ စီးရီး။ ဆီစားအထူးသက်သာသည်။',
        specifications: JSON.stringify({
          'လောင်စာဆီစားနှုန်း': '1.8 Liters/hr',
          'အသံ': '58 dB(A)',
          'အလေးချိန်': '380 kg'
        })
      },
      {
        title: 'Cummins 250 kVA Industrial Soundproof Powerhouse',
        brand: 'Cummins',
        model: 'QSL9-G5',
        capacity_kva: 250,
        power_kw: 200,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        phase: '3-Phase',
        engine_model: 'Cummins QSL9 Electronic Engine',
        alternator_brand: 'Stamford UCDI274K',
        condition: 'Like New (96%)',
        running_hours: 1800,
        year_manufactured: 2021,
        price_lakhs: 1550,
        price_mmk: 155000000,
        is_negotiable: 1,
        warranty_months: 12,
        location: 'ရန်ကုန်',
        images: JSON.stringify(['/images/cummins-250kva.svg']),
        featured: 1,
        status: 'available',
        description: 'စက်မှုဇုန် စက်ရုံကြီးများ၊ အဆင့်မြင့် ဟိုတယ်ကြီးများအတွက် အကောင်းဆုံး မော်ဒယ်။ Electronic Engine ဖြစ်၍ ပေါ့ပါးသွက်လက်ပြီး ဆီစားတိကျသည်။ အာမခံ ၁ နှစ် အပြည့်ပေးပါသည်။',
        specifications: JSON.stringify({
          'လောင်စာဆီစားနှုန်း': '38 Liters/hr at 75% load',
          'ဆီတိုင်ကီ': '500 Liters',
          'အလေးချိန်': '3,400 kg'
        })
      }
    ];

    const insertGen = db.prepare(`
      INSERT INTO generators (
        title, brand, model, capacity_kva, power_kw, fuel_type, type, phase,
        engine_model, alternator_brand, condition, running_hours, year_manufactured,
        price_lakhs, price_mmk, is_negotiable, warranty_months, location,
        images, featured, status, description, specifications
      ) VALUES (
        @title, @brand, @model, @capacity_kva, @power_kw, @fuel_type, @type, @phase,
        @engine_model, @alternator_brand, @condition, @running_hours, @year_manufactured,
        @price_lakhs, @price_mmk, @is_negotiable, @warranty_months, @location,
        @images, @featured, @status, @description, @specifications
      )
    `);

    for (const item of sampleGenerators) {
      insertGen.run(item);
    }
    console.log(`✅ Seeded ${sampleGenerators.length} secondhand generators for sale.`);
  }

  // 4. Seed Rental Catalog
  const countRentals = db.prepare('SELECT COUNT(*) as count FROM rental_items').get().count;
  if (countRentals === 0) {
    const sampleRentals = [
      {
        title: '15 kVA Soundproof Generator Rental (ပွဲလမ်းသဘင် / အိမ်သုံး)',
        capacity_kva: 15,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        daily_rate_lakhs: 1.2,
        monthly_rate_lakhs: 18.0,
        includes_operator: 0,
        includes_transport: 0,
        min_rental_days: 1,
        image: '/images/rental-15kva.svg',
        description: 'မင်္ဂလာဆောင်၊ အလှူပွဲ၊ ယာယီရုံးခန်းများနှင့် အိမ်တွင်းပွဲများအတွက် အသံတိတ် မီးစက်အငှား။ ဆီစားနည်းပြီး ကျစ်လျစ်သည်။'
      },
      {
        title: '25 kVA Silent Generator Rental (စီးပွားရေးဆိုင်ခွဲ / Event)',
        capacity_kva: 25,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        daily_rate_lakhs: 1.8,
        monthly_rate_lakhs: 26.0,
        includes_operator: 0,
        includes_transport: 0,
        min_rental_days: 1,
        image: '/images/rental-25kva.svg',
        description: 'ဖျော်ဖြေပွဲ၊ စတိုးဆိုင်ကြီးများနှင့် ပြပွဲ/စင်တင်ပွဲများအတွက် လိုအပ်သော အသံလုံ မီးစက်။'
      },
      {
        title: '50 kVA Industrial Generator Rental (ဆောက်လုပ်ရေး / စက်ရုံ)',
        capacity_kva: 50,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        daily_rate_lakhs: 2.8,
        monthly_rate_lakhs: 42.0,
        includes_operator: 1,
        includes_transport: 0,
        min_rental_days: 2,
        image: '/images/rental-50kva.svg',
        description: 'Tower Crane, စက်မှုလုပ်ငန်းသုံး စက်များနှင့် ဆောက်လုပ်ရေးဆိုဒ်များအတွက် အချိန်ပြည့် တာဝန်ကျ ကျွမ်းကျင်အော်ပရေတာ အပါအဝင် ငှားရမ်းပေးသည်။'
      },
      {
        title: '100 kVA Heavy Duty Rental (စက်ရုံ / ကုန်တိုက် / Project)',
        capacity_kva: 100,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        daily_rate_lakhs: 4.5,
        monthly_rate_lakhs: 68.0,
        includes_operator: 1,
        includes_transport: 0,
        min_rental_days: 3,
        image: '/images/rental-100kva.svg',
        description: '၂၄ နာရီ မီးမပြတ် မောင်းနှင်နိုင်သော စက်ရုံသုံး မီးစက်ကြီး။ စက်ပိုင်းစစ်ဆေးရေး အင်ဂျင်နီယာ အပါအဝင် ဝန်ဆောင်မှုပေးသည်။'
      },
      {
        title: '200 kVA - 500 kVA Mega Project Power Rental',
        capacity_kva: 250,
        fuel_type: 'Diesel',
        type: 'Soundproof',
        daily_rate_lakhs: 8.5,
        monthly_rate_lakhs: 130.0,
        includes_operator: 1,
        includes_transport: 1,
        min_rental_days: 7,
        image: '/images/rental-250kva.svg',
        description: 'အကြီးစားစက်ရုံကြီးများ၊ ဖျော်ဖြေပွဲကြီးများနှင့် အရေးပေါ် လျှပ်စစ်ဓာတ်အား အပြည့်အဝ ထောက်ပံ့ပေးနိုင်သော High Capacity Rental Units.'
      }
    ];

    const insertRental = db.prepare(`
      INSERT INTO rental_items (
        title, capacity_kva, fuel_type, type, daily_rate_lakhs, monthly_rate_lakhs,
        includes_operator, includes_transport, min_rental_days, image, description
      ) VALUES (
        @title, @capacity_kva, @fuel_type, @type, @daily_rate_lakhs, @monthly_rate_lakhs,
        @includes_operator, @includes_transport, @min_rental_days, @image, @description
      )
    `);

    for (const r of sampleRentals) {
      insertRental.run(r);
    }
    console.log(`✅ Seeded ${sampleRentals.length} generator rental options.`);
  }

  // 5. Seed Sample Customer Submissions (Sell requests & repair tickets)
  const countRepairs = db.prepare('SELECT COUNT(*) as count FROM repair_requests').get().count;
  if (countRepairs === 0) {
    db.prepare(`
      INSERT INTO repair_requests (
        ticket_code, customer_name, customer_phone, customer_address, city,
        generator_brand, generator_capacity_kva, service_type, urgency_level,
        issue_description, status, cost_estimate_mmk, technician_assigned
      ) VALUES (
        'REP-202611-001', 'ဦးမင်းနိုင် (Apex Pharmacy)', '09420011223', 'လမ်းမတော်မြို့နယ်၊ ရန်ကုန်', 'Yangon',
        'Denyo', 45, 'Emergency Breakdown', 'Urgent / Immediate',
        'စက်စတင်နှိုးမရခြင်းနှင့် စက်သံကြမ်းကာ ဆီမီးခိုးမည်းများ ထွက်နေခြင်း။ ဆေးရုံအအေးခန်း မီးမပြတ်ရန် အရေးပေါ်လိုအပ်နေပါသည်။',
        'in_progress', 250000, 'ကိုကျော်ဇင် (Senior Technician)'
      )
    `).run();

    db.prepare(`
      INSERT INTO repair_requests (
        ticket_code, customer_name, customer_phone, customer_address, city,
        generator_brand, generator_capacity_kva, service_type, urgency_level,
        issue_description, status, cost_estimate_mmk, technician_assigned
      ) VALUES (
        'REP-202611-002', 'ဒေါ်သန်းသန်းဆွေ (အောင်မင်္ဂလာ ကုန်မာ)', '0950119988', 'ရွှေပြည်သာ စက်မှုဇုန်', 'Yangon',
        'Cummins', 100, 'Periodic Maintenance', 'Scheduled',
        'နာရီ ၂၅၀ ပြည့် ပုံမှန် maintenance: အင်ဂျင်ဝိုင်၊ ဒီဇယ်ဖီလ်တာ၊ လေဖီလ်တာ လဲလှယ်ရန်နှင့် Coolant စစ်ဆေးရန်။',
        'inspected', 180000, 'ကိုအောင်ကျော် (Field Engineer)'
      )
    `).run();
    console.log('✅ Seeded sample repair tickets.');
  }

  const countSell = db.prepare('SELECT COUNT(*) as count FROM sell_requests').get().count;
  if (countSell === 0) {
    db.prepare(`
      INSERT INTO sell_requests (
        submission_code, seller_name, seller_phone, location, brand, model,
        capacity_kva, fuel_type, running_hours, condition_description,
        expected_price_lakhs, status
      ) VALUES (
        'SELL-202611-101', 'ကိုဝင်းထွန်း (Lucky Garment)', '09254477889', 'လှိုင်သာယာ စက်မှုဇုန် (၁)',
        'Perkins', '1104A-44TG1', 60, 'Diesel', 4200,
        'စက်ရုံတိုးချဲ့ပြီး 200 kVA အသစ်လဲမည်ဖြစ်၍ 60 kVA အဟောင်းကို ရောင်းချလိုပါသည်။ စက်အခြေအနေ ကောင်းမွန်ဆဲဖြစ်ပါသည်။',
        420, 'reviewing'
      )
    `).run();
    console.log('✅ Seeded sample sell submission.');
  }

  console.log('🎉 Database seeding completed successfully!');
}

seed();
