const ftp = require("basic-ftp");

async function test() {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
        console.log("Connecting (ftp.jewishingenuity.com)...");
        await client.access({
            host: "ftp.jewishingenuity.com",
            user: "rriczdte",
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
