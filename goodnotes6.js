/* Goodnotes 6 高级版解锁脚本 v1.0.1 */
const $ = new Env("GoodNotes");

// 核心功能：伪造订阅验证响应
const modifySubscriptionResponse = () => {
    // 获取请求头信息
    const userAgent = $request.headers['User-Agent'] || $request.headers['user-agent'];
    
    // 构造假响应数据
    let fakeResponse;
    if ($request.url.indexOf('processAppleReceipt') !== -1) {
        fakeResponse = {
            data: {
                processAppleReceipt: {
                    __typename: "SubscriptionResult",
                    isClassic: false,
                    subscription: {
                        productId: "com.goodnotes.gn6_yearly_4999", // 伪装成年订阅
                        originalTransactionId: "20000000000000",
                        tier: "GN6_PREMIUM",
                        refundedDate: null,
                        refundedReason: null,
                        isInBillingRetryPeriod: false,
                        expirationDate: "2099-12-31T13:14:20Z", // 设置超长有效期
                        gracePeriodExpiresAt: null,
                        overDeviceLimit: false,
                        expirationIntent: "null",
                        __typename: "AppStoreSubscription",
                        user: null,
                        status: "ACTIVE", // 激活状态
                        originalPurchaseDate: "2022-09-08T01:04:17Z"
                    },
                    error: 0
                }
            }
        };
    } else {
        fakeResponse = {
            request_date: "2025-02-22T14:52:31Z",
            request_date_ms: 6969696969696,
            subscriber: {
                entitlements: {
                    apple_access: {
                        product_identifier: "com.goodnotes.gn6_yearly_4999"
                    },
                    gn5: {
                        product_identifier: "com.goodnotes.gn5_premium"
                    },
                    crossplatform_access: {
                        product_identifier: "com.goodnotes.gn6_cross_platform"
                    }
                },
                original_purchase_date: "2023-12-31T13:14:20Z",
                subscriptions: {
                    "com.goodnotes.gn6_one_time_unlock_3999": {
                        period_type: "active", // 订阅状态为激活
                        purchase_date: "2022-09-08T01:04:17Z"
                    }
                }
            },
            Attention: "高级功能已解锁！"
        };
    }

    // 显示解锁成功提示
    showMonthlyNotification();
    console.log('解锁成功！尽情使用高级功能吧~');
    
    // 返回修改后的响应
    $done({ body: JSON.stringify(fakeResponse) });
};

// 每月提醒功能（防止被覆盖）
const showMonthlyNotification = () => {
    const currentMonth = new Date().getMonth();
    const savedMonth = $.getval('lastPromptMonth');
    
    if (savedMonth === null || savedMonth !== currentMonth) {
        $.notify(
            '🎉 GoodNotes 高级版已激活',
            '有效期至 2099-12-31',
            '请勿泄露脚本，享受无限制使用！',
            { 'open-url': 'goodnotes://' }
        );
        $.setval(currentMonth.toString(), 'lastPromptMonth');
    }
};

// 执行主函数
modifySubscriptionResponse();
