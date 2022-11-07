await import('./style.js');

const fileOpen = document.createElement('input');
fileOpen.type = 'file';
const advice = document.createElement('div');
advice.style.textAlign = 'center';
advice.style.justifySelf = 'center';
advice.innerHTML = `<div></div><div style="margin-top: 1em;padding: 1em;border: dashed;border-radius: 1em;color: dimgrey;font-style: italic;"><span id="open-file"><a>open</a>/drop/paste file</span> or <a onclick="location.href = './create.htm'">create</a></div>`; const msg = advice.firstElementChild;

export function def(e) {
    msg.innerText = e;
    document.body.appendChild(advice);
}

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
    advice.parentNode == document.body && document.body.removeChild(advice);
    loadContents(await new Response(file).arrayBuffer());
}

advice.querySelector('#open-file').addEventListener('click', e => {
    fileOpen.click();
});

fileOpen.addEventListener('change', e =>
    loadFile(e, e.target.files));
addEventListener('paste', e =>
    loadFile(e, [...e.clipboardData.items].filter(i => i.kind == 'file')));
addEventListener('drop', e =>
    loadFile(e, [...e.dataTransfer.items].filter(i => i.kind == 'file')));
addEventListener('dragover', e => e.preventDefault());