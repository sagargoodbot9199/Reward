let currentCoins = parseInt(localStorage.getItem('savedCoins')) || 0; 
let userData = JSON.parse(localStorage.getItem('appUserData')) || null; 
let transactionHistory = JSON.parse(localStorage.getItem('appHistory')) || [];
let globalWithdrawRequests = JSON.parse(localStorage.getItem('adminWithdrawRequests')) || [];

// फ्री फायर स्पेशल टास्क का डेटा
const ffTask = { id: "free_fire_max", name: "Free Fire MAX (Garena Play Task)", icon: "🔥", reward: 300, time: 120 };

// साधारण गेम्स की लिस्ट
const gamesList = [
    { id: "game_1", name: "लकी स्पिन व्हील (Lucky Spin)", icon: "🎯", reward: 50, time: 60 },
    { id: "game_2", name: "ब्लॉक पहेली (Block Puzzle)", icon: "🧱", reward: 60, time: 60 },
    { id: "game_3", name: "स्पीड कार रेसर (Speed Racer)", icon: "🏎️", reward: 100, time: 60 },
    { id: "game_4", name: "फ्रूट कटर (Fruit Slasher)", icon: "🍉", reward: 55, time: 60 },
    { id: "game_5", name: "बबल शूटर KING (Bubble Shooter)", icon: "🔮", reward: 70, time: 60 },
    { id: "game_6", name: "लूडो एक्सप्रेस (Ludo Express)", icon: "🎲", reward: 120, time: 60 }
];

window.onload = function() {
    initGamesAndFF();
    if (userData) {
        showMainApp();
    } else {
        showAuthScreen('signup');
    }

    document.getElementById('go-to-login').onclick = function() { showAuthScreen('login'); };
    document.getElementById('go-to-signup').onclick = function() { showAuthScreen('signup'); };
};

function showMainApp() {
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('signup-box').style.display = 'none';
    document.getElementById('login-box').style.display = 'none';
    document.getElementById('main-app-layout').style.display = 'flex';
    updateWallet();
}

function showAuthScreen(type) {
    document.getElementById('main-app-layout').style.display = 'none';
    if(type === 'signup') {
        document.getElementById('signup-box').style.display = 'block';
        document.getElementById('login-box').style.display = 'none';
    } else {
        document.getElementById('signup-box').style.display = 'none';
        document.getElementById('login-box').style.display = 'block';
    }
}

function handleSignup() {
    const name = document.getElementById('signup-name').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
    const password = document.getElementById('signup-password').value.trim();

    if(!name || !phone || !password) {
        alert("कृपया सभी डिटेल्स भरें!");
        return;
    }
    if(password.length < 6) {
        alert("पासवर्ड कम से कम 6 अंकों का होना चाहिए!");
        return;
    }

    userData = { name, phone, password };
    localStorage.setItem('appUserData', JSON.stringify(userData));

    currentCoins = 2000; // साइनअप बोनस ₹20
    transactionHistory = [{ details: "वेलकम बोनस (साइनअप)", amount: "+2,000", type: "add", status: "" }];
    localStorage.setItem('appHistory', JSON.stringify(transactionHistory));

    alert("बधाई हो! आपका अकाउंट बन चुका है और ₹20 (2000 Coins) बोनस दे दिया गया है।");
    showMainApp();
}

function handleLogin() {
    const phone = document.getElementById('login-phone').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if(!phone || !password) {
        alert("कृपया मोबाइल नंबर और पासवर्ड दोनों दर्ज करें!");
        return;
    }

    if(userData && userData.phone === phone && userData.password === password) {
        alert(`स्वागत है, ${userData.name}!`);
        showMainApp();
    } else {
        alert("गलत मोबाइल नंबर या पासवर्ड!");
    }
}

function logout() {
    showAuthScreen('login');
}

function initGamesAndFF() {
    // 1. फ्री फायर कंटेनर लोड करें
    const ffContainer = document.getElementById('ff-container');
    if(ffContainer) {
        ffContainer.innerHTML = `
            <div class="app-card" style="border: 2px solid #ea580c; background: #fff7ed;">
                <div class="app-meta">
                    <div class="app-logo">${ffTask.icon}</div>
                    <div class="app-details">
                        <span class="app-title" style="color:#ea580c; font-weight:700;">${ffTask.name}</span>
                        <span class="app-instruction">2 मिनट खेलें = +${ffTask.reward} Coins (₹3)</span>
                    </div>
                </div>
                <button class="action-btn" style="background:#ea580c;" id="btn-${ffTask.id}" onclick="startRealTimer('${ffTask.id}', '${ffTask.name}', ${ffTask.reward}, ${ffTask.time})">फ्री फायर खेलें +${ffTask.reward}</button>
            </div>
        `;
    }

    // 2. बाकी नार्मल गेम्स लोड करें
    const gamesContainer = document.getElementById('games-container');
    if(!gamesContainer) return;
    gamesContainer.innerHTML = "";
    gamesList.forEach((game, idx) => {
        gamesContainer.innerHTML += `
            <div class="app-card">
                <div class="app-meta">
                    <div class="app-logo">${game.icon}</div>
                    <div class="app-details">
                        <span class="app-title">${idx + 1}. ${game.name}</span>
                        <span class="app-instruction">1 मिनट खेलें = +${game.reward} Coins</span>
                    </div>
                </div>
                <button class="action-btn" id="btn-${game.id}" onclick="startRealTimer('${game.id}', '${game.name}', ${game.reward}, ${game.time})">खेलें +${game.reward}</button>
            </div>
        `;
    });
}

// ⏱️ mRewards लाइव काउंटडाउन टाइमर फंक्शन
function startRealTimer(gameId, gameName, rewardAmt, totalSeconds) {
    const targetButton = document.getElementById(`btn-${gameId}`);
    if (!targetButton) return;

    targetButton.disabled = true;
    targetButton.style.background = "#64748b"; 
    
    let timeLeft = totalSeconds;
    targetButton.textContent = `खेलें (${timeLeft}s)`;

    alert(`🎮 ${gameName} टास्क शुरू हो गया है! कॉइन्स पाने के लिए कृपया ऐप स्क्रीन को बंद न करें और टाइमर पूरा होने का इंतजार करें।`);

    const countdown = setInterval(() => {
        timeLeft--;
        targetButton.textContent = `खेलें (${timeLeft}s)`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            
            currentCoins += rewardAmt;
            updateWallet();
            logTransaction(gameName, `+${rewardAmt}`, "add");
            
            targetButton.disabled = false;
            targetButton.style.background = gameId.includes('free_fire') ? "#ea580c" : "#4f46e5";
            targetButton.textContent = gameId.includes('free_fire') ? `फ्री फायर खेलें +${rewardAmt}` : `खेलें +${rewardAmt}`;
            
            alert(`🎉 शानदार! गरीना प्रोमो टास्क पूरा हुआ। आपके वॉलेट में +${rewardAmt} कॉइन्स जोड़ दिए गए हैं।`);
        }
    }, 1000);
}

// 📺 वीडियो एडवरटाइजमेंट टाइमर
function watchVideo(videoName, amt, buttonId, durationSeconds) {
    const targetButton = document.getElementById(buttonId);
    if (!targetButton) return;

    targetButton.disabled = true;
    targetButton.style.background = "#64748b";
    
    let timeLeft = durationSeconds;
    targetButton.textContent = `देखें (${timeLeft}s)`;
    alert(`📺 विज्ञापन लोड हो रहा है... कृपया ${durationSeconds} सेकंड तक पूरा देखें!`);

    const countdown = setInterval(() => {
        timeLeft--;
        targetButton.textContent = `देखें (${timeLeft}s)`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            currentCoins += amt;
            updateWallet();
            logTransaction(videoName, `+${amt}`, "add");
            
            targetButton.disabled = false;
            targetButton.style.background = "#4f46e5";
            targetButton.textContent = `देखें +${amt}`;
            alert("🎉 विज्ञापन पूरा देखा गया! आपको +20 कॉइन्स मिल गए हैं।");
        }
    }, 1000);
}

function switchTab(screenName) {
    document.querySelectorAll('.app-screen').forEach(s => s.style.display = 'none');
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    
    if (screenName === 'admin') {
        document.getElementById('main-wallet-card').style.display = 'none';
        updateAdminPanelUI();
    } else {
        document.getElementById('main-wallet-card').style.display = 'block';
    }

    document.getElementById(`screen-${screenName}`).style.display = 'block';
    if(document.getElementById(`tab-${screenName}`)) {
        document.getElementById(`tab-${screenName}`).classList.add('active');
    }
    if(screenName === 'history') updateHistoryUI();
}

function updateWallet() {
    document.getElementById('coin-balance').textContent = currentCoins.toLocaleString();
    document.getElementById('cash-balance').textContent = (currentCoins / 100).toFixed(2);
    localStorage.setItem('savedCoins', currentCoins);
}

function logTransaction(details, amount, type, status = "") {
    transactionHistory.unshift({ details, amount, type, status });
    localStorage.setItem('appHistory', JSON.stringify(transactionHistory));
}

function updateHistoryUI() {
    const container = document.getElementById('history-container');
    if(!container) return;
    if(transactionHistory.length === 0) {
        container.innerHTML = `<div style="padding:15px; text-align:center; color:#64748b;">कोई ट्रांजैक्शन नहीं है।</div>`;
        return;
    }
    container.innerHTML = "";
    transactionHistory.forEach(item => {
        const styleClass = item.type === 'add' ? 'h-success' : 'h-minus';
        const statusText = item.status ? ` <span style="font-size:11px; padding:2px 6px; background:#f1f5f9; border-radius:4px; color:#475569;">${item.status}</span>` : '';
        container.innerHTML += `
            <div class="history-item">
                <span>${item.details} ${statusText}</span>
                <span class="${styleClass}">${item.amount}</span>
            </div>
        `;
    });
}

function claimDaily() {
    const btn = document.getElementById('daily-btn');
    btn.disabled = true;
    btn.style.background = "#64748b";
    btn.textContent = "क्लेम किया गया";
    
    currentCoins += 100;
    updateWallet();
    logTransaction("डेली चेक-इन रिवॉर्ड", "+100", "add");
    alert("🎉 आपको दैनिक बोनस के +100 कॉइन्स (₹1) मिल गए हैं।");
}

function scratchCard() {
    const reward = Math.floor(Math.random() * 40) + 10;
    currentCoins += reward;
    updateWallet();
    logTransaction("स्क्रैच कार्ड इनाम", `+${reward}`, "add");
    
    const element = document.getElementById('scratch-card-element');
    element.textContent = `🎉 आपने जीता: +${reward} Coins!`;
    element.style.background = "#bbf7d0";
    element.style.color = "#16a34a";
    element.style.pointerEvents = "none";
    
    setTimeout(() => {
        element.textContent = "👋 कार्ड स्क्रैच करने के लिए यहाँ क्लिक करें!";
        element.style.background = "#e0e7ff";
        element.style.color = "#4f46e5";
        element.style.pointerEvents = "auto";
    }, 5000);
}

function handleWithdraw() {
    const method = document.getElementById('payment-method').value;
    const details = document.getElementById('payment-details').value.trim();
    const amount = parseInt(document.getElementById('withdraw-amount').value);

    if(!details || !amount) {
        alert("कृपया विड्रॉल डिटेल्स और अमाउंट दर्ज करें!");
        return;
    }
    if(amount > currentCoins) {
        alert("त्रुटि: आपके वॉलेट में इतने कॉइन्स नहीं हैं!");
        return;
    }
    if(amount < 500) {
        alert("न्यूनतम विड्रॉल सीमा 500 कॉइन्स (₹5) है।");
        return;
    }

    currentCoins -= amount;
    updateWallet();
    logTransaction(`विड्रॉल ट्रांसफर (${method})`, `-${amount}`, "minus", "पेंडिंग");

    const newRequest = {
        id: Date.now(),
        username: userData ? userData.name : "अज्ञात यूजर",
        userphone: userData ? userData.phone : "0000000000",
        method: method,
        details: details,
        amount: amount,
        status: "पेंडिंग"
    };
    globalWithdrawRequests.push(newRequest);
    localStorage.setItem('adminWithdrawRequests', JSON.stringify(globalWithdrawRequests));

    alert(`💰 विड्रॉल रिक्वेस्ट एडमिन पैनल में भेज दी गई है।`);
    document.getElementById('withdraw-amount').value = '';
    document.getElementById('payment-details').value = '';
    switchTab('tasks');
}

function updateAdminPanelUI() {
    document.getElementById('admin-total-users').textContent = userData ? "1" : "0";
    const container = document.getElementById('admin-requests-container');
    if(!container) return;
    
    if (globalWithdrawRequests.length === 0) {
        container.innerHTML = `<div style="padding:15px; text-align:center; color:#64748b; font-size:13px;">अभी कोई विड्रॉल रिक्वेस्ट नहीं है।</div>`;
        return;
    }

    container.innerHTML = "";
    globalWithdrawRequests.forEach((req) => {
        const statusColor = req.status === 'पेंडिंग' ? '#ca8a04' : '#16a34a';
        container.innerHTML += `
            <div class="admin-card">
                <strong>👤 यूजर:</strong> ${req.username}<br>
                <strong>💳 माध्यम:</strong> ${req.method}<br>
                <strong>📌 डिटेल्स:</strong> ${req.details}<br>
                <strong>💰 रकम:</strong> ${req.amount} Coins<br>
                <strong>⏳ स्टेटस:</strong> <span style="color:${statusColor};">${req.status}</span><br>
                ${req.status === 'पेंडिंग' ? `<button class="status-btn" style="background:#28a745; color:white;" onclick="approveRequest(${req.id})">✅ सफल मार्क करें</button>` : ''}
            </div>
        `;
    });
}

function approveRequest(reqId) {
    globalWithdrawRequests = globalWithdrawRequests.map(req => {
        if (req.id === reqId) req.status = "सफल (Success)";
        return req;
    });
    localStorage.setItem('adminWithdrawRequests', JSON.stringify(globalWithdrawRequests));
    
    transactionHistory = transactionHistory.map(item => {
        if (item.type === 'minus' && item.status === 'पेंडिंग') item.status = "सफल";
        return item;
    });
    localStorage.setItem('appHistory', JSON.stringify(transactionHistory));

    alert("रिक्वेस्ट को सफलतापूर्वक 'सफल' मार्क कर दिया गया है!");
    updateAdminPanelUI();
}