await import('./style.js');

const style = document.createElement('style');
style.innerHTML = `
    .field {
        all: unset;
        display: flex;
        width: fit-content;
        border-color: darkred;
        background-color: darkred;
        border-style: solid;
        border-radius: 1ch;
        overflow: hidden;
    }

    #pass {
        all: unset;
        text-align: initial;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        max-width: 12ch;
        padding: 0 2ch 0 2ch;
        background-color: black;
    }

    #pass::placeholder {
        font-style: italic;
    }

    #pass-btn {
        padding: 0 1vw 0 1vw;
        width: 2ch;
    }
    `;
document.head.appendChild(style);

document.body.innerHTML = `
    <div class="field">
        <input id="pass" type="password" placeholder="pass needed">
        <svg id="pass-btn" width="100%" viewBox="0 0 48 48">
            <path fill="currentColor"
                d="M11 16.3h19.5v-4.8q0-2.7-1.9-4.6Q26.7 5 24 5q-2.7 0-4.6 1.9-1.9 1.9-1.9 4.6h-3q0-3.95 2.775-6.725Q20.05 2 24 2q3.95 0 6.725 2.775Q33.5 7.55 33.5 11.5v4.8H37q1.25 0 2.125.875T40 19.3V41q0 1.25-.875 2.125T37 44H11q-1.25 0-2.125-.875T8 41V19.3q0-1.25.875-2.125T11 16.3ZM11 41h26V19.3H11V41Zm13-7q1.6 0 2.725-1.1t1.125-2.65q0-1.5-1.125-2.725T24 26.3q-1.6 0-2.725 1.225T20.15 30.25q0 1.55 1.125 2.65Q22.4 34 24 34Zm-13 7V19.3 41Z" />
        </svg>
    </div>`;

const pass = document.getElementById('pass');
const passBtn = document.getElementById('pass-btn');

export function getPlain(buffer) {
    return new Promise(r => {
        const send = async () => {
            try {
                r(await undoAES(buffer, pass.value));
                document.body.innerHTML = '';
            } catch (e) {
                pass.value = '';
            };
        };
        pass.onkeyup = e => e.key == 'Enter' && send();
        passBtn.onclick = e => send();
    });
};