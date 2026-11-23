const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/generators - Public search & filter
router.get('/', (req, res) => {
  try {
    const {
      brand,
      min_kva,
      max_kva,
      min_price,
      max_price,
      type,
      condition,
      status,
      search,
      featured,
      sort
    } = req.query;

    let query = 'SELECT * FROM generators WHERE 1=1';
    const params = [];

    // Filter by status (default available for public unless admin specifies)
    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (brand && brand !== 'all') {
      query += ' AND LOWER(brand) = LOWER(?)';
      params.push(brand);
    }

    if (type && type !== 'all') {
      query += ' AND LOWER(type) = LOWER(?)';
      params.push(type);
    }

    if (condition && condition !== 'all') {
      query += ' AND condition LIKE ?';
      params.push(`%${condition}%`);
    }

    if (min_kva) {
      query += ' AND capacity_kva >= ?';
      params.push(Number(min_kva));
    }

    if (max_kva) {
      query += ' AND capacity_kva <= ?';
      params.push(Number(max_kva));
    }

    if (min_price) {
      query += ' AND price_lakhs >= ?';
      params.push(Number(min_price));
    }

    if (max_price) {
      query += ' AND price_lakhs <= ?';
      params.push(Number(max_price));
    }

    if (featured === '1' || featured === 'true') {
      query += ' AND featured = 1';
    }

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR brand LIKE ? OR model LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price_lakhs ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price_lakhs DESC';
        break;
      case 'kva_asc':
        query += ' ORDER BY capacity_kva ASC';
        break;
      case 'kva_desc':
        query += ' ORDER BY capacity_kva DESC';
        break;
      case 'hours_asc':
        query += ' ORDER BY running_hours ASC';
        break;
      case 'newest':
      default:
        query += ' ORDER BY id DESC';
        break;
    }

    const generators = db.prepare(query).all(...params);

    // Parse JSON fields
    const parsed = generators.map(g => {
      let images = [];
      let specs = {};
      try {
        images = g.images ? JSON.parse(g.images) : [];
      } catch (e) {
        images = g.images ? [g.images] : [];
      }
      try {
        specs = g.specifications ? JSON.parse(g.specifications) : {};
      } catch (e) {
        specs = {};
      }
      return {
        ...g,
        images,
        specifications: specs
      };
    });

    res.json({
      success: true,
      count: parsed.length,
      data: parsed
    });
  } catch (err) {
    console.error('Error fetching generators:', err);
    res.status(500).json({ success: false, error: 'မီးစက်များ ဖော်ပြရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// GET /api/generators/:id - Details
router.get('/:id', (req, res) => {
  try {
    const generator = db.prepare('SELECT * FROM generators WHERE id = ?').get(req.params.id);
    if (!generator) {
      return res.status(404).json({ success: false, error: 'မီးစက်အချက်အလက် ရှာမတွေ့ပါ' });
    }

    let images = [];
    let specs = {};
    try {
      images = generator.images ? JSON.parse(generator.images) : [];
    } catch (e) {
      images = generator.images ? [generator.images] : [];
    }
    try {
      specs = generator.specifications ? JSON.parse(generator.specifications) : {};
    } catch (e) {
      specs = {};
    }

    res.json({
      success: true,
      data: {
        ...generator,
        images,
        specifications: specs
      }
    });
  } catch (err) {
    console.error('Error fetching generator:', err);
    res.status(500).json({ success: false, error: 'အချက်အလက် ရယူရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// POST /api/generators - Admin Create Generator
router.post('/', authMiddleware, upload.array('photos', 6), (req, res) => {
  try {
    const {
      title,
      brand,
      model,
      capacity_kva,
      power_kw,
      fuel_type,
      type,
      phase,
      engine_model,
      alternator_brand,
      condition,
      running_hours,
      year_manufactured,
      price_lakhs,
      is_negotiable,
      warranty_months,
      location,
      featured,
      status,
      description,
      specifications,
      existing_images
    } = req.body;

    if (!title || !brand || !capacity_kva || !price_lakhs) {
      return res.status(400).json({ success: false, error: 'အမည်၊ တံဆိပ်၊ kVA ပါဝါ နှင့် ဈေးနှုန်း ထည့်သွင်းပေးရန် လိုအပ်ပါသည်' });
    }

    // Process uploaded images
    let imageList = [];
    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map(f => `/uploads/${f.filename}`);
      imageList = imageList.concat(uploadedUrls);
    }
    if (existing_images) {
      try {
        const parsed = JSON.parse(existing_images);
        if (Array.isArray(parsed)) imageList = imageList.concat(parsed);
      } catch (e) {
        if (typeof existing_images === 'string') imageList.push(existing_images);
      }
    }
    if (imageList.length === 0) {
      // Default placeholder based on brand
      imageList = ['/images/denyo-25kva.svg'];
    }

    const priceMmk = Math.round(Number(price_lakhs) * 100000);

    const stmt = db.prepare(`
      INSERT INTO generators (
        title, brand, model, capacity_kva, power_kw, fuel_type, type, phase,
        engine_model, alternator_brand, condition, running_hours, year_manufactured,
        price_lakhs, price_mmk, is_negotiable, warranty_months, location,
        images, featured, status, description, specifications
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?
      )
    `);

    const result = stmt.run(
      title,
      brand,
      model || '',
      Number(capacity_kva),
      power_kw ? Number(power_kw) : Number(capacity_kva) * 0.8,
      fuel_type || 'Diesel',
      type || 'Soundproof',
      phase || '3-Phase',
      engine_model || '',
      alternator_brand || '',
      condition || 'Used Good Running',
      running_hours ? Number(running_hours) : 0,
      year_manufactured ? Number(year_manufactured) : null,
      Number(price_lakhs),
      priceMmk,
      is_negotiable === '0' || is_negotiable === 0 ? 0 : 1,
      warranty_months ? Number(warranty_months) : 6,
      location || 'Yangon',
      JSON.stringify(imageList),
      featured === '1' || featured === 1 ? 1 : 0,
      status || 'available',
      description || '',
      typeof specifications === 'string' ? specifications : JSON.stringify(specifications || {})
    );

    res.json({
      success: true,
      message: 'မီးစက်စာရင်း အသစ်ကို အောင်မြင်စွာ ထည့်သွင်းပြီးပါပြီ',
      id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Error adding generator:', err);
    res.status(500).json({ success: false, error: 'မီးစက်ထည့်သွင်းရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// PUT /api/generators/:id - Admin Update Generator
router.put('/:id', authMiddleware, upload.array('photos', 6), (req, res) => {
  try {
    const id = req.params.id;
    const current = db.prepare('SELECT * FROM generators WHERE id = ?').get(id);
    if (!current) {
      return res.status(404).json({ success: false, error: 'မီးစက် ရှာမတွေ့ပါ' });
    }

    const {
      title,
      brand,
      model,
      capacity_kva,
      power_kw,
      fuel_type,
      type,
      phase,
      engine_model,
      alternator_brand,
      condition,
      running_hours,
      year_manufactured,
      price_lakhs,
      is_negotiable,
      warranty_months,
      location,
      featured,
      status,
      description,
      specifications,
      existing_images
    } = req.body;

    let imageList = [];
    if (existing_images) {
      try {
        const parsed = JSON.parse(existing_images);
        if (Array.isArray(parsed)) imageList = parsed;
      } catch (e) {
        if (typeof existing_images === 'string') imageList.push(existing_images);
      }
    } else {
      try {
        imageList = JSON.parse(current.images || '[]');
      } catch (e) {
        imageList = [];
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadedUrls = req.files.map(f => `/uploads/${f.filename}`);
      imageList = imageList.concat(uploadedUrls);
    }

    const priceMmk = price_lakhs ? Math.round(Number(price_lakhs) * 100000) : current.price_mmk;

    const stmt = db.prepare(`
      UPDATE generators SET
        title = ?, brand = ?, model = ?, capacity_kva = ?, power_kw = ?, fuel_type = ?,
        type = ?, phase = ?, engine_model = ?, alternator_brand = ?, condition = ?,
        running_hours = ?, year_manufactured = ?, price_lakhs = ?, price_mmk = ?,
        is_negotiable = ?, warranty_months = ?, location = ?, images = ?, featured = ?,
        status = ?, description = ?, specifications = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      title || current.title,
      brand || current.brand,
      model !== undefined ? model : current.model,
      capacity_kva !== undefined ? Number(capacity_kva) : current.capacity_kva,
      power_kw !== undefined ? Number(power_kw) : current.power_kw,
      fuel_type || current.fuel_type,
      type || current.type,
      phase || current.phase,
      engine_model !== undefined ? engine_model : current.engine_model,
      alternator_brand !== undefined ? alternator_brand : current.alternator_brand,
      condition || current.condition,
      running_hours !== undefined ? Number(running_hours) : current.running_hours,
      year_manufactured !== undefined ? Number(year_manufactured) : current.year_manufactured,
      price_lakhs !== undefined ? Number(price_lakhs) : current.price_lakhs,
      priceMmk,
      is_negotiable !== undefined ? (Number(is_negotiable) ? 1 : 0) : current.is_negotiable,
      warranty_months !== undefined ? Number(warranty_months) : current.warranty_months,
      location || current.location,
      JSON.stringify(imageList),
      featured !== undefined ? (Number(featured) ? 1 : 0) : current.featured,
      status || current.status,
      description !== undefined ? description : current.description,
      typeof specifications === 'string' ? specifications : (specifications ? JSON.stringify(specifications) : current.specifications),
      id
    );

    res.json({ success: true, message: 'မီးစက်အချက်အလက်ကို အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီ' });
  } catch (err) {
    console.error('Error updating generator:', err);
    res.status(500).json({ success: false, error: 'ပြင်ဆင်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// DELETE /api/generators/:id - Admin Delete Generator
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM generators WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'မီးစက် ရှာမတွေ့ပါ' });
    }
    res.json({ success: true, message: 'မီးစက်ကို စာရင်းမှ ဖျက်ပစ်ပြီးပါပြီ' });
  } catch (err) {
    console.error('Error deleting generator:', err);
    res.status(500).json({ success: false, error: 'ဖျက်ပစ်ရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

// PATCH /api/generators/:id/status - Admin quick status change
router.patch('/:id/status', authMiddleware, (req, res) => {
  try {
    const { status } = req.body;
    if (!['available', 'reserved', 'sold'].includes(status)) {
      return res.status(400).json({ success: false, error: 'မမှန်ကန်သော Status ဖြစ်ပါသည်' });
    }
    db.prepare('UPDATE generators SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, message: 'Status ပြောင်းလဲပြီးပါပြီ' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Status ပြောင်းလဲရာတွင် အမှားဖြစ်ပေါ်နေပါသည်' });
  }
});

module.exports = router;
