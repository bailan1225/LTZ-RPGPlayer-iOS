/**
 * ios_form_fix.js
 * 修复 iOS WKWebView 中 HTML <input> / <button> 元素不可交互的问题。
 *
 * 根因：
 *   viewport.js 在 body 上设置 -webkit-user-select: none，
 *   iOS 上该属性会阻止子 <input> 获得焦点、<button> 响应点击。
 *   此外，程序化 input.focus() 在 iOS WKWebView 不弹出虚拟键盘。
 *
 * 修复策略：
 *   1. CSS 覆写 user-select / touch-action，恢复表单元素交互能力
 *   2. MutationObserver 检测新增 <input> → prompt() 弹出原生对话框
 *   3. 用户点 OK 后回填文本并自动触发 accept，直接进入下一步
 *   4. 拦截 HTML 按钮触摸，绕过 RPG Maker document 级 preventDefault
 *
 * 注入时机：atDocumentEnd（Phase 2，紧跟 viewport.js）
 */
(function(){
    // 1. CSS fix
    var s = document.createElement('style');
    s.id = '__ark_form_fix';
    s.textContent = 'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]),textarea,select,button{-webkit-user-select:auto!important;user-select:auto!important;-webkit-touch-callout:default!important;touch-action:manipulation!important;}';
    document.documentElement.appendChild(s);

    // 2. HTML button touch bridge
    //
    // RPG Maker MV/MZ 在 document 上监听 touchstart 并 preventDefault()；
    // common_input.js 还需要把普通画布触摸转换成 TouchInput。对于浮在画布
    // 上方的 HTML button，这会让 WebKit 不再合成 click。这里在捕获阶段截住
    // 按钮触摸，并在一次短按结束后显式派发且只派发一次 click。
    var buttonTouch = null;
    var BUTTON_MOVE_SLOP = 12;

    function closestButton(target) {
        if (!target || !target.closest) return null;
        return target.closest('button,input[type="button"],input[type="submit"],[role="button"]');
    }

    function clearButtonTouch() {
        buttonTouch = null;
    }

    document.addEventListener('touchstart', function(event) {
        var button = closestButton(event.target);
        if (!button || button.disabled || !event.changedTouches.length) return;
        var touch = event.changedTouches[0];
        buttonTouch = {
            element: button,
            identifier: touch.identifier,
            x: touch.clientX,
            y: touch.clientY,
            moved: false
        };
        // 阻止 RPG Maker 的 document/window 监听器接管，但不 preventDefault；
        // touchend 中会显式生成 click。
        event.stopImmediatePropagation();
    }, true);

    document.addEventListener('touchmove', function(event) {
        if (!buttonTouch) return;
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            if (touch.identifier !== buttonTouch.identifier) continue;
            if (Math.abs(touch.clientX - buttonTouch.x) > BUTTON_MOVE_SLOP ||
                Math.abs(touch.clientY - buttonTouch.y) > BUTTON_MOVE_SLOP) {
                buttonTouch.moved = true;
            }
            event.stopImmediatePropagation();
            return;
        }
    }, true);

    document.addEventListener('touchend', function(event) {
        if (!buttonTouch) return;
        for (var i = 0; i < event.changedTouches.length; i++) {
            var touch = event.changedTouches[i];
            if (touch.identifier !== buttonTouch.identifier) continue;
            var state = buttonTouch;
            clearButtonTouch();
            event.preventDefault();
            event.stopImmediatePropagation();
            if (state.moved || !state.element.isConnected || state.element.disabled) return;

            var hit = document.elementFromPoint(touch.clientX, touch.clientY);
            if (closestButton(hit) !== state.element) return;
            state.element.dispatchEvent(new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                clientX: touch.clientX,
                clientY: touch.clientY,
                button: 0
            }));
            return;
        }
    }, true);

    document.addEventListener('touchcancel', clearButtonTouch, true);

    // 3. MutationObserver: 检测游戏插件动态创建的 <input> 文本框
    function fireKey(el, key, keyCode){
        var down=new KeyboardEvent('keydown',{key:key,code:key,bubbles:true,cancelable:true});
        Object.defineProperty(down,'keyCode',{get:function(){return keyCode;}});
        Object.defineProperty(down,'which',{get:function(){return keyCode;}});
        el.dispatchEvent(down);
        // 必须配对 keyup：RPG Maker Input._currentState 残留会导致游戏认为按键持续按住，
        // 连续触发 confirm，跳过后续游戏流程
        setTimeout(function(){
            if(!el.parentNode)return;
            var up=new KeyboardEvent('keyup',{key:key,code:key,bubbles:true,cancelable:true});
            Object.defineProperty(up,'keyCode',{get:function(){return keyCode;}});
            Object.defineProperty(up,'which',{get:function(){return keyCode;}});
            el.dispatchEvent(up);
        },60);
    }

    function handleNewInput(el){
        if(el.__arkHandled)return;
        el.__arkHandled=true;
        var initial=el.value||'';
        setTimeout(function(){
            if(!el.parentNode)return;
            // Cancel 语义 = 用初始值确认，所以两种路径都走 Enter 提交
            var result=prompt('__ARK_INPUT__|'+initial);
            if(result!==null&&result.length>0){
                el.value=result;
                // 显式触发 input/change，让游戏感知值变化（直接写 .value 不会自动派发）
                try{
                    el.dispatchEvent(new Event('input',{bubbles:true}));
                    el.dispatchEvent(new Event('change',{bubbles:true}));
                }catch(e){}
            }else{
                el.value=initial;
            }
            setTimeout(function(){
                if(!el.parentNode)return;
                fireKey(el,'Enter',13);
            },100);
        },200);
    }

    var obs=new MutationObserver(function(mutations){
        for(var i=0;i<mutations.length;i++){
            var nodes=mutations[i].addedNodes;
            for(var j=0;j<nodes.length;j++){
                var n=nodes[j];
                if(n.nodeType!==1)continue;
                if(n.tagName==='INPUT'&&n.type!=='hidden'&&n.type!=='submit'&&n.type!=='button'&&n.type!=='checkbox'&&n.type!=='radio'&&n.type!=='file'){
                    handleNewInput(n);
                }
            }
        }
    });

    function start(){
        if(document.body){obs.observe(document.body,{childList:true,subtree:true});}
        else{document.addEventListener('DOMContentLoaded',function(){obs.observe(document.body,{childList:true,subtree:true});});}
    }
    start();
})();
