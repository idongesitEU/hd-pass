import {
    ethers
} from "./ethers/dist/ethers.min.js";
/*

unaware about view peanut more legend abandon wrist winter bullet strategy rude

*/
window.InputIs12Words = function(callback = processAuth) {
    const input = document.getElementById("mnemonic-input").value.split(" ");
    if (input.length === 12) {
        callback();
        return true;
    }
}

window.getMatches = function(input) {
    if (InputIs12Words()) return;
    input = input.value.split(" ");
    if (input[input.length - 1] == " ") input.pop();
    const isLastWord = input.length === 12;
    input = input[input.length - 1];
    const pattern = new RegExp(`^(${input})+.*`, "g");
    const matches = words.reduce((acc, word) => {
        if (word.match(pattern)) {
            acc.push(word);
        }
        return acc;
    }, [])
    if (matches.length <= 5) {
        const buttHtml = matches.map((word) => {
            let wordEnd = word.substr(input.length);
            if (!isLastWord) wordEnd += " ";
            return `<button id="matches-${word}" style="font-size:13px;margin:5px; margin-bottom:15px;padding:3px 3px;" onclick="addInput('${wordEnd}', 'mnemonic-input', 'matches-div', InputIs12Words)" > ${word} </button>`;
        }).join("\n");
        document.getElementById("matches-div").innerHTML = buttHtml;
    }
}
window.addInput = function(newInput, id, k, callback) {
    const initial = document.getElementById(id).value;
    document.getElementById(id).value = (initial + newInput);
    if (k) {
        document.getElementById(k).innerHTML = "";
        if (callback) callback;
    }
}
window.togglePhraseVisibility = function() {
    const flipState = {
        "password": "text",
        "text": "password"
    }
    const initialState = document.getElementById("mnemonic-input").type;
    document.getElementById("mnemonic-input").type = flipState[initialState];
}

function getASCIIBytes(string) {
    string = string.split("");
    string.map(s => s.charCodeAt());
    return new Uint8Array(string);
}

function splitStringToN(s, n) {
    const blockSize = Math.round(s.length / n);
    let i = 0;
    let blocks = [];
    while (i < n) {
        if (i * blockSize < s.length) blocks.push(s.substr(i * blockSize, blockSize))

        i++;
    }
    return blocks
}



function hexToUint8Array(hex) {
    hex = hex.split(""); //split to array
    const uInt8 = hex.reduce((acc, b, i, arr) => {
        if ((i + 1) % 2) {
            acc.push(parseInt(arr[i] + arr[i + 1], 16));
        }
        return acc;
    }, []);
    return new Uint8Array(uInt8);
}

function xorArray(a, b) {
    return a.map(function(value, index) {
        return value ^ b[index]
    })
}

function batchXorArray(array2d) {
    return array2d.reduce(function(acc, current) {
        return xorArray(acc, current);
    });
}


function getApprovedChars() {
    let cset = "";
    for (let i = 0; i < 94; i++) {
        cset += String.fromCharCode(i + 33);
    }
    let verbose = "0oOl\"\'|\`\\".split("")
    for (let c of verbose) {
        cset = cset.replace(c, "");
    }
    return cset;
}

function mapASCIIChars(indexArray) {
    const charSet = getApprovedChars();
    const mapedChars = indexArray.map(index => charSet[index % charSet.length]).join("");
    return mapedChars;
}

function mapASCIINumbers(indexArray) {
    let charSet = "";
    for (let i = 0; i < 10; i++) charSet += i;
    const mapedChars = indexArray.map(index => charSet[index % charSet.length]).join("");
    return mapedChars;
}

function getPrivateKeys(mnemonicObj, passwordLength) {
    let privateKeys = [];
    for (let i = 0; i < passwordLength; i++) {
        privateKeys.push(ethers.HDNodeWallet.fromMnemonic(mnemonicObj, `m/44'/60'/0'/0/${i}`).privateKey.toString().replace("0x", ""));
    }
    return privateKeys;
}
let timeout;
window.derivePassword = function(passwordLength = document.getElementById("password-length").value) {
    clearTimeout(timeout);
    passwordLength = parseInt(passwordLength);
    if (passwordLength > 32) {
        alert("invalid password length, must be less than or equal to 32")
        throw "password length must be greater than 32";
    }
    const siteName = document.getElementById("site-input").value;
    const sitePattern = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/g;
    if (siteName == "") {
        alert("site name cannot be empty");
        return
    } else if (siteName.toLowerCase() !== siteName) {
        alert("site name must be in lower case");
        return;
    } else if (!siteName.match(sitePattern)) {
        alert("invalid site name format!!\n\n only lower case and one hyphen allowed");
        return;
    }
    const phrase = document.getElementById("mnemonic-input").value;
    const mnemonicObj = ethers.Mnemonic.fromPhrase(phrase, siteName);
    const privateKeys = getPrivateKeys(mnemonicObj, passwordLength).map(p => hexToUint8Array(p));
    const privateKeyXor = batchXorArray(privateKeys);
    const fullPassword = mapASCIIChars(Array.from(privateKeyXor));
    const password = fullPassword.substr(0, passwordLength);
    document.getElementById("hd-password").innerText = siteName.toUpperCase() + ":\n\n" + password;
    const splitPass = splitStringToN(password, 4).join("\n\n");
    document.getElementById("split-pass").innerText = splitPass;

    timeout = setTimeout(function() {
        document.getElementById("mnemonic-input").value = "";
        location.reload();
    }, 60 * 3 * 1000);
}

window.derivePin = function(pinLength = document.getElementById("pin-length").value) {
    clearTimeout(timeout);
    pinLength = parseInt(pinLength);
    if (pinLength > 32) {
        alert("invalid password length, must be less than or equal to 32")
        throw "password length must be greater than 32";
    }
    const siteName = document.getElementById("site-input").value;
    const sitePattern = /^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$/g;
    if (siteName == "") {
        alert("site name cannot be empty");
        return
    } else if (siteName.toLowerCase() !== siteName) {
        alert("site name must be in lower case");
        return;
    } else if (!siteName.match(sitePattern)) {
        alert("invalid site name format!!\n\n only lower case and one hyphen allowed");
        return;
    }
    const phrase = document.getElementById("mnemonic-input").value;
    const mnemonicObj = ethers.Mnemonic.fromPhrase(phrase, siteName);
    const privateKeys = getPrivateKeys(mnemonicObj, pinLength).map(p => hexToUint8Array(p));
    const privateKeyXor = batchXorArray(privateKeys);
    const fullPin = mapASCIINumbers(Array.from(privateKeyXor));
    const pin = fullPin.substr(0, pinLength);
    document.getElementById("hd-password").innerText = siteName.toUpperCase() + ":\n\n" + pin;
    const splitPass = splitStringToN(pin, 2).join("\n\n");
    document.getElementById("split-pass").innerText = splitPass;
    timeout = setTimeout(function() {
        document.getElementById("mnemonic-input").value = "";
        location.reload();
    }, 60 * 3 * 1000);
}

window.checkAuth = function() {
    const authHash = localStorage.getItem("authHash") || "";
    if (authHash === "") {
        document.getElementById("auth-hash").disabled = false;
    } else {
        document.getElementById("auth-hash").value = localStorage.getItem("authHash");
    }
}
window.processAuth = function() {
    const phrase = document.getElementById("mnemonic-input").value;
    let inputHash = document.getElementById("auth-hash").value;
    if (phrase.split(" ").length != 12) {
        alert("mnemonic must be 12 words");
        return;
    }
    if (inputHash === "") {
        inputHash = ethers.sha512(getASCIIBytes(phrase));
        setProp("authHash", inputHash);
        alert("hash computed successfully\n\n" + inputHash);
        document.getElementById("auth-hash").value = inputHash;
    }
    if (ethers.sha512(getASCIIBytes(phrase)) === getProp("authHash")) {
        document.getElementById("gen-pad").style.display = "block";
        document.getElementById("mnemonic-div").style.display = "none";
        document.getElementById("site-div").style.display = "block";
        document.getElementById('mnemonic-input').removeEventListener('blur', function() {}, true);
    } else {
        alert("invalid input");
    }
}
checkAuth();