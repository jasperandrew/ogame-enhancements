(function() {
    if (window.OGameEnhancementsHasRun) return; // Ensure this code only runs once
    window.OGameEnhancementsHasRun = true;

    const RESOURCES = ['metal','crystal','deuterium','energy','food','population','darkmatter'];
    const MINE_RESOURCES = RESOURCES.slice(0,3);
    const TIME = {
        week: { str: 'w', n: 60 * 60 * 24 * 7 },
        day:  { str: 'd', n: 60 * 60 * 24 },
        hour: { str: 'h', n: 60 * 60 },
        min:  { str: 'm', n: 60 }
    }

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
        return new MutationObserver((_, observer) => {
            if (!attemptCallback(s, f)) return; // try again
            observer.disconnect(); // done, stop trying
        }).observe(container, { childList: true });
    };

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
        document.querySelectorAll('#menuTable .premiumHighligt span')
            .forEach(el => el.style.color = 'inherit'); // de-colorize premium menu items
    });

    earlyObserve('.resource_tile.population', el => {
        el.parentElement.insertBefore(el, qs('.resource_tile.darkmatter')); // move population stat right of food
    });

    earlyObserve('#tutorialiconcomponent #helper a', el => {
        let st = el.style;
        st.width = st.height = st.fontSize = st.lineHeight = '15px';
        st.top = st.left = '7px';
    });

    document.addEventListener('DOMContentLoaded', () => {
        const styleSheet = document.head.appendChild(document.createElement('style')).sheet;
        let rule = s => styleSheet.insertRule(s.replaceAll('‽', ' !important'));

        // hide footer (why is this faster than with earlyObserve???)
        rule('#siteFooter { display: none‽; }');
        rule('#chatBar { bottom: 0‽; }'); // move chatbar down

        rule('.build-faster { display: none‽; }');
        rule('#countdownresearchDetails { background: #‽; }');

        // visual improvements
        rule('.icon .level, .icon .amount { padding: 0 3px‽; width: 60%‽; border-top-left-radius: 7px‽; }');
        rule('.icon .targetlevel, .icon .targetamount { padding: 0 3px‽; width: 60%‽; }');
        rule('.targetlevel::before, .targetamount::before { content: "«"; display: inline-block; transform: rotate(90deg); }');

        rule('#resources_metal { color: #9f9c8d‽; }');
        rule('#resources_crystal { color: #a2c3e5‽; }');
        rule('#resources_deuterium { color: #4ebda8‽; }');
        rule('#resources_energy { color: #9c0‽; }');
        rule('#resources_darkmatter { color: #736e79‽; }');
        if (!qs('#resources_energy').classList.contains('overmark'))
            rule('#resources_energy::before { content: "+"; }');

        let resourcePerSec = {};
        RESOURCES.forEach(res => {
            let el = qs(`.resource_tile > #${res}_box`);
            let tip = el.title.split('<tr>');
            tip.splice(1,1);
            if (RESOURCES.indexOf(res) < 3)
                resourcePerSec[res] = Number.parseFloat(/\+?([\d,]+)/.exec(tip[2])[1].split(',').join(''))/3600;
            el.title = tip.join('<tr>');
        });

        let reduceNumber = num => {
            num = Number.parseFloat(num);
            if (!Number.isFinite(num)) return null; // invalid
            num = Number.parseFloat(num.toPrecision(3));
            let n = 0;
            while(num >= 1000){
                num /= 1000;
                n++;
            }
            if (n > 5) return null; // too big
            
            return num.toString() + ['','K','M','B','T','Q'][n];
        };

        let improveResourceCostDisplay = () => {
            document.querySelectorAll('li.resource').forEach(li => {
                let numStr = reduceNumber(li.getAttribute('data-value'));
                if (numStr == null) return;
                li.innerText = numStr;
            });
        };

        let unDarkMatterifyBuildButton = () => {
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

        let buildableTimeElement = null;
        let updateBuildableCountdown = () => {
            if (buildableTimeElement === null) return;
            if (buildableTimeElement.innerText === 'now') return;
            if (buildableTimeElement.innerText === 'Unknown') return;
            
            let secs = Number.parseInt(buildableTimeElement.getAttribute('data-end')) - (Date.now().valueOf() / 1000);
            timeStr = 'now';
            if (secs > 0) {
                timeStr = '';
                for (const t in TIME) {
                    let amt = Math.floor(secs / TIME[t].n);
                    if (amt > 0) timeStr += amt + TIME[t].str + ' ';
                    secs %= TIME[t].n;
                }
                if (secs > 0) timeStr += Math.floor(secs) + 's';
            }
            buildableTimeElement.innerText = timeStr;
        };

        new MutationObserver(() => {
            buildableTimeElement = qs('.possible_build_start time');
            unDarkMatterifyBuildButton();
            improveResourceCostDisplay();
        }).observe(qs('#technologydetails_content'), { childList: true });

        new MutationObserver(() => {
            updateBuildableCountdown();
            console.log('blah');
        }).observe(qs('.OGameClock'), { childList: true });
    });

})();