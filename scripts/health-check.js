const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const HEALTH_CHECK_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/company.php`
    : "https://api.jewishingenuity.com/catering_app/company.php";

async function performHealthCheck() {
    console.log(`🩺 Running health check on ${HEALTH_CHECK_URL}...`);
    try {
        const response = await fetch(HEALTH_CHECK_URL);
        if (response.ok) {
            console.log("✅ Health check passed! API is responsive.");
            return true;
        } else {
            console.error(`⚠️ Health check failed with status: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.error("❌ Health check failed to connect:", error.message);
        return false;
    }
}

if (require.main === module) {
    performHealthCheck().then((success) => {
        if (!success) process.exit(1);
    });
}

module.exports = { performHealthCheck };
