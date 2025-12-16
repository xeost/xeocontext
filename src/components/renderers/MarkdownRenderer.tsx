"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";
// Consider switching to a theme that adapts or stays dark which is fine for code.

import { Mermaid } from "./Mermaid";

import clsx from "clsx";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="prose prose-zinc dark:prose-invert max-w-none 
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
            prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl
            prose-p:text-muted-foreground prose-p:leading-relaxed
            prose-strong:text-foreground prose-strong:font-semibold
            prose-ul:text-muted-foreground prose-ol:text-muted-foreground
            prose-a:text-primary prose-a:font-medium prose-a:no-underline prose-a:border-b prose-a:border-primary/30 hover:prose-a:border-primary prose-a:transition-colors
            prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-sm
            prose-img:rounded-xl prose-img:shadow-md prose-img:border prose-img:border-border
            prose-blockquote:border-l-primary prose-blockquote:bg-muted/20 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:text-muted-foreground prose-blockquote:not-italic
            [&_pre:has(.mermaid)]:!bg-transparent [&_pre:has(.mermaid)]:!border-none [&_pre:has(.mermaid)]:!shadow-none [&_pre:has(.mermaid)]:!p-0
            ">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw, rehypeSlug]}
                components={{
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";

                        if (!inline && language === "mermaid") {
                            return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                        }

                        if (!inline) {
                            return (
                                <code
                                    className={clsx(
                                        className,
                                        "block bg-[#0d1117] border border-border rounded-xl shadow-sm p-4 overflow-x-auto font-mono text-sm !text-gray-100"
                                    )}
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }

                        return (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
