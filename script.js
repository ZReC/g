const body = document.body;
const style = document.createElement('link'); {
    style.rel = 'stylesheet';
    style.href = '/style.css';
    const done = new Promise(r => style.onload = () => r());
    document.head.appendChild(style);
    await done;
}

const fileOpen = document.createElement('input');
fileOpen.type = 'file';
const advice = document.createElement('div');
advice.style.textAlign = 'center';
advice.style.justifySelf = 'center';
advice.innerHTML = `<div></div><div style="margin-top: 1em;padding: 1em;border: dashed;border-radius: 1em;color: dimgrey;font-style: italic;"><span id="open-file"><a>open</a>/drop/paste file</span> or <a onclick="location.href = './create.htm'">create</a></div>`;
const msg = advice.firstElementChild;

async function loadFile(e, items) {
    if (!items[0])
        return;

    e.preventDefault();
    const entry = ['getAsEntry', 'webkitGetAsEntry'].find(m => items[m]);
    if (entry && items[entry]().isDirectory) {
        throw "won't handle a directory";
    }

    if (items.length > 1)
        throw "won't handle more than one file";

    const file = items[0].constructor == File ? items[0] : items[0].getAsFile();
    loadBuffer(await new Response(file).arrayBuffer()).catch(o => init(o));
}

advice.querySelector('#open-file').addEventListener('click', e => {
    fileOpen.value = '';
    fileOpen.click();
});

fileOpen.addEventListener('change', e =>
    loadFile(e, e.target.files));
addEventListener('paste', e =>
    loadFile(e, [...e.clipboardData.items].filter(i => i.kind == 'file')));
addEventListener('drop', e =>
    loadFile(e, [...e.dataTransfer.items].filter(i => i.kind == 'file')));
addEventListener('dragover', e => e.preventDefault());

const hyper = document.createElement('a');
let container, urlObject;

async function render(mime, plaintext) {
    let [type, subtype] = mime.split('/');
    if (plaintext.byteLength < 0x8000000 && confirm('Render contents?')) {
        body.innerHTML = '';
        URL.revokeObjectURL(urlObject);
        const tD = new TextDecoder();

        try {
            switch (type) {
                case '':
                case 'text':
                    switch (subtype) {
                        case 'md':
                        case 'x-markdown':
                        case 'markdown':
                            await import('https://cdn.jsdelivr.net/npm/marked/marked.min.js');

                            const parsed = marked.parse(tD.decode(plaintext), { gfm: true, breaks: false });
                            container = document.createElement('div');

                            try {
                                container.setHTML(parsed);
                            } catch {
                                await import('https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js');
                                container.innerHTML = DOMPurify.sanitize(parsed);
                            }
                            break;
                        default:
                            throw 'rendering as plaintext';
                    }
                    break;
                case 'image':
                    type = 'img';
                case 'video':
                case 'audio':
                    container = document.createElement(type);
                    urlObject = URL.createObjectURL(new Blob([plaintext], { type: mime }));
                    container.controls = true;
                    container.src = urlObject;
                    break;
                default:
                    throw `can't parse mime`;
            }

        } catch (e) {
            container = document.createElement('div');
            container.innerText = tD.decode(plaintext);
        }

        container.style = 'white-space: pre;user-select: text; font-size: 2vw;';
        body.appendChild(container);

    } else {
        const [fmime, fname] = type ? [mime, type] : ['application/octet-stream', `plaintext${subtype ? `.${subtype}` : ''}`];
        hyper.href = URL.createObjectURL(new Blob([plaintext], { type: fmime }));
        hyper.download = fname;
        hyper.click();
    }
}

const passfield = document.createElement('div');
passfield.className = 'field';
passfield.innerHTML = `
    <input id="pass" type="password" placeholder="pass needed">
    <svg id="pass-btn" width="100%" viewBox="0 0 48 48">
        <path fill="currentColor"
            d="M11 16.3h19.5v-4.8q0-2.7-1.9-4.6Q26.7 5 24 5q-2.7 0-4.6 1.9-1.9 1.9-1.9 4.6h-3q0-3.95 2.775-6.725Q20.05 2 24 2q3.95 0 6.725 2.775Q33.5 7.55 33.5 11.5v4.8H37q1.25 0 2.125.875T40 19.3V41q0 1.25-.875 2.125T37 44H11q-1.25 0-2.125-.875T8 41V19.3q0-1.25.875-2.125T11 16.3ZM11 41h26V19.3H11V41Zm13-7q1.6 0 2.725-1.1t1.125-2.65q0-1.5-1.125-2.725T24 26.3q-1.6 0-2.725 1.225T20.15 30.25q0 1.55 1.125 2.65Q22.4 34 24 34Zm-13 7V19.3 41Z" />
    </svg>`;

const pass = passfield.querySelector('#pass');
const passBtn = passfield.querySelector('#pass-btn');

function password(buffer) {
    body.innerHTML = '';
    body.appendChild(passfield);
    pass.focus();
    return new Promise(r => {
        const send = async () => {
            try {
                r(await undoAES(buffer, pass.value));
                body.removeChild(passfield);
            } finally {
                pass.value = '';
            };
        };
        pass.onkeyup = e => e.key == 'Enter' && send();
        passBtn.onclick = e => send();
    });
};

window.onhashchange = () => loadHash().catch(o => init(o));

export async function init(how) {
    switch (how.constructor) {
        case DataView:
            how = await password(how.buffer);
        case Array:
            render(how[0], how[1]);
            break;
        default:
            body.innerHTML = '';
            msg.innerText = how;
            body.appendChild(advice);
    }
}