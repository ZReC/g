await import('./style.js');
const link = document.createElement('a');
let urlObject;


export async function render(mime, plaintext) {
    if (plaintext.byteLength < 0x8000000 && confirm('Render contents?')) {
        let container, [type, subtype] = mime.split('/');
        const tD = new TextDecoder();

        URL.revokeObjectURL(urlObject);
        try {
            switch (type) {
                case '':
                case 'text':
                    switch(subtype) {
                        case 'x-markdown':
                        case 'markdown':
                            await import('https://cdn.jsdelivr.net/npm/marked/marked.min.js');

                            const parsed = marked.parse(tD.decode(plaintext), { gfm: true, breaks: false });
                            container = document.createElement('div');
        
                            try {
                                container.setHTML(parsed);
                            } catch {
                                await import('https://cdn.jsdelivr.net/npm/dompurify/purify.min.js');
                                container.innerHTML = DOMPurify.sanitize(parsed);
                            }
                            break;
                        default:
                            throw 'render as plain';
                    }
                    break;
                case 'image':
                    type = 'img';
                case 'video':
                case 'audio':
                    container = document.createElement(type);
                    urlObject = URL.createObjectURL(new Blob([plaintext], {type: mime}));
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

        container.style = "white-space: pre;user-select: text; font-size: 2vw;";
        document.body.appendChild(container);

    } else {
        URL.revokeObjectURL(link.href);
        link.href = URL.createObjectURL(new Blob([plaintext], { type: mime }));
        link.download = 'plaintext';
        link.click();
    }
}