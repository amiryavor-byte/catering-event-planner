const ftp = require("basic-ftp");
const path = require("path");
require("dotenv").config({ path: ".env.production.local" });
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const LOCAL_FILE = path.join(__dirname, "../php_api/index.html");
const REMOTE_PATH = "/public_html/website_f7ca0a43/catering_app/index.html";

async function deployProbe() {
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        const host = "50.6.108.166";
        const user = process.env.FTP_USER;
        const password = process.env.FTP_PASSWORD || process.env.FTP_PASS;

        await client.access({
            host,
            user,
            password,
            secure: false
        });

        console.log(`⬆️ Uploading ${LOCAL_FILE} to ${REMOTE_PATH}...`);
        await client.uploadFrom(LOCAL_FILE, REMOTE_PATH);
        console.log("✅ Upload complete");

    } catch (err) {
        console.error("❌ Failed:", err);
    } finally {
        client.close();
    }
}

deployProbe();
