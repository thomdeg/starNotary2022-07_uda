
const Web3 = require('web3');

console.log("Hello");

async function main() {
    return "Hello from main";
}

let text="1";
main().then(s => {text=s; console.log("then...");});
console.log("Text from main:", text);

(async () => {
    console.log("inside my async func");
    let ret = await main();
    console.log("ret:", ret);
})();

