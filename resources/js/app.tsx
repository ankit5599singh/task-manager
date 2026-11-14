import { createInertiaApp } from "@inertiajs/react";

const appName = import.meta.env.VITE_APP_NAME || "Task Manager";

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: "#4B5563",
    },
});
