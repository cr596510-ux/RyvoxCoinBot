<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZAKSH Mini App</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <style>
        body {
            background-color: #0b0f19;
            color: #ffffff;
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .header { display: flex; align-items: center; width: 100%; margin-bottom: 30px; }
        .avatar { width: 50px; height: 50px; border-radius: 50%; background: #333; margin-right: 15px; }
        .info h3 { margin: 0; }
        .balance-box {
            background: linear-gradient(135deg, #1e3a8a, #6d28d9);
            padding: 20px;
            border-radius: 15px;
            width: 100%;
            text-align: center;
            margin-bottom: 20px;
            box-shadow: 0 0 15px rgba(109, 40, 217, 0.5);
        }
        .balance-title { font-size: 14px; color: #ccc; }
        .balance-amount { font-size: 32px; font-weight: bold; margin-top: 5px; }
        .balance-usd { color: #4ade80; margin-top: 5px; }
        
        .countdown {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 15px;
            width: 100%;
            text-align: center;
            margin-top: 20px;
        }
        .countdown-timer { display: flex; justify-content: center; gap: 10px; margin-top: 10px; }
        .time-box { background: #333; padding: 5px 10px; border-radius: 5px; font-weight: bold; }
        
        .nav-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            background: #131a2a;
            display: flex;
            justify-content: space-around;
            padding: 10px 0;
            border-top: 1px solid #333;
        }
        .nav-item { color: #888; text-align: center; font-size: 12px; cursor: pointer; }
        .nav-item.active { color: #7c3aed; }
    </style>
</head>
<body>

    <div class="header">
        <div class="avatar">🐱</div>
        <div class="info">
            <h3>@alik.king</h3>
            <span style="color:#888;">Level 1</span>
        </div>
    </div>

    <div class="balance-box">
        <div class="balance-title">Your Balance</div>
        <div class="balance-amount">1,250 ZKO</div>
        <div class="balance-usd">≈ $162.50</div>
    </div>

    <div class="countdown">
        <h3>Campaign Ends In</h3>
        <div class="countdown-timer">
            <div class="time-box">366</div><span>Days</span>
            <div class="time-box">12</div><span>Hours</span>
            <div class="time-box">34</div><span>Mins</span>
            <div class="time-box">21</div><span>Secs</span>
        </div>
    </div>

    <div class="nav-bar">
        <div class="nav-item active">خانه</div>
        <div class="nav-item">استخراج</div>
        <div class="nav-item">وظایف</div>
        <div class="nav-item">کیف پول</div>
        <div class="nav-item">پروفایل</div>
    </div>

    <script>
        // کد راه‌اندازی اولیه تلگرام
        const tg = window.Telegram.WebApp;
        tg.expand(); // تمام صفحه شدن اپ
        tg.setHeaderColor('#0b0f19');
        tg.setBackgroundColor('#0b0f19');

        // دریافت اطلاعات کاربر واقعی تلگرام
        const user = tg.initDataUnsafe.user;
        if(user) {
            document.querySelector('.info h3').innerText = `@${user.username}`;
            // اگر عکس پروفایل داشت، اینجا ست می‌شود
        }
    </script>
</body>
</html>
