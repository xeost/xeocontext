"use client";

import dynamic from "next/dynamic";
import { useConfig } from "@/lib/config-context";
import { useEffect, useState } from "react";

const AsyncApiRenderer = dynamic(
    () => import("@/components/renderers/AsyncApiRenderer").then((mod) => mod.AsyncApiRenderer),
    { ssr: false }
);

export default function AsyncApiPage() {
    const { config } = useConfig();
    const [url, setUrl] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (config?.asyncapi && typeof window !== "undefined") {
            // Construct the full URL to the AsyncAPI file
            const cleanPath = config.asyncapi.startsWith('/') ? config.asyncapi : `/${config.asyncapi}`;
            const fullUrl = `${window.location.origin}/content${cleanPath}`;
            setUrl(fullUrl);
        }
    }, [config]);

    if (!config?.asyncapi) return <div>No AsyncAPI file configured.</div>;
    if (!url) return <div>Loading...</div>;

    return (
        <div className="h-full overflow-y-auto w-full px-4 md:px-8 py-10">
            <AsyncApiRenderer url={url} />
        </div>
    );
}
