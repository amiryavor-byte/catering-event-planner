const ftp = require("basic-ftp");

async function test() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log("Connecting...");
        await client.access({
            host: "75.203.51.130",
            user: "rriczdte", // Trying the prefix user
            password: "Ramir751!!0102",
            secure: true,
            secureOptions: { rejectUnauthorized: false }
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
