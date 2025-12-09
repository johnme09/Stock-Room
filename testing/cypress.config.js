import { defineConfig } from "cypress";

export default defineConfig({
    projectId: '5wkuuc',
    e2e: {
        baseUrl: "http://localhost:5173",
        setupNodeEvents(on, config) {

        },
    },
});