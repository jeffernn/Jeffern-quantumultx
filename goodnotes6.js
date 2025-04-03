const $ = new Env("Goodbility");
const version = 'jsjiami.com.v7';

// 增强型存储模块
const Storage = {
get: (key) => {
try {
return localStorage.getItem(key);
} catch (e) {
console.error('Storage读取失败:', e);
return null;
}
},
set: (key, value) => {
try {
localStorage.setItem(key, value);
} catch (e) {
console.error('Storage写入失败:', e);
}
}
};

function showMonthlyPopup() {
const currentMonth = new Date().getMonth();
const savedMonth = Storage.get("current_month");

if (savedMonth === null || savedMonth !== currentMonth.toString()) {
$.notify(
'Goodbility',
'月度提醒',
'本月订阅已激活\n点击查看更新',
);
Storage.set("current_month", currentMonth.toString());
}
}

// 智能请求匹配模块
const RequestMatcher = {
isAppleReceipt: (url) => {
const patterns = [
/\/processAppleReceipt/i,
/\/verifySubscription/i
];
return patterns.some(pattern => pattern.test(url));
}
};

let obj;

if (RequestMatcher.isAppleReceipt($request.url)) {
obj = {
"data": {
"processAppleReceipt": {
"__typename": "ProcessedAppleReceipt",
"isClassic": false,
"subscription": {
"productId": "premium_1y_1999_3d0",
"originalTransactionId": "490001314520000",
"tier": "PREMIUM",
"refundedDate": null,
"refundedReason": null,
"isInBillingRetryPeriod": false,
"expirationDate": "2099-12-31T23:59:59Z",
"gracePeriodExpiresAt": null,
"overDeviceLimit": false,
"expirationIntent": "NONE",
"__typename": "AppStoreSubscription",
"user": null,
"status": "ACTIVE",
"originalPurchaseDate": "2023-12-31T13:14:20Z",
"lastValidation": Date.now() // 新增验证时间戳
},
"error": 0,
"signature": crypto.createHmac('sha256', 'secret-key')
.update(JSON.stringify(obj))
.digest('hex') // 新增数据签名
}
}
};
} else {
obj = {
"request_date": new Date().toISOString(),
"request_date_ms": Date.now(),
"subscriber": {
"entitlements": {
"apple_access": {
"grace_period_expires_date": null,
"purchase_date": "2023-12-31T13:14:20Z",
"product_identifier": "premium_1y_1999_3d0"
},
"gn5": {
"grace_period_expires_date": null,
"purchase_date": "2023-12-31T13:14:20Z",
"product_identifier": "gn5_premium_1y_1999_3d0"
},
"crossplatform_access": {
"grace_period_expires_date": null,
"purchase_date": "2022-09-08T01:04:17Z",
"product_identifier": "com.goodnotes.gn6.yearly_premium_3999"
}
},
"original_purchase_date": "2023-12-31T13:14:20Z",
"subscriptions": {
"com.goodnotes.gn6_one_time_unlock_3999": {
"is_sandbox": false,
"ownership_type": "PURCHASED",
"original_purchase_date": "2023-12-31T13:14:20Z"
}
}
},
"signature": crypto.createHmac('sha256', 'secret-key')
.update(JSON.stringify(obj))
.digest('hex') // 通用数据签名
};
}

// 增强型初始化流程
(function() {
showMonthlyPopup();

// 每日健康检查
const lastCheck = Storage.get("last_check");
const now = Date.now();
if (!lastCheck || now - lastCheck > 86400000) {
console.log('执行每日订阅验证...');
Storage.set("last_check", now);
// 模拟验证请求
fetch('/healthCheck', {
method: 'POST',
body: JSON.stringify({
"subscription": {
"expirationDate": "2099-12-31T23:59:59Z"
}
})
});
}
})();

console.log('操作成功\n');
$done({
body: JSON.stringify(obj),
headers: {
"Cache-Control": "no-cache",
"X-Script-Version": version,
"X-Signature": crypto.createHmac('sha256', 'secret-key')
.update(JSON.stringify(obj))
.digest('hex')
}
});

// 环境兼容代码（增强版）
function Env(t, e) {
// 自动检测环境
this.env = (() => {
if (typeof $request !== 'undefined') return 'iOS';
if (typeof GM_xmlhttpRequest !== 'undefined') return 'GreaseMonkey';
return 'Unknown';
})();

// 实现统一的通知接口
this.notify = (title, subtitle, message, options = {}) => {
switch(this.env) {
case 'iOS':
$.notify(title, subtitle, message, options);
break;
case 'GreaseMonkey':
GM_notification(message, title, options['open-url']);
break;
default:
console.log(`[${title}] ${message}`);
}
};

// 实现统一的存储接口
this.getval = (key) => Storage.get(key);
this.setdata = (value, key) => Storage.set(key, value);
}
