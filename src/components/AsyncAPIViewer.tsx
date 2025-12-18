"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

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

    useEffect(() => {
        if (componentRef.current && schema) {
            // Pass the schema object directly to the property
            (componentRef.current as any).schema = schema;
        }
    }, [schema]);

    if (!schema) return null;

    return (
        <div className="asyncapi-wrapper bg-white backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-border/50 min-h-[500px] relative">
            <Script
                src="https://unpkg.com/@asyncapi/web-component@next/lib/asyncapi-web-component.js"
                strategy="lazyOnload"
            />

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
                cssImportPath="/assets/asyncapi.min.css"
                config='{"showErrors": true, "sidebar": {"show": true}}'>
                {/* @ts-ignore - Web Component */}
            </asyncapi-component>
        </div>
    );
}
