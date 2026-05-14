document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // Theme Management
    // ---------------------------------------------------------
    const themeBtn = document.getElementById('theme-toggle');
    const themes = ['dark', 'light', 'mist'];
    let currentThemeIndex = 0; // Starts at dark

    themeBtn.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;
        const newTheme = themes[currentThemeIndex];
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeBtn.textContent = 'Theme: ' + newTheme.charAt(0).toUpperCase() + newTheme.slice(1);
    });

    // ---------------------------------------------------------
    // Data Dictionary
    // ---------------------------------------------------------
    const roastingData = {
        'turkey': {
            name: 'Whole Turkey',
            minsPerPound: 15,
            restTime: 30
        },
        'primerib': {
            name: 'Prime Rib (Medium Rare)',
            minsPerPound: 15,
            restTime: 30
        },
        'pork': {
            name: 'Pork Shoulder',
            minsPerPound: 40,
            restTime: 60
        },
        'brisket': {
            name: 'Beef Brisket',
            minsPerPound: 60,
            restTime: 60
        }
    };

    // ---------------------------------------------------------
    // DOM Elements
    // ---------------------------------------------------------
    const meatTypeInput = document.getElementById('meat-type');
    const meatWeightInput = document.getElementById('meat-weight');
    const targetTimeInput = document.getElementById('target-time');
    const generateBtn = document.getElementById('generate-btn');
    const timelineOutput = document.getElementById('timeline-output');
    const copyBtn = document.getElementById('copy-btn');

    // ---------------------------------------------------------
    // Core Logic
    // ---------------------------------------------------------
    function formatTime(dateObj) {
        let hours = dateObj.getHours();
        let minutes = dateObj.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        return `${hours}:${minutes} ${ampm}`;
    }

    function generateTimeline() {
        const meatKey = meatTypeInput.value;
        const weight = parseFloat(meatWeightInput.value);
        const targetTimeStr = targetTimeInput.value; // e.g. "18:00"

        if (!meatKey || isNaN(weight) || weight <= 0 || !targetTimeStr) {
            alert('Please enter a valid weight and target time.');
            return;
        }

        const data = roastingData[meatKey];
        
        // Step 4 (Serve): Target Dinner Time
        // Create a date object for today at the specific time
        const [targetHours, targetMinutes] = targetTimeStr.split(':').map(Number);
        const serveTime = new Date();
        serveTime.setHours(targetHours, targetMinutes, 0, 0);

        // Step 3 (Rest)
        // Subtract rest time to get the "Pull from Oven" time
        const pullTime = new Date(serveTime.getTime() - (data.restTime * 60000));

        // Step 2 (Cook)
        // Multiply weight by mins/pound. Subtract from pullTime.
        const totalCookTimeMins = Math.round(weight * data.minsPerPound);
        const ovenTime = new Date(pullTime.getTime() - (totalCookTimeMins * 60000));

        // Step 1 (Preheat)
        // Subtract 30 minutes from oven time
        const preheatTime = new Date(ovenTime.getTime() - (30 * 60000));

        // Render to DOM
        timelineOutput.innerHTML = `
            <li>
                <div class="timeline-step">Step 1: Preheat</div>
                <div class="timeline-time">${formatTime(preheatTime)}</div>
                <div class="timeline-desc">Turn oven on to target temperature.</div>
            </li>
            <li>
                <div class="timeline-step">Step 2: Put in Oven</div>
                <div class="timeline-time">${formatTime(ovenTime)}</div>
                <div class="timeline-desc">Roast ${weight} lbs of ${data.name} for ~${totalCookTimeMins} mins.</div>
            </li>
            <li>
                <div class="timeline-step">Step 3: Rest</div>
                <div class="timeline-time">${formatTime(pullTime)}</div>
                <div class="timeline-desc">Pull from oven and let rest for ${data.restTime} mins.</div>
            </li>
            <li>
                <div class="timeline-step">Step 4: Serve</div>
                <div class="timeline-time">${formatTime(serveTime)}</div>
                <div class="timeline-desc">Carve and enjoy your perfect ${data.name}!</div>
            </li>
        `;
    }

    generateBtn.addEventListener('click', generateTimeline);

    // ---------------------------------------------------------
    // Clipboard Logic
    // ---------------------------------------------------------
    copyBtn.addEventListener('click', () => {
        const items = timelineOutput.querySelectorAll('li');
        if (items.length === 0 || items[0].classList.contains('placeholder-text')) {
            alert('Please generate a timeline first.');
            return;
        }

        let clipboardText = "Reverse Roasting Timeline\n-------------------------\n";
        items.forEach(item => {
            const step = item.querySelector('.timeline-step').innerText;
            const time = item.querySelector('.timeline-time').innerText;
            const desc = item.querySelector('.timeline-desc').innerText;
            clipboardText += `${time} | ${step}\n  - ${desc}\n\n`;
        });

        navigator.clipboard.writeText(clipboardText).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy text.');
        });
    });
});
