import { createApp } from "./app";
import { getConfig } from "./config";

createApp().then(app => {
    const { port } = getConfig();
    app.listen(port, () => {
        // eslint-disable-next-line no-console
        console.log(`lebe-web-client-api listening on port ${port}`);
    });
}).catch(err => {
    // eslint-disable-next-line no-console
    console.error("Failed to start lebe-web-client-api:", err);
    process.exit(1);
});
