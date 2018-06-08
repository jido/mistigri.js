// Minimal promise shim to use with Mistigri if the real deal is not available

function Promise(execute) {
    this.then = execute;
    this.catch = function catchNothing(_) {
        return this;
    }
}

if (typeof module !== 'undefined') module.exports = {Promise: Promise};