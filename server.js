// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// اتصال به دیتابیس MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/zaksh_db')
  .then(() => console.log('✅ Database Connected'))
  .catch(err => console.log('❌ DB Connection Error:', err));

// ------------------- مدل‌های دیتابیس (Schemas) -------------------

// مدل کاربر
const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true }, // آیدی عددی تلگرام
  username: String,
  balance: { type: Number, default: 0 }, // موجودی ZKO
  totalMined: { type: Number, default: 0 },
  totalEarned: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 },
  referredBy: String, // آیدی کسی که این کاربر را دعوت کرده
  lastMiningTime: { type: Date, default: null }, // زمان آخرین استخراج
  tasksCompleted: { type: [String], default: [] }, // لیست وظایف انجام شده
  isAdmin: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

// مدل لاگ فعالیت‌ها
const ActivityLogSchema = new mongoose.Schema({
  telegramId: String,
  username: String,
  action: String, // 'Mining', 'Task', 'Referral'
  amount: Number,
  timestamp: { type: Date, default: Date.now }
});
const ActivityLog = mongoose.model('ActivityLog', ActivityLogSchema);

// ------------------- توابع کمکی -------------------

// سیستم ضد تقلب: بررسی اینکه آیا کاربر می‌تواند دوباره استخراج کند یا خیر
const MINING_INTERVAL_MS = 60 * 1000; // هر ۱ دقیقه یک بار (برای تست). در حالت واقعی ۱۲ دقیقه است.

function canMine(user) {
  if (!user.lastMiningTime) return true;
  const timeSinceLastMine = Date.now() - new Date(user.lastMiningTime).getTime();
  return timeSinceLastMine >= MINING_INTERVAL_MS;
}

// ------------------- API ها (مسیرها) -------------------

// ۱. ورود یا ثبت‌نام کاربر (هنگام باز کردن اپ)
app.post('/api/user/register', async (req, res) => {
  const { telegramId, username, referredBy } = req.body;

  try {
    let user = await User.findOne({ telegramId });
    
    if (!user) {
      user = new User({ telegramId, username, referredBy });
      await user.save();

      // سیستم پاداش دعوت (Referral System)
      if (referredBy) {
        const referrer = await User.findOne({ telegramId: referredBy });
        if (referrer) {
          referrer.referralCount += 1;
          referrer.balance += 50; // جایزه دعوت
          await referrer.save();
          
          await ActivityLog.create({ telegramId: referredBy, username: referrer.username, action: 'Referral', amount: 50 });
        }
      }
    } else {
      // اگر کاربر قبلاً آمده، فقط نام کاربری را آپدیت کن
      user.username = username;
      await user.save();
    }

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ۲. استخراج سکه (Mining)
app.post('/api/mining/claim', async (req, res) => {
  const { telegramId } = req.body;
  const reward = 12; // مقدار جایزه استخراج

  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // بررسی ضد تقلب
    if (!canMine(user)) {
      return res.status(400).json({ success: false, message: 'Mining cooldown active' });
    }

    // اعمال تغییرات
    user.balance += reward;
    user.totalMined += reward;
    user.totalEarned += reward;
    user.lastMiningTime = new Date();
    await user.save();

    // ثبت در لاگ
    await ActivityLog.create({ telegramId, username: user.username, action: 'Mining', amount: reward });

    res.json({ success: true, newBalance: user.balance });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ۳. تکمیل وظیفه (Task)
app.post('/api/tasks/complete', async (req, res) => {
  const { telegramId, taskId, reward } = req.body;

  try {
    const user = await User.findOne({ telegramId });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // بررسی اینکه آیا کاربر قبلاً این تسک را انجام داده (جلوگیری از تقلب)
    if (user.tasksCompleted.includes(taskId)) {
      return res.status(400).json({ success: false, message: 'Task already completed' });
    }

    // اعمال تغییرات
    user.tasksCompleted.push(taskId);
    user.balance += reward;
    user.totalEarned += reward;
    await user.save();

    await ActivityLog.create({ telegramId, username: user.username, action: 'Task', amount: reward });

    res.json({ success: true, newBalance: user.balance });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ۴. دریافت آمار داشبورد مدیر (Owner Dashboard)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBalance = await User.aggregate([{ $group: { _id: null, total: { $sum: "$balance" } } }]);
    const totalMining = await User.aggregate([{ $group: { _id: null, total: { $sum: "$totalMined" } } }]);
    const recentActivities = await ActivityLog.find().sort({ _id: -1 }).limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers,
        totalBalance: totalBalance[0]?.total || 0,
        totalMining: totalMining[0]?.total || 0
      },
      recentActivities
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// راه‌اندازی سرور
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
