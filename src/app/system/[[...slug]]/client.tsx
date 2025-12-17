"use client";

import dynamic from "next/dynamic";
import { useConfig } from "@/lib/config-context";
import { fetchContent } from "@/lib/api";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useParams } from "next/navigation";
import Link from "next/link";

const MarkdownRenderer = dynamic(
    () => import("@/components/renderers/MarkdownRenderer").then((mod) => mod.MarkdownRenderer),
    { ssr: false }
);

export function SystemPageClient() {
    const { config } = useConfig();
    const params = useParams();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    // Determine current slug from URL or default to first item
    const slug = params?.slug?.[0];

    useEffect(() => {
        const files = config?.files.systemDesign;
        if (Array.isArray(files) && files.length > 0) {
            // Find active file by slug, or default to first file
            const activeFile = slug
                ? files.find((f: any) => f.slug === slug)
                : files[0];

            if (activeFile) {
                setLoading(true);
                fetchContent(activeFile.path)
                    .then(setContent)
                    .catch((err) => console.error("Failed system design content", err))
                    .finally(() => setLoading(false));
            }
        }
    }, [config, slug]);

    if (!config?.files.systemDesign) return null;

    const files = config.files.systemDesign;
    const activeFile = slug ? files.find((f: any) => f.slug === slug) : files[0];
    const activeSlug = activeFile?.slug || files[0].slug;

    if (!Array.isArray(files)) return <div className="p-8 text-destructive">Configuration error: systemDesign should be a list of files.</div>;

    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        if (!content) {
            setToc([]);
            return;
        }

        const lines = content.split("\n");
        const headings: { id: string; text: string; level: number }[] = [];

        // Simple slugify function
        const slugify = (text: string) => {
            return text
                .toString()
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')     // Replace spaces with -
                .replace(/[^\w\-]+/g, '') // Remove all non-word chars
                .replace(/\-\-+/g, '-');  // Replace multiple - with single -
        };

        lines.forEach((line) => {
            const match = line.match(/^(#{1,3})\s+(.*)$/);
            if (match) {
                const level = match[1].length;
                const text = match[2].trim().replace(/`/g, "");
                const id = slugify(text);
                headings.push({ id, text, level });
            }
        });
        setToc(headings);
    }, [content]);

    // Scroll Spy for Table of Contents
    useEffect(() => {
        if (!toc.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        toc.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [toc]);

    return (
        <div className="flex h-full bg-background">
            {/* Left Sidebar */}
            <aside className="w-72 border-r border-border bg-muted/20 overflow-y-auto flex-shrink-0 backdrop-blur-sm p-4">
                <nav className="pt-3 space-y-1">
                    <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Documents
                    </h2>
                    {files.map((file: any) => ( // file type Any for now as config context types might need update
                        <Link
                            key={file.slug}
                            href={`/system/${file.slug}`}
                            className={clsx(
                                "block w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 border",
                                activeSlug === file.slug
                                    ? "bg-gradient-to-r from-violet-500/10 to-blue-500/10 text-violet-600 dark:text-violet-400 font-medium border-violet-200/50 dark:border-violet-800/50 shadow-sm"
                                    : "border-transparent text-muted-foreground hover:bg-violet-500/5 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300"
                            )}
                        >
                            {file.title}
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Content Area + Right Sidebar Container */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth">
                <div className="flex min-h-full">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <div className="max-w-4xl mx-auto w-full px-8 py-10">
                            {loading ? (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                                    Loading content...
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <MarkdownRenderer content={content} />
                                </div>
                            )}
                            <div className="h-20" /> {/* Spacer */}
                        </div>
                    </div>

                    {/* Right Sidebar - TOC */}
                    <aside className="w-72 bg-background/50 hidden xl:block flex-shrink-0 p-4 backdrop-blur-sm">
                        <div className="sticky top-4 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2 pt-3">
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                On this page
                            </h3>
                            <nav className="space-y-2 border-l border-border pl-4">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={clsx(
                                            "block text-sm py-0.5 transition-all duration-200 border-l -ml-[17px] pl-4",
                                            activeId === item.id
                                                ? "border-violet-500 font-medium text-violet-600 dark:text-violet-400"
                                                : item.level === 1
                                                    ? "border-transparent text-foreground hover:text-primary hover:border-border"
                                                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                                        )}
                                        style={{ paddingLeft: item.level > 1 ? `${(item.level - 1) * 1}rem` : undefined }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                                            setActiveId(item.id);
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
