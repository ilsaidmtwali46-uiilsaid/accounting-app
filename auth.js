// ==========================================
// نظام حماية الشاشات بكلمات مرور منفصلة
// ==========================================

function checkScreenAccess(screenKey, screenTitle) {
    const savedPin = localStorage.getItem(`pin_${screenKey}`);
    
    // إذا لم يتم تعيين كلمة مرور لهذه الشاشة من قبل
    if (!savedPin) {
        let newPin = prompt(`مرحباً! لم يتم تعيين كلمة مرور لقسم (${screenTitle}) بعد.\nأدخل كلمة مرور جديدة لحماية هذا القسم:`);
        if (newPin && newPin.trim() !== "") {
            localStorage.setItem(`pin_${screenKey}`, newPin.trim());
            alert("تم حفظ كلمة المرور لهذا القسم بنجاح!");
            return true;
        } else {
            alert("عذراً، لا يمكن الدخول بدون تعيين كلمة مرور!");
            window.location.href = "index.html";
            return false;
        }
    }

    // طلب كلمة المرور عند الدخول
    let inputPin = prompt(`🔒 قسم محمي: (${screenTitle})\nأدخل كلمة المرور للدخول:`);
    if (inputPin === savedPin) {
        return true;
    } else {
        alert("❌ كلمة المرور غير صحيحة!");
        window.location.href = "index.html";
        return false;
    }
}
