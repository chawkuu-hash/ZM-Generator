const http = require('http');

async function runTests() {
  console.log('🧪 Starting automated API and server tests...');

  // Start the server internally
  const app = require('../server.js');
  // Wait 1 second for port to bind
  await new Promise(r => setTimeout(r, 1000));

  const BASE = 'http://localhost:3000';

  async function req(url, options = {}) {
    const res = await fetch(`${BASE}${url}`, options);
    const json = await res.json().catch(() => null);
    return { status: res.status, headers: res.headers, data: json };
  }

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Health test
  const health = await req('/api/health');
  assert(health.status === 200 && health.data.status === 'ok', 'Health Check Endpoint (/api/health)');

  // 2. Generators Public API
  const gens = await req('/api/generators');
  assert(gens.status === 200 && gens.data.count > 0, `Generators Listing (Found ${gens.data?.count} items)`);

  const denyoFilter = await req('/api/generators?brand=Denyo');
  assert(denyoFilter.status === 200 && denyoFilter.data.data.every(g => g.brand.toLowerCase() === 'denyo'), 'Brand Filter (brand=Denyo)');

  const kvaFilter = await req('/api/generators?min_kva=20&max_kva=50');
  assert(kvaFilter.status === 200 && kvaFilter.data.data.every(g => g.capacity_kva >= 20 && g.capacity_kva <= 50), 'kVA Capacity Filter (20-50 kVA)');

  // 3. Single Generator Detail
  const singleGen = await req(`/api/generators/${gens.data.data[0].id}`);
  assert(singleGen.status === 200 && singleGen.data.data.title, 'Single Generator Detail (/api/generators/:id)');

  // 4. Rentals API
  const rentals = await req('/api/rentals');
  assert(rentals.status === 200 && rentals.data.data.length > 0, 'Rentals Catalog (/api/rentals)');

  // 5. Submit Rental Booking
  const bookRes = await req('/api/rentals/book', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rental_item_id: rentals.data.data[0].id,
      customer_name: 'Test Customer Aung',
      customer_phone: '09999111222',
      start_date: '2026-12-01',
      end_date: '2026-12-05',
      delivery_address: 'လှိုင်သာယာ စက်မှုဇုန် (၁)',
      rental_purpose: 'Construction',
      operator_needed: 1
    })
  });
  assert(bookRes.status === 200 && bookRes.data.booking_code, `Rental Booking Submission (${bookRes.data?.booking_code})`);

  // 6. Submit Repair Service Ticket
  const repairRes = await req('/api/repairs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_name: 'ဦးမောင်မောင်',
      customer_phone: '09888222111',
      customer_address: 'ရွှေပြည်သာ စက်မှုဇုန်',
      generator_brand: 'Denyo',
      generator_capacity_kva: 45,
      service_type: 'Emergency Breakdown',
      urgency_level: 'Urgent / Immediate',
      issue_description: 'စက်နှိုးမရခြင်းနှင့် အသံကြမ်းနေခြင်း'
    })
  });
  assert(repairRes.status === 200 && repairRes.data.ticket_code, `Repair Request Submission (${repairRes.data?.ticket_code})`);

  // 7. Submit Sell Request
  const sellRes = await req('/api/sell', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seller_name: 'ဒေါ်လှလှ',
      seller_phone: '09777333444',
      location: 'ဒဂုံတောင် စက်မှုဇုန်',
      brand: 'Airman',
      model: 'SDG-45S',
      capacity_kva: 45,
      running_hours: 4500,
      condition_description: 'အင်ဂျင်ကောင်း၊ Original ဆေးသား',
      expected_price_lakhs: 380
    })
  });
  assert(sellRes.status === 200 && sellRes.data.submission_code, `Sell Generator Submission (${sellRes.data?.submission_code})`);

  // 8. Submit Buy Inquiry / Order
  const orderRes = await req('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      generator_id: gens.data.data[0].id,
      customer_name: 'ဦးသိန်းဟန်',
      customer_phone: '09555666777',
      delivery_address: 'မန္တလေးမြို့',
      message: 'မန္တလေးသို့ ကားဂိတ်ဖြင့် ပို့ဆောင်ပေးနိုင်ပါသလား'
    })
  });
  assert(orderRes.status === 200 && orderRes.data.order_code, `Order Purchase Inquiry Submission (${orderRes.data?.order_code})`);

  // 9. Status Tracking Lookup
  const trackRepair = await req(`/api/track/${repairRes.data.ticket_code}`);
  assert(trackRepair.status === 200 && trackRepair.data.data.length > 0, `Tracking Lookup by Ticket Code (${repairRes.data.ticket_code})`);

  const trackByPhone = await req('/api/track/09999111222');
  assert(trackByPhone.status === 200 && trackByPhone.data.data.length > 0, 'Tracking Lookup by Phone Number (09999111222)');

  // 10. Admin Authentication
  const loginRes = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'wrong_password'
    })
  });
  assert(loginRes.status === 401, 'Admin Login Rejection on Wrong Password');

  const validLogin = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: 'admin123'
    })
  });
  assert(validLogin.status === 200 && validLogin.data.token, 'Admin Login Success (admin / admin123)');

  // 11. Authenticated Dashboard Stats
  const authHeaders = {
    'Authorization': `Bearer ${validLogin.data.token}`
  };
  const statsRes = await req('/api/stats/dashboard', { headers: authHeaders });
  assert(statsRes.status === 200 && statsRes.data.metrics.generators.total >= 8, 'Admin Dashboard Metrics Retrieval');

  // 12. Settings Public API
  const settingsRes = await req('/api/settings');
  assert(settingsRes.status === 200 && settingsRes.data.data.phone_primary, 'Company Settings Retrieval');

  console.log(`\n🏁 Test Results: ${passed} Passed, ${failed} Failed.`);

  if (failed === 0) {
    console.log('✨ All system tests passed with flying colors!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
