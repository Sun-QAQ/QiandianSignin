// ��ʼ��
console.show(); //��ʾ����̨
log("��ʼ��");
auto.waitFor(); // ���ϰ�����
log("���ϰ�����������");
console.setTitle("���ǩ���ű�"); // ���ÿ���̨����
console.setPosition(0, device.height / 1.6) // ���ÿ���̨λ��
console.setSize(device.width / 2, device.width / 2) // ���ÿ���̨��С
// �������
log("�������");
app.launchPackage('com.qidian.QDReader');
waitForPackage('com.qidian.QDReader');
waitForActivity('com.qidian.QDReader.ui.activity.MainGroupActivity');
waitView("���").click();
log("Ӧ����ʶ��");

const regex_ad_1 = /�ۿ���Ƶ(\d+)��󣬿ɻ�ý���/
const regex_ad_2 = /����(\d+)��������ɻ�ý���/
const regex_game = /(\d+)\/(\d+)����/
let textView;

// ǩ��
if (className("android.widget.TextView").text("ǩ��").exists()) {
    click("ǩ��", 0);
    sleep(7000);   // �ȴ�1��
}

// �츣��
if (className("android.widget.TextView").text("�츣��").exists()) {
    click("�츣��", 0);
    sleep(5000);   // �ȴ�1��
    if (className("android.widget.TextView").text("������ǩ��")) {
        log("ǩ���ɹ�");
    } else {
        log("ǩ��ʧ��");
    }
}

// ����Ƶ
while (textView = findView("����Ƶ")) {
    clickButton(textView);
    watchAds();
    sleep(1000);
}
log("����Ƶ ����");



// ��������
log("�ű��ѽ������ǵ�����auto.js��̨");
log("����̨3����Զ��ر�");
sleep(3000);
console.hide()
engines.stopAllAndToast()






/**
 * ����������ʽ�����ַ����е�ֵ
 * [url=home.php?mod=space&uid=952169]@Param[/url] {string} str �ַ���
 * @param {RegExp} regex ������ʽ
 * @param {number|undefined} count �������
 * @returns ��������������Ҫ�ĸ���ʱ�������� 1 ��ͷ������
 */
function findValueFromString(str, regex, count) {
    if (!count) count = 1;
    let m = regex.exec(str);
    return (m && m.length >= count + 1) ? m : undefined;
}

/**
 * ���Ҵ���ĳ���ı��Ŀؼ�
 * @param {string} content �����ı�
 * @param {string} mode ���ҷ�ʽ����� findViewBy
 * @returns ��һ�����������Ŀؼ��������ڷ��� undefined
 */
function findView(content, mode) {
    log(`���ҿؼ� ${content}`);
    let find = findViewBy(content, mode);
    return find && find.exists() ? find.findOnce() : undefined;
}

/**
 * ���Ҵ���ĳ���ı��Ŀؼ�
 * @param {string} content �����ı�
 * @param {string} mode ���ҷ�ʽ����� findViewBy
 * @returns ��һ�����������Ŀؼ�
 */
function waitView(content, mode) {
    log(`�ȴ��ؼ� ${content}`);
    let view = findViewBy(content, mode);
    view.waitFor();
    return view.findOnce();
}

/**
 * ���ҿؼ�
 * @param {string} content �����ı� 
 * @param {string} mode ���ҷ�ʽ��Ĭ�� text����ѡ match��id
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
 * �������ֲ��Ұ�ť�����
 * @param {UiObject} view ��ť�ϵ��������� view
 * @returns �Ƿ�ɹ����
 */
function clickButton(view) {
    log("��� " + view.text());
    // ���Ұ�ť���ڿؼ�
    let btn = view;
    while (btn && !btn.clickable()) {
        btn = btn.parent();
    }
    // ���
    if (btn) {
        btn.click();
        return true;
    }
    return false;
}

/**
 * ����棬�ȴ����������رչ��
 * @returns �Ƿ񲥷����
 */
function watchAds() {
    let times = 0;
    let adType = 0;
    while (true) {
        log("�ȴ������ " + times.toString());
        if (textView = findView("�ۿ���Ƶ\\d+��󣬿ɻ�ý���", 'match')) {
            let adTime = findValueFromString(textView.text(), regex_ad_1);
            // Ӧ�ò����б� 45s �����Ĺ���˰�
            adTime = adTime ? adTime[1] : 45;
            log(`���ʱ�䣺${adTime}+3s`);
            sleep(adTime * 1000);
            sleep(3000); // �������� 3s
            break;
        } else if (textView = findView("����\\d+��������ɻ�ý���", 'match')) {
            let adTime = findValueFromString(textView.text(), regex_ad_2);
            adType = 1;
            // ���һ���ʮ���룬ȡ 20s
            adTime = adTime ? adTime[1] : 20;
            log(`���ʱ�䣺${adTime}+3s`);
            // ��Щ���Ĭ����ͣ
            if (textView = findView('&#59666;')) {
                log("��ʼ����");
                clickButton(textView)
            }
            sleep(adTime * 1000);
            sleep(3000); // �������� 3s
            break;
        } else if (textView = findView("�ۿ�����Ƶ���ɻ�ý���")) {
            while ((textView = findView("�������"))) {
                sleep(1000);
            }
            break;
        } else if (textView = findView("������Ƶ")) {
            clickButton(textView);
            log("���ۿ�ʧ��");
            return false;
        }
        sleep(500);
        times++;
        if (times > 50) {
            device.vibrate(300);
            log("���ʶ���������, �����Ƿ�������������");
            return false;
        }
    }
    // ����
    if (adType == 1) {
        let adView = findView('com.tencent.tbs.core.webkit.WebView', 'class')
        if (adView) {
            while (!adView.children().isEmpty()) {
                adView = adView.children()[0]
            }
            clickButton(adView)
            clickButton(findView("��"));
            clickButton(waitView("��������"));
            waitForActivity("com.qidian.QDReader.ui.activity.QDBrowserActivity");
            waitView("������Ƶ����");
        } else if (adView = findView('&#59723;')) {
            clickButton(adView)
        } else {
            className('Button').text('').findOne().click();
        }
    } else if (textView = findView("�������")) {
        clickButton(textView);
    } else {
        let closeButton = className("ImageView").filter(o => o.clickable()).findOnce();
        if (closeButton) closeButton.click();
        else return false;
    }
    // �ȴ� ��֪����
    sleep(1000);
    if (textView = findView("��֪����")) {
        clickButton(textView);
    }
    log("����ѽ���")
    return true;
}

// #region Debug

/**
 * �ڿ���̨���ĳ����ͼ����������ͼ
 * @param {UiObject} view ��ͼ
 * @param {number|undefined} level �ո�ȼ�
 */
function logView(view, level) {
    if (!level) level = 0;
    let s = "";
    for (let i = 0; i < level; ++i) s += " ";
    log(`${s}${view}`);
    view.children().forEach(v => logView(v, level + 2));
}

/**
 * �ڿ���̨�����ǰ��Ļ������ͼ������
 * @param {UiObject} child �ڲ�����һ������ͼ
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