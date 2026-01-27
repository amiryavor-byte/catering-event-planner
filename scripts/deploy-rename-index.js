const ftp = require("basic-ftp");
require("dotenv").config({ path: ".env.production.local" });
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

async function renameIndex() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        const host = "50.6.108.166";
        const user = process.env.FTP_USER;
        const password = process.env.FTP_PASSWORD || process.env.FTP_PASS;
        const root = "/public_html/api.jewishingenuity.com/catering_app";

        await client.access({
            host,
            user,
            password,
            secure: false
        });

        console.log(`Renaming ${root}/index.html to ${root}/index_bak.html...`);
        try {
            await client.rename(`${root}/index.html`, `${root}/index_bak.html`);
            console.log("✅ Renamed successfully");
        } catch (e) {
            console.log("❌ Rename failed:", e);
        }

    } catch (err) {
        console.error("❌ Failed:", err);
    } finally {
        client.close();
    }
}

renameIndex();
