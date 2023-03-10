(function() {
    if (window.OGameEnhancementsHasRun) return; // Ensure this code only runs once
    window.OGameEnhancementsHasRun = true;

    console.log('init');
    let container = document.documentElement || document.body;
    let qs = s => container.querySelector(s);

    let attemptCallback = (selector, callback) => {
        let element = qs(selector);
        if (element != null) {
            callback(element);
            return true;
        }
        return false;
    };
    let earlyObserve = (s, f) => {
        new MutationObserver((_, observer) => {
            if (!attemptCallback(s, f)) return; // try again
            observer.disconnect(); // done, stop trying
        }).observe(container, { childList: true });
    };

    console.log('run');

    // hide header (no commander)
    earlyObserve('#mmonetbar', el => {
        el.remove();
        document.body.classList.remove('no-commander');
    });

    // hide footer
    // earlyObserve('#siteFooter', el => { console.log('ob',performance.now()); el.remove(); });
    // earlyObserve('#chatBar', el => el.style.bottom = '0');

    //de-emphasize DM
    earlyObserve('#bannerSkyscrapercomponent', el => el.remove());
    earlyObserve('#promotionCountdownBox', el => el.remove());
    earlyObserve('#darkmatter_box img', el => el.remove()); // de-animate DM icon
    earlyObserve('#menuTable', el => {
        el.insertBefore(qs('#menuTable > :nth-child(5)'), qs('#menuTable > :nth-child(13)')); // move Trader to bottom of menu
        document.querySelectorAll('#menuTable > :nth-child(n+12) > .premiumHighligt span')
            .forEach(el => el.style.color = 'inherit'); // de-colorize premium menu items
    });

    earlyObserve('#tutorialiconcomponent #helper a', el => {
        let st = el.style;
        st.width = st.height = st.fontSize = st.lineHeight = '15px';
        st.top = st.left = '7px';
    });

    document.addEventListener('DOMContentLoaded', () => {
        const styleSheet = document.head.appendChild(document.createElement('style')).sheet;
        let rule = s => styleSheet.insertRule(s.replaceAll('???', ' !important'));

        // hide footer (why is this faster than with earlyObserver???)
        rule('#siteFooter { display: none???; }');
        rule('#chatBar { bottom: 0???; }'); // move chatbar down

        rule('.build-faster { display: none???; }');
        rule('#countdownresearchDetails { background: #???; }');

        // visual improvements
        rule('.icon .level, .icon .amount { width: 70%???; }');
        rule('.targetlevel, .targetamount { padding: 0 5px???; }');
        rule('.targetlevel::before, .targetamount::before { content: "??"; display: inline-block; transform: rotate(90deg); }');


        rule('#resources_metal { color: #9f9c8d???; }');
        rule('#resources_crystal { color: #a2c3e5???; }');
        rule('#resources_deuterium { color: #4ebda8???; }');
        rule('#resources_energy { color: #9c0???; }');
        rule('#resources_darkmatter { color: #736e79???; }');
        if (!qs('#resources_energy').classList.contains('overmark'))
            rule('#resources_energy::before { content: "+"; }');

        let techDeets = () => {
            let buildWrap = qs(".build-it_wrap");
            if (buildWrap.querySelector('a') !== null) {
                let btn = document.createElement('button');
                btn.classList.add('upgrade');
                btn.setAttribute('disabled', '');
                btn.setAttribute('data-technology', qs('#technologydetails').attributes['data-technology-id'].value);
                let span = document.createElement('span');
                span.classList.add('tooltip');
                span.setAttribute('title', "Not enough resources!");
                span.innerText = "Improve";
                btn.appendChild(span);
                buildWrap.querySelector('a').remove();
                buildWrap.querySelector('p').remove();
                buildWrap.appendChild(btn);
            }
        };
        new MutationObserver(techDeets).observe(qs('#technologydetails_content'), { childList: true });
    });

})();