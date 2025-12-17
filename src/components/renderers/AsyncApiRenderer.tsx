"use client";

import React from "react";
import AsyncApiComponent from "@asyncapi/react-component";
import "@asyncapi/react-component/styles/default.min.css";
import "./asyncapi.css";

interface AsyncApiRendererProps {
    schema?: string;
    url?: string;
    config?: any;
}

export function AsyncApiRenderer({ schema, url, config }: AsyncApiRendererProps) {
    const componentProps = url
        ? { schema: { url }, config }
        : { schema, config };

    return (
        <div className="asyncapi-container bg-white dark:bg-neutral-950 dark:text-neutral-100 rounded-lg p-4 overflow-x-auto">
            {/* @ts-ignore - Dynamic props */}
            <AsyncApiComponent {...componentProps} />
        </div>
    );
}
