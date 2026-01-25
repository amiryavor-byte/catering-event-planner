const ftp = require("basic-ftp");

async function test() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log("Connecting (rriczdte_amir, secure: false)...");
        await client.access({
            host: "75.203.51.130",
            user: "rriczdte_amir",
            password: "Ramir751!!0102",
            secure: false
        });
        console.log("Connected! Listing files...");
        const list = await client.list("/public_html/catering_app");
        console.log(list);
    } catch (err) {
        console.error("Error:", err);
    }
    client.close();
}
test();
