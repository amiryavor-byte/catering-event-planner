const ftp = require("basic-ftp");
require("dotenv").config({ path: ".env.production.local" });
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function listVerify() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        const host = "sh00078.hostgator.com";
        const user = process.env.FTP_USER;
        const password = process.env.FTP_PASSWORD || process.env.FTP_PASS;
        const target = "/public_html/website_f7ca0a43/catering_app";

        await client.access({
            host,
            user,
            password,
            secure: false
        });

        console.log(`📂 Listing ${target}...`);
        const list = await client.list(target);

        const found = list.find(f => f.name === 'equipment.php');
        if (found) console.log("✅ Found equipment.php:", found);
        else console.log("❌ equipment.php NOT found");

        const foundCompany = list.find(f => f.name === 'company.php');
        if (foundCompany) console.log("✅ Found company.php:", foundCompany);

    } catch (err) {
        console.error("❌ Failed:", err);
    } finally {
        client.close();
    }
}

listVerify();
