const style = document.createElement('style');
style.innerHTML = `
    :root {
        display: flex;
        justify-content: center;
        font-family: monospace;
        font-size: 1.15cm;
    }

    * {
        margin: 0;
        padding: 0;
    }

    a {
        color: purple;
        cursor: pointer;
    }

    h1, h2, h3, h4, h5, h6 {
        text-align: center;
    }

    body {
        display: flex;
        max-width: 90vw;
        min-height: 100vh;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }`;

export function appendBaseStyle() { document.head.appendChild(style); };
export function removeBaseStyle() { document.head.removeChild(style); };
appendBaseStyle();