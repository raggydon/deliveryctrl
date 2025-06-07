// app/components/LoadingScreen.tsx

import React from "react";

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
            <img
                src="/path-to-your-cat-loading.gif"
                alt="Loading..."
                className="w-32 h-32"
            />
        </div>
    );
}
