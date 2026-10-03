// ==========================================
// 1. تنظيف النص وتوحيده لمنع التكرار والأخطاء الإملائية
// ==========================================
function normalizeText(str) {
    if (!str) return "";
    return str.toString()
        .trim()
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/\s+/g, " ");
}

// ==========================================
// 2. إدارة وقراءة بيانات المخزن
// ==========================================
function getStockData() {
    return JSON.parse(localStorage.getItem('app_stock')) || [];
}

function saveStockData(stock) {
    localStorage.setItem('app_stock', JSON.stringify(stock));
}

// تعبئة تنبؤات الخانة الأولى (الصنف الأساسي)
function populateMainCategoryDatalist(datalistId) {
    const stock = getStockData();
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;
    
    const categories = [...new Set(stock.map(item => item.category))];
    datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
}

// تعبئة تنبؤات الخانة الثانية (النوع/الماركة) بناءً على الصنف المختار
function populateSubCategoryDatalist(categoryValue, datalistId) {
    const stock = getStockData();
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;

    const normCat = normalizeText(categoryValue);
    const filteredTypes = [...new Set(
        stock.filter(item => normalizeText(item.category) === normCat)
             .map(item => item.type)
    )];

    datalist.innerHTML = filteredTypes.map(type => `<option value="${type}">`).join('');
}

// تعبئة تنبؤات الخانة الثالثة (الحجم/المواصفة) بناءً على الصنف والنوع
function populateSizeDatalist(categoryValue, typeValue, datalistId) {
    const stock = getStockData();
    const datalist = document.getElementById(datalistId);
    if (!datalist) return;

    const normCat = normalizeText(categoryValue);
    const normType = normalizeText(typeValue);

    const filteredSizes = [...new Set(
        stock.filter(item => normalizeText(item.category) === normCat && normalizeText(item.type) === normType)
             .map(item => item.size)
    )];

    datalist.innerHTML = filteredSizes.map(size => `<option value="${size}">`).join('');
}

// ==========================================
// 3. إضافة أو تحديث الصنف بالمخزن (3 خانات)
// ==========================================
function updateOrAddToStock(category, type, size, qty, buyPrice, sellPrice = 0) {
    let stock = getStockData();
    const normCat = normalizeText(category);
    const normType = normalizeText(type);
    const normSize = normalizeText(size);

    const existingIndex = stock.findIndex(item => 
        normalizeText(item.category) === normCat &&
        normalizeText(item.type) === normType &&
        normalizeText(item.size) === normSize
    );

    if (existingIndex !== -1) {
        // تحديث الصنف الحالي
        stock[existingIndex].quantity = (parseFloat(stock[existingIndex].quantity) || 0) + parseFloat(qty);
        stock[existingIndex].buyPrice = parseFloat(buyPrice);
        if (sellPrice > 0) stock[existingIndex].sellPrice = parseFloat(sellPrice);
    } else {
        // إضافة صنف جديد
        stock.push({
            id: 'PROD_' + Date.now() + Math.random().toString(36).substr(2, 4),
            category: category.trim(),
            type: type.trim(),
            size: size.trim(),
            quantity: parseFloat(qty),
            buyPrice: parseFloat(buyPrice),
            sellPrice: parseFloat(sellPrice),
            minLimit: 5
        });
    }

    saveStockData(stock);
}

// ==========================================
// 4. الحركة المالية والخزينة التلقائية
// ==========================================
function updateTreasury(amount, type, note) {
    let balance = parseFloat(localStorage.getItem('treasury_balance')) || 0;
    let transactions = JSON.parse(localStorage.getItem('treasury_transactions')) || [];

    if (type === 'in') {
        balance += parseFloat(amount);
    } else if (type === 'out') {
        balance -= parseFloat(amount);
    }

    transactions.push({
        id: Date.now(),
        date: new Date().toLocaleString('ar-EG'),
        amount: parseFloat(amount),
        type: type,
        note: note
    });

    localStorage.setItem('treasury_balance', balance.toFixed(2));
    localStorage.setItem('treasury_transactions', JSON.stringify(transactions));
}
