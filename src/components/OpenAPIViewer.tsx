"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import { Loader2 } from "lucide-react";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
    ),
});

interface OpenAPIViewerProps {
    spec: Record<string, any>;
}

export function OpenAPIViewer({ spec }: OpenAPIViewerProps) {
    return (
        <div className="swagger-wrapper bg-white backdrop-blur-sm rounded-xl overflow-hidden shadow-sm border border-border/50">
            <style jsx global>{`
        .swagger-ui .wrapper {
          padding: 0;
          max-width: none;
        }
        .swagger-ui .topbar {
            display: none;
        }
        .swagger-ui .info {
            padding: 2rem;
            margin: 0;
        }
        .swagger-ui .scheme-container {
            padding: 1rem 2rem;
            background: transparent;
            box-shadow: none;
            border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        .swagger-ui .opblock-tag {
            padding: 1rem 2rem;
            border-bottom: 1px solid rgba(0,0,0,0.1);
            margin: 0;
        }
        .swagger-ui .opblock {
            margin: 0 2rem 1rem;
            border-radius: 8px;
            box-shadow: none;
            border: 1px solid rgba(0,0,0,0.1);
        }
      `}</style>
            <SwaggerUI spec={spec} />
        </div>
    );
}
