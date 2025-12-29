"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'asyncapi-component': any;
        }
    }
}

interface AsyncAPIViewerProps {
    schema: any;
}

export function AsyncAPIViewer({ schema }: AsyncAPIViewerProps) {
    const componentRef = useRef<HTMLElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const loadComponent = async () => {
            // @ts-ignore
            await import('@asyncapi/web-component/lib/asyncapi-web-component.js');
            setMounted(true);
        };
        loadComponent();
    }, []);

    useEffect(() => {
        if (componentRef.current && schema) {
            // Pass the schema object directly to the property
            (componentRef.current as any).schema = schema;
        }
    }, [schema]);

    if (!schema) return null;

    // Use correct stylesheet based on theme
    const isDark = mounted && resolvedTheme === "dark";
    const cssPath = isDark ? "/assets/asyncapi-dark.css" : "/assets/asyncapi.min.css";

    return (
        <div className="asyncapi-wrapper bg-white dark:bg-gray-800 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-border/50 dark:border-border/10 min-h-[500px] relative transition-colors duration-300">
            <style jsx global>{`
                /* Hide the default header/logo if possible or style content */
                asyncapi-component {
                    display: block;
                    width: 100%;
                    height: 100%;
                }
            `}</style>

            {/* @ts-ignore - Web Component */}
            <asyncapi-component
                ref={componentRef}
                cssImportPath={cssPath}
                config='{"showErrors": true, "sidebar": {"show": true}}'>
                {/* @ts-ignore - Web Component */}
            </asyncapi-component>
        </div>
    );
}
