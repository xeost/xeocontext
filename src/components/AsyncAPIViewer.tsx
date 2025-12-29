"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import $RefParser from "@apidevtools/json-schema-ref-parser";

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'asyncapi-component': any;
        }
    }
}

interface AsyncAPIViewerProps {
    schema?: any;
    url?: string;
}

export function AsyncAPIViewer({ schema, url }: AsyncAPIViewerProps) {
    const componentRef = useRef<HTMLElement>(null);
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [resolvedSchema, setResolvedSchema] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadComponent = async () => {
            // @ts-ignore
            await import('@asyncapi/web-component/lib/asyncapi-web-component.js');
            setMounted(true);
        };
        loadComponent();
    }, []);

    useEffect(() => {
        async function resolve() {
            if (schema) {
                setResolvedSchema(schema);
                return;
            }
            if (url) {
                try {
                    // Manually dereference to handle $refs in browser environment
                    // This bypasses the web component's internal parser trying to use fs
                    const parsed = await $RefParser.dereference(url);
                    setResolvedSchema(parsed);
                } catch (e: any) {
                    console.error("Failed to resolve AsyncAPI:", e);
                    setError(e.message);
                }
            }
        }
        resolve();
    }, [schema, url]);

    useEffect(() => {
        if (componentRef.current && resolvedSchema) {
            (componentRef.current as any).schema = resolvedSchema;
        }
    }, [resolvedSchema, mounted]);

    if (error) {
        return (
            <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 font-medium">Failed to load AsyncAPI definition</p>
                <p className="text-sm text-red-500/80 mt-2">{error}</p>
            </div>
        );
    }

    if (!schema && !url) return null;

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
