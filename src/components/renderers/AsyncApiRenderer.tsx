"use client";

import React from "react";
import AsyncApiComponent from "@asyncapi/react-component";
import "@asyncapi/react-component/styles/default.min.css";
import "./asyncapi.css";

interface AsyncApiRendererProps {
    schema: string;
}

export function AsyncApiRenderer({ schema }: AsyncApiRendererProps) {
    return (
        <div className="asyncapi-container bg-white rounded-lg p-4 overflow-x-auto">
            <AsyncApiComponent schema={schema} />
        </div>
    );
}
