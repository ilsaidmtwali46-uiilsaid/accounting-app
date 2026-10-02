// ==========================================
// 1. إعدادات Firebase والتحكم والتفعيل
// ==========================================

const FIREBASE_DB_URL = "https://pos-system-f3265-default-rtdb.firebaseio.com";
const SUPPORT_PHONE = "201115197980"; // 👈 استبدل الرقم برقم الواتساب الخاص بك (بالكود الدولي بدون +)

// توليد أو جلب معرف الجهاز الفريد (Device ID)
function getDeviceId() {
    let devId = localStorage.getItem('APP_DEVICE_ID');
    if (!devId) {
        devId = 'DEV-' + Math.floor(100000 + Math.random() * 900000);
        localStorage.setItem('APP_DEVICE_ID', devId);
    }
    return devId;
}

// فحص حالة تفعيل الجهاز من Firebase
async function checkLicenseStatus() {
    const devId = getDeviceId();

    if (!navigator.onLine) {
        const localExpire = localStorage.getItem('LICENSE_EXPIRE');
        if (localExpire && new Date().getTime() < parseInt(localExpire)) {
            return { active: true, deviceId: devId };
        } else {
            return { active: false, deviceId: devId, reason: 'يتطلب الاتصال بالإنترنت لتأكيد التفعيل!' };
        }
    }

    try {
        const response = await fetch(`${FIREBASE_DB_URL}/devices/${devId}.json`);
        const data = await response.json();

        if (data && data.active) {
            const now = new Date().getTime();
            if (data.expireDate && now > data.expireDate) {
                return { active: false, deviceId: devId, reason: 'انتهت فترة اشتراك هذا الجهاز!' };
            }
            localStorage.setItem('LICENSE_EXPIRE', data.expireDate || (now + 86400000 * 30));
            return { active: true, deviceId: devId };
        } else {
            return { active: false, deviceId: devId, reason: 'هذا الجهاز غير مفعل على النظام!' };
        }
    } catch (e) {
        return { active: true, deviceId: devId };
    }
}

// جلب نص الشريط الدعائي ديناميكياً من Firebase
async function loadPromoText() {
    try {
        if (navigator.onLine) {
            const res = await fetch(`${FIREBASE_DB_URL}/settings/promoText.json`);
            const text = await res.json();
            if (text) {
                localStorage.setItem('CACHE_PROMO_TEXT', text);
                return text;
            }
        }
    } catch (e) {
        console.log('Error loading promo text online');
    }
    // النص المحفوظ محلياً أو النص الافتراضي
    return localStorage.getItem('CACHE_PROMO_TEXT') || "🚀 تصاميم وبرمجيات الأنظمة المحاسبية المتكاملة | للتفعيل والاستفسارات تواصل معنا عبر الواتساب";
}

// ==========================================
// 2. إدارة قاعدة البيانات المحلية (LocalStorage)
// ==========================================

const DB_KEY = 'ACCOUNTING_DB';

function loadDB() {
    const dataStr = localStorage.getItem(DB_KEY);
    if (!dataStr) {
        const defaultDB = {
            transactions: [],
            purchasesList: [],
            salesList: [],
            suppliersDebts: {},
            customersDebts: {},
            inventorySystem: {},
            stockList: []
        };
        localStorage.setItem(DB_KEY, JSON.stringify(defaultDB));
        return defaultDB;
    }
    return JSON.parse(dataStr);
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getBalance(db) {
    let totalIn = 0, totalOut = 0;
    if (db.transactions) {
        db.transactions.forEach(t => {
            if (t.type === 'IN') totalIn += (t.amount || 0);
            if (t.type === 'OUT') totalOut += (t.amount || 0);
        });
    }
    return totalIn - totalOut;
}

function isValidEgyptianPhone(phone) {
    const regex = /^01[0125][0-9]{8}$/;
    return regex.test(phone);
}

// ==========================================
// 3. القفل الكامل للبرنامج وعرض الشريط الدعائي
// ==========================================

async function checkAuth() {
    const devId = getDeviceId();
    const license = await checkLicenseStatus();
    const promoText = await loadPromoText();

    // 1. إنشاء وإضافة الشريط الدعائي المتحرك في أعلى الشاشة
    let adBanner = document.getElementById('adBanner');
    if (!adBanner) {
        adBanner = document.createElement('div');
        adBanner.id = 'adBanner';
        adBanner.className = 'no-print';
        adBanner.style.cssText = "background: #0f172a; color: #f8fafc; padding: 6px; font-size: 12px; overflow: hidden; white-space: nowrap; border-bottom: 2px solid #0284c7;";
        document.body.insertBefore(adBanner, document.body.firstChild);
    }
    adBanner.innerHTML = `<marquee behavior="scroll" direction="right" scrollamount="5">${promoText} | كود جهازك: ${devId}</marquee>`;

    // 2. في حالة عدم التفعيل: قفل الواجهة وإخفاء كافة محتويات التطبيق
    if (!license.active) {
        const mainElements = document.querySelectorAll('body > *:not(#adBanner)');
        mainElements.forEach(el => el.style.display = 'none');

        const lockCard = document.createElement('div');
        lockCard.className = 'card no-print';
        lockCard.style.cssText = "margin: 20px auto; max-width: 400px; text-align: center; border: 2px solid #ef4444; background: #fff5f5; padding: 20px; border-radius: 12px;";
        
        const whatsappMsg = encodeURIComponent(`السلام عليكم، أرغب في تفعيل البرمجية المحاسبية لجهازي بكود: ${devId}`);
        const whatsappLink = `https://wa.me/${SUPPORT_PHONE}?text=${whatsappMsg}`;

        lockCard.innerHTML = `
            <h2 style="color: #dc2626; margin-bottom: 10px;">🚫 النسخة غير مفعلة</h2>
            <p style="color: #7f1d1d; font-size: 13px; margin-bottom: 15px;">${license.reason}</p>
            
            <div style="background: #ffffff; border: 1px dashed #f87171; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                <small style="color: #64748b; display: block;">كود التفعيل الخاص بجهازك:</small>
                <strong style="font-size: 20px; color: #b91c1c; font-family: monospace; direction: ltr; display: inline-block;">${devId}</strong>
            </div>

            <a href="${whatsappLink}" target="_blank" style="text-decoration: none;">
                <button style="background: #25d366; color: white; padding: 12px; font-size: 14px; border-radius: 8px; border: none; font-weight: bold; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;">
                    💬 تواصل عبر الواتساب لتفعيل النسخة
                </button>
            </a>
        `;
        document.body.appendChild(lockCard);
        return false;
    }

    // 3. التحقق من كلمة السر المحلية للتطبيق (إن وجدت)
    const db = loadDB();
    if (db.appPassword) {
        const loggedIn = sessionStorage.getItem('IS_LOGGED_IN');
        if (!loggedIn) {
            const pass = prompt('🔒 أدخل كلمة السر للدخول للنظام:');
            if (pass === db.appPassword) {
                sessionStorage.setItem('IS_LOGGED_IN', 'true');
            } else {
                alert('❌ كلمة السر غير صحيحة!');
                window.location.href = 'about:blank';
                return false;
            }
        }
    }
    return true;
}
