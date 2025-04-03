/* Goodnotes 6 高级版解锁脚本 v1.0.2 */
const $ = new Env("GoodNotes");

// 动态生成时间戳
const generateTimestamps = () => {
    const now = new Date();
    return {
        iso: now.toISOString(),
        unix: now.getTime()
    };
};

// 核心响应处理
const createFakeResponse = (requestUrl) => {
    const time = generateTimestamps();
    
    // 公共订阅数据
    const baseSubscription = {
        productId: "com.goodnotes.gn6_yearly_4999",
        originalTransactionId: Math.random().toString().slice(2,17), // 动态交易ID
        tier: "GN6_PREMIUM",
        expirationDate: new Date(Date.now() + 10*365*24*60*60*1000).toISOString() // 动态10年有效期
    };

    if (requestUrl.includes('processAppleReceipt')) {
        return {
            data: {
                processAppleReceipt: {
                    __typename: "SubscriptionResult",
                    subscription: {
                        ...baseSubscription,
                        status: "ACTIVE",
                        originalPurchaseDate: "2022-09-08T01:04:17Z"
                    },
                    error: 0
                }
            }
        };
    }

    // 处理其他验证端点
    return {
        request_date: time.iso,
        request_date_ms: time.unix,
        subscriber: {
            entitlements: {
                premium_access: {
                    expires_date: baseSubscription.expirationDate,
                    product_identifier: baseSubscription.productId
                }
            },
            subscriptions: {
                [baseSubscription.productId]: {
                    expires_date: baseSubscription.expirationDate,
                    purchase_date: time.iso
                }
            }
        }
    };
};

// 请求处理中间件
const handleRequest = () => {
    // 禁用缓存
    const modifiedHeaders = {
        ...$response.headers,
        'Cache-Control': 'no-store, max-age=0',
        'Expires': '0'
    };
    
    // 动态响应数据
    const fakeResponse = createFakeResponse($request.url);
    
    // 调试日志
    console.log(`拦截请求：${$request.url}`);
    console.log(`生成响应：${JSON.stringify(fakeResponse, null, 2)}`);

    // 持久化存储验证状态
    $.write(JSON.stringify(fakeResponse), 'subscription_cache');

    $done({
        headers: modifiedHeaders,
        body: JSON.stringify(fakeResponse)
    });
};

// 启动时验证
const verifyPersistence = () => {
    if (!$.read('subscription_cache')) {
        $.notify("⚠️ 初始化订阅状态...", "请重启应用完成激活");
        handleRequest();
    }
};

// 执行流程
verifyPersistence();
handleRequest();
