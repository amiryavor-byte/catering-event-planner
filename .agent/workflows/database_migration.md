---
description: Run database migrations safely via terminal
---

1.  **Prepare SQL**: Ensure `php_api/update_schema.sql` (or target script) is uploaded to the server.
2.  **Construct Command**: Use `curl` to trigger the migration endpoint.
   // turbo
3.  **Execute**:
    ```bash
    curl "https://api.jewishingenuity.com/catering_app/migrate.php?secret=migration_secret_key_12345"
    ```
4.  **Verify**: Check the output for `{"success": true}`.
