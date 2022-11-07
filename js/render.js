await import('./style.js');
const link = document.createElement('a');

export async function render(plaintext) {
    if (plaintext.byteLength < 0x8000000 && confirm('Render contents?')) {
        await import('https://cdn.jsdelivr.net/npm/marked/marked.min.js');

        const container = document.createElement('div');
        container.style = "white-space: pre;user-select: text; font-size: 2vw;";
        const decoded = new TextDecoder().decode(plaintext);
        try {
            const parsed = marked.parse(decoded, { gfm: true, breaks: false });

            try {
                container.setHTML(parsed);
            } catch {
                await import('https://cdn.jsdelivr.net/npm/dompurify/purify.min.js');
                container.innerHTML = DOMPurify.sanitize(parsed);
            }
        } catch {
            container.innerText = decoded;
        }

        document.body.appendChild(container);

    } else {
        URL.revokeObjectURL(link.href);
        link.href = URL.createObjectURL(new Blob([plaintext], { type: 'application/octet-stream' }));
        link.download = 'plaintext';
        link.click();
    }
}