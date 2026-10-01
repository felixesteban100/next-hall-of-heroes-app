if (typeof window !== "undefined") {
    window.onerror = function (msg, url, lineNo, columnNo, error) {
        alert("Mobile JS Crash: " + msg + " at line " + lineNo);
        return false;
    };
}