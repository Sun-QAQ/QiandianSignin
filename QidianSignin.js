// 初始化
console.show(); //显示控制台
log("初始化");
auto.waitFor(); // 无障碍服务
log("无障碍服务已启动");
console.setTitle("起点签到脚本"); // 设置控制台标题
console.setPosition(0, device.height / 1.6) // 设置控制台位置
console.setSize(device.width / 2, device.width / 2) // 设置控制台大小
// 启动起点
log("启动起点");
app.launchPackage('com.qidian.QDReader');
waitForPackage('com.qidian.QDReader');
waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
waitView("书架").click();
log("应用已识别");

const regex_ad_1 = /观看视频(\d+)秒后，可获得奖励/
const regex_ad_2 = /收听(\d+)秒有声书可获得奖励/
const regex_game = /(\d+)\/(\d+)分钟/
let textView;

// 签到
if (className("android.widget.TextView").text("签到").exists()) {
    click("签到", 0);
    sleep(7000);   // 等待1秒
}

// 领福利
if (className("android.widget.TextView").text("领福利").exists()) {
    click("领福利", 0);
    sleep(5000);   // 等待1秒
    if (className("android.widget.TextView").text("已连续签到")) {
        log("签到成功");
    } else {
        log("签到失败");
    }
}

// 看视频
while (textView = findView("看视频")) {
    clickButton(textView);
    watchAds();
    sleep(1000);
}
log("看视频 结束");



// 结束部件
log("脚本已结束，记得清理auto.js后台");
log("控制台3秒后自动关闭");
sleep(3000);
console.hide()
engines.stopAllAndToast()






/**
 * 根据正则表达式查找字符串中的值
 * [url=home.php?mod=space&uid=952169]@Param[/url] {string} str 字符串
 * @param {RegExp} regex 正则表达式
 * @param {number|undefined} count 结果个数
 * @returns 当数量不少于需要的个数时，返回以 1 开头的数组
 */
function findValueFromString(str, regex, count) {
    if (!count) count = 1;
    let m = regex.exec(str);
    return (m && m.length >= count + 1) ? m : undefined;
}

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，详见 findViewBy
 * @returns 第一个符合条件的控件，不存在返回 undefined
 */
function findView(content, mode) {
    log(`查找控件 ${content}`);
    let find = findViewBy(content, mode);
    return find && find.exists() ? find.findOnce() : undefined;
}

/**
 * 查找带有某个文本的控件
 * @param {string} content 查找文本
 * @param {string} mode 查找方式，详见 findViewBy
 * @returns 第一个符合条件的控件
 */
function waitView(content, mode) {
    log(`等待控件 ${content}`);
    let view = findViewBy(content, mode);
    view.waitFor();
    return view.findOnce();
}

/**
 * 查找控件
 * @param {string} content 查找文本 
 * @param {string} mode 查找方式，默认 text，可选 match，id
 * @returns selector 
 */
function findViewBy(content, mode) {
    let find;
    if (mode === 'class') {
        find = className(content)
    } else if (mode === 'match') {
        find = textMatches(content);
    } else if (mode === 'id') {
        find = id(content)
    } else {
        find = text(content);
    }
    return find;
}

/**
 * 根据文字查找按钮并点击
 * @param {UiObject} view 按钮上的文字所在 view
 * @returns 是否成功点击
 */
function clickButton(view) {
    log("点击 " + view.text());
    // 查找按钮所在控件
    let btn = view;
    while (btn && !btn.clickable()) {
        btn = btn.parent();
    }
    // 点击
    if (btn) {
        btn.click();
        return true;
    }
    return false;
}

/**
 * 看广告，等待广告结束并关闭广告
 * @returns 是否播放完成
 */
function watchAds() {
    let times = 0;
    let adType = 0;
    while (true) {
        log("等待广告中 " + times.toString());
        if (textView = findView("观看视频\\d+秒后，可获得奖励", 'match')) {
            let adTime = findValueFromString(textView.text(), regex_ad_1);
            // 应该不会有比 45s 更长的广告了吧
            adTime = adTime ? adTime[1] : 45;
            log(`广告时间：${adTime}+3s`);
            sleep(adTime * 1000);
            sleep(3000); // 额外休眠 3s
            break;
        } else if (textView = findView("收听\\d+秒有声书可获得奖励", 'match')) {
            let adTime = findValueFromString(textView.text(), regex_ad_2);
            adType = 1;
            // 这个一般就十几秒，取 20s
            adTime = adTime ? adTime[1] : 20;
            log(`广告时间：${adTime}+3s`);
            // 有些广告默认暂停
            if (textView = findView('&#59666;')) {
                log("开始播放");
                clickButton(textView)
            }
            sleep(adTime * 1000);
            sleep(3000); // 额外休眠 3s
            break;
        } else if (textView = findView("观看完视频，可获得奖励")) {
            while ((textView = findView("跳过广告"))) {
                sleep(1000);
            }
            break;
        } else if (textView = findView("跳过视频")) {
            clickButton(textView);
            log("广告观看失败");
            return false;
        }
        sleep(500);
        times++;
        if (times > 50) {
            device.vibrate(300);
            log("广告识别出现问题, 请检查是否正常继续进行");
            return false;
        }
    }
    // 结束
    if (adType == 1) {
        let adView = findView('com.tencent.tbs.core.webkit.WebView', 'class')
        if (adView) {
            while (!adView.children().isEmpty()) {
                adView = adView.children()[0]
            }
            clickButton(adView)
            clickButton(findView("我"));
            clickButton(waitView("福利中心"));
            waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
            waitView("激励视频任务");
        } else if (adView = findView('&#59723;')) {
            clickButton(adView)
        } else {
            className('Button').text('').findOne().click();
        }
    } else if (textView = findView("跳过广告")) {
        clickButton(textView);
    } else {
        let closeButton = className("ImageView").filter(o => o.clickable()).findOnce();
        if (closeButton) closeButton.click();
        else return false;
    }
    // 等待 我知道了
    sleep(1000);
    if (textView = findView("我知道了")) {
        clickButton(textView);
    }
    log("广告已结束")
    return true;
}

// #region Debug

/**
 * 在控制台输出某个视图及所有子视图
 * @param {UiObject} view 视图
 * @param {number|undefined} level 空格等级
 */
function logView(view, level) {
    if (!level) level = 0;
    let s = "";
    for (let i = 0; i < level; ++i) s += " ";
    log(`${s}${view}`);
    view.children().forEach(v => logView(v, level + 2));
}

/**
 * 在控制台输出当前屏幕所有视图的内容
 * @param {UiObject} child 内部任意一个子视图
 */
function logRootView(child) {
    if (!child) {
        child = classNameContains("").findOnce()
    }

    let pl = 0;
    let pv = child.parent();
    while (pv) {
        pl++;
        child = pv;
        pv = child.parent();
    }
    log(pl);
    logView(child);
}

// #endregion```