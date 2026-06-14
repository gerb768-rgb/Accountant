// === نظام محاسبي مع localStorage ===

// مفتاح التخزين في localStorage
const STORAGE_KEY = "accounting_app_data";

// مصفوفة المعاملات
let transactions = [];

// عناصر DOM
const balanceEl = document.getElementById("balanceAmount");
const transactionsListEl = document.getElementById("transactionsList");
const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const typeSelect = document.getElementById("type");
const addBtn = document.getElementById("addBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const currentDateEl = document.getElementById("currentDate");

// عرض التاريخ الحالي
function displayCurrentDate() {
    const now = new Date();
    const formatted = now.toLocaleDateString("ar-EG", { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    currentDateEl.textContent = formatted;
}

// تحميل البيانات من localStorage
function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            transactions = JSON.parse(stored);
        } catch(e) {
            transactions = [];
        }
    } else {
        // بيانات افتراضية نموذجية (اختيارية)
        transactions = [];
    }
}

// حفظ البيانات إلى localStorage
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

// حساب الرصيد الحالي (الإيرادات - المصروفات)
function calculateBalance() {
    let balance = 0;
    for (let t of transactions) {
        if (t.type === "income") {
            balance += t.amount;
        } else {
            balance -= t.amount;
        }
    }
    return balance;
}

// تحديث عرض الرصيد في الواجهة
function updateBalanceUI() {
    const balance = calculateBalance();
    balanceEl.textContent = balance.toFixed(2) + " ج.م";
    // تغيير لون الرصيد
    if (balance >= 0) {
        balanceEl.style.color = "#d4e6ff";
    } else {
        balanceEl.style.color = "#ffc9c9";
    }
}

// إضافة معاملة جديدة
function addTransaction(description, amount, type) {
    if (!description.trim()) {
        alert("الرجاء إدخال وصف للمعاملة");
        return false;
    }
    if (isNaN(amount) || amount <= 0) {
        alert("الرجاء إدخال مبلغ صحيح أكبر من صفر");
        return false;
    }
    
    const newTransaction = {
        id: Date.now(), // معرف فريد
        description: description.trim(),
        amount: parseFloat(amount),
        type: type, // "income" أو "expense"
        date: new Date().toLocaleString("ar-EG")
    };
    transactions.push(newTransaction);
    saveToStorage();
    renderTransactions();
    updateBalanceUI();
    return true;
}

// حذف معاملة حسب المعرف
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveToStorage();
    renderTransactions();
    updateBalanceUI();
}

// مسح جميع المعاملات
function clearAllTransactions() {
    if (transactions.length === 0) return;
    const confirmClear = confirm("هل أنت متأكد من مسح جميع المعاملات؟ لا يمكن التراجع.");
    if (confirmClear) {
        transactions = [];
        saveToStorage();
        renderTransactions();
        updateBalanceUI();
    }
}

// عرض قائمة المعاملات في HTML
function renderTransactions() {
    if (transactions.length === 0) {
        transactionsListEl.innerHTML = '<div class="empty-msg">✨ لا توجد معاملات، أضف معاملة جديدة ✨</div>';
        return;
    }
    
    // ترتيب تنازلي حسب الأحدث أولاً
    const sorted = [...transactions].reverse();
    
    let html = "";
    for (let t of sorted) {
        const amountClass = t.type === "income" ? "income-amount" : "expense-amount";
        const sign = t.type === "income" ? "+ " : "- ";
        html += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-desc">${escapeHtml(t.description)}</div>
                    <div class="transaction-date">📅 ${t.date}</div>
                </div>
                <div class="transaction-amount ${amountClass}">
                    ${sign}${t.amount.toFixed(2)} ج.م
                </div>
                <button class="delete-btn" data-id="${t.id}">🗑️</button>
            </div>
        `;
    }
    transactionsListEl.innerHTML = html;
    
    // ربط أحداث الحذف لكل زر
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(btn.getAttribute("data-id"));
            deleteTransaction(id);
        });
    });
}

// دالة بسيطة لمنع XSS
function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === "&") return "&amp;";
        if (m === "<") return "&lt;";
        if (m === ">") return "&gt;";
        return m;
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    addBtn.addEventListener("click", () => {
        const desc = descInput.value;
        const amount = amountInput.value;
        const type = typeSelect.value;
        if (addTransaction(desc, amount, type)) {
            // تنظيف الحقول بعد الإضافة الناجحة
            descInput.value = "";
            amountInput.value = "";
            typeSelect.value = "income";
            descInput.focus();
        }
    });
    
    clearAllBtn.addEventListener("click", clearAllTransactions);
    
    // السماح بإضافة معاملة بالضغط على Enter في حقل المبلغ
    amountInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            addBtn.click();
        }
    });
    descInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            amountInput.focus();
        }
    });
}

// تهيئة التطبيق
function init() {
    displayCurrentDate();
    loadFromStorage();
    updateBalanceUI();
    renderTransactions();
    setupEventListeners();
}

// بدء التشغيل
init();
