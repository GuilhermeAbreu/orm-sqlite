import { Example } from '@capacitor&#x2F;orm-sqlite';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    Example.echo({ value: inputValue })
}
