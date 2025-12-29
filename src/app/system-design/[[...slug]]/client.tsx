"use client";

import dynamic from "next/dynamic";
import { useConfig } from "@/lib/config-context";
import { fetchContent } from "@/lib/api";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronDown, List, FileText, ArrowLeft, ArrowRight } from "lucide-react";
import { NavItem, NavGroup } from "@/lib/types";

const MarkdownRenderer = dynamic(
    () => import("@/components/renderers/MarkdownRenderer").then((mod) => mod.MarkdownRenderer),
    { ssr: false }
);

export function SystemPageClient() {
    const { config } = useConfig();
    const params = useParams();
    const router = useRouter();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState<"menu" | "toc">("menu");

    // Determine current slug path
    // If slug is empty (root), it is [], which join gives "" -> "/"
    const slugPath = params?.slug && Array.isArray(params.slug)
        ? "/" + params.slug.join("/")
        : "/";

    // Flatten navigation for easy next/prev and searching
    const allItems: NavItem[] = [];
    if (config?.navigation) {
        config.navigation.forEach((group: NavGroup) => {
            if (group.items) {
                allItems.push(...group.items);
            }
        });
    }

    // Find active item
    const activeItem = allItems.find(item => item.href === slugPath) || allItems[0];

    // Redirect if needed (e.g. if we are at /system but root item is something else, or invalid slug)
    // Actually, if activeItem is found, use it. If not, default to first item but update URL?
    // If slugPath is provided but not found, maybe 404 or redirect to first.
    // For now, if no match found, show first item content but keep URL - or redirect?
    // Let's stick to showing activeItem found or first one.

    useEffect(() => {
        // If we found a direct match in the navigation, use it.
        // However, we also need to handle the case where the user navigates to a folder path
        // (e.g. /system/global/architecture) that isn't explicitly in the nav items as a page,
        // but physically exists or conceptually maps to a child.

        async function load() {
            setLoading(true);
            try {
                // 1. If we have a direct active item from config (exact match), try to load it.
                if (activeItem) {
                    // Special case: If we are at root ("/" slugPath) but the resolved activeItem (defaults to first item) 
                    // is NOT explicitly for "/", we should redirect to that item's URL.
                    // This handles "landing on /system-design" -> "redirect to first article".
                    if (slugPath === "/" && activeItem.href !== "/") {
                        const target = `/system-design${activeItem.href}`; // item.href is like "/global/architecture"
                        router.replace(target);
                        return; // Stop loading content for root, just redirect
                    }

                    let possiblePaths = [];
                    if (activeItem.href === "/") {
                        possiblePaths.push("README.md", "index.md");
                    } else {
                        possiblePaths.push(`${activeItem.href}.md`);
                        possiblePaths.push(`${activeItem.href}/readme.md`);
                        possiblePaths.push(`${activeItem.href}/index.md`);
                    }

                    // Try loading exact content
                    for (const p of possiblePaths) {
                        try {
                            const found = await fetchContent(p);
                            if (found) {
                                setContent(found);
                                setLoading(false);
                                return;
                            }
                        } catch (e) { /* ignore */ }
                    }
                }

                // 2. If no direct content found (or no activeItem matched exactly), 
                // we might be at a directory path. We should look for the *first* child 
                // in the navigation tree that starts with this prefix.

                // Filter items that strictly start with current path
                // e.g. slugPath = /global/architecture
                // candidates: /global/architecture/system-overview, /global/architecture/decisions...
                const cleanSlug = slugPath === "/" ? "" : slugPath;
                const candidate = allItems.find(item =>
                    item.href.startsWith(cleanSlug + "/") && item.href !== cleanSlug
                );

                if (candidate) {
                    // Redirect to the first available child
                    const target = candidate.href === "/" ? "/system-design" : `/system-design${candidate.href}`;
                    router.replace(target);
                    return;
                }

                // 3. Fallback: No content and no children found.
                setContent("# Content not found\nCould not load content for this path.");

            } catch (err) {
                console.error("Failed system design content", err);
                setContent("# Error\nFailed to load content.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [activeItem, config, slugPath, router]);

    // Close mobile menu on slug change
    useEffect(() => {
        setIsMobileNavOpen(false);
    }, [slugPath]);

    if (!config?.navigation) return null;

    const activeIndex = allItems.findIndex(item => item === activeItem);
    const prevItem = activeIndex > 0 ? allItems[activeIndex - 1] : null;
    const nextItem = activeIndex < allItems.length - 1 ? allItems[activeIndex + 1] : null;

    // TOC Logic
    const [toc, setToc] = useState<{ id: string; text: string; level: number }[]>([]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        if (!content) {
            setToc([]);
            return;
        }

        const lines = content.split("\n");
        const headings: { id: string; text: string; level: number }[] = [];
        const slugify = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

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

    useEffect(() => {
        if (!toc.length) return;
        const observer = new IntersectionObserver((entries) => { entries.forEach((entry) => { if (entry.isIntersecting) { setActiveId(entry.target.id); } }); }, { rootMargin: "0px 0px -80% 0px" });
        toc.forEach((item) => { const element = document.getElementById(item.id); if (element) observer.observe(element); });
        return () => observer.disconnect();
    }, [toc]);

    // Render helper for sidebar links
    const renderSidebarLink = (item: NavItem) => {
        // Construct the link href. 
        // If item.href is "/", link to "/system"
        // Else link to "/system" + item.href (removing leading slash if needed to look clean, or just append)
        // Actually, our route is /system/[[...slug]].
        // If href is /global/infrastructure, we want /system/global/infrastructure.

        const linkHref = item.href === "/" ? "/system-design" : `/system-design${item.href}`;
        const isActive = item.href === slugPath; // exact match

        return (
            <Link
                key={item.href}
                href={linkHref}
                className={clsx(
                    "block w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-300 border",
                    isActive
                        ? "bg-linear-to-r from-violet-500/10 to-blue-500/10 text-violet-600 dark:text-violet-400 font-medium border-violet-200/50 dark:border-violet-800/50 shadow-sm"
                        : "border-transparent text-muted-foreground hover:bg-violet-500/5 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-300"
                )}
            >
                {item.title}
            </Link>
        );
    };

    return (
        <div className="flex flex-col xl:flex-row h-full bg-background">
            {/* Mobile Navigation Bar */}
            <div className="xl:hidden border-b border-border bg-muted/20">
                <button
                    onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium"
                >
                    <span className="flex items-center text-foreground">
                        <FileText className="w-4 h-4 mr-2 opacity-70" />
                        {activeItem?.title || "System Design"}
                    </span>
                    <ChevronDown className={clsx("w-4 h-4 text-muted-foreground transition-transform", isMobileNavOpen ? "rotate-180" : "")} />
                </button>

                {isMobileNavOpen && (
                    <div className="border-t border-border bg-background/95 backdrop-blur-sm animate-in slide-in-from-top-2 shadow-lg">
                        <div className="flex border-b border-border">
                            <button onClick={() => setMobileTab("menu")} className={clsx("flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors border-b-2", mobileTab === "menu" ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:bg-muted/50")}>
                                <FileText className="w-4 h-4 mr-2" /> Documents
                            </button>
                            <button onClick={() => setMobileTab("toc")} className={clsx("flex-1 flex items-center justify-center py-3 text-sm font-medium transition-colors border-b-2", mobileTab === "toc" ? "text-primary border-primary bg-primary/5" : "text-muted-foreground border-transparent hover:bg-muted/50")}>
                                <List className="w-4 h-4 mr-2" /> On this page
                            </button>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto p-2">
                            {mobileTab === "menu" ? (
                                <nav className="space-y-4 p-2">
                                    {config.navigation.map((group, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group.title}</h3>
                                            {group.items.map(renderSidebarLink)}
                                        </div>
                                    ))}
                                </nav>
                            ) : (
                                <nav className="space-y-1 pl-1">
                                    {toc.length === 0 ? <p className="p-4 text-sm text-muted-foreground text-center">No table of contents available.</p> : toc.map((item) => (
                                        <a key={item.id} href={`#${item.id}`} className={clsx("block text-sm py-2 px-3 rounded-md transition-colors", activeId === item.id ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")} style={{ paddingLeft: `${(item.level - 1) * 1 + 0.75}rem` }} onClick={(e) => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); setActiveId(item.id); setIsMobileNavOpen(false); }}>
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Left Sidebar (Desktop) */}
            <aside className="hidden xl:block w-72 border-r border-border bg-muted/20 overflow-y-auto shrink-0 backdrop-blur-sm p-4">
                <nav className="pt-3 space-y-8">
                    {config.navigation.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                {group.title}
                            </h2>
                            {group.items.map(renderSidebarLink)}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto relative scroll-smooth">
                <div className="flex min-h-full">
                    <div className="flex-1 min-w-0">
                        <div className="max-w-4xl mx-auto w-full px-4 md:px-8 py-10">
                            {loading ? (
                                <div className="flex items-center justify-center h-64 text-muted-foreground">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-3"></div>
                                    Loading content...
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <MarkdownRenderer content={content} />
                                    <div className="mt-16 grid gap-6 md:grid-cols-2 pt-10 border-t border-border/60">
                                        {prevItem ? (
                                            <Link href={prevItem.href === "/" ? "/system-design" : `/system-design${prevItem.href}`} className="group relative p-6 rounded-2xl border border-violet-200/50 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-100/50 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 flex flex-col items-start text-left">
                                                <div className="flex items-center text-xs font-semibold text-violet-600/70 dark:text-violet-400/70 mb-2 uppercase tracking-wider">
                                                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5 transition-transform group-hover:-translate-x-1" /> Previous
                                                </div>
                                                <div className="font-semibold text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">{prevItem.title}</div>
                                            </Link>
                                        ) : <div className="hidden md:block" />}
                                        {nextItem && (
                                            <Link href={nextItem.href === "/" ? "/system-design" : `/system-design${nextItem.href}`} className="group relative p-6 rounded-2xl border border-violet-200/50 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-900/10 hover:bg-violet-100/50 dark:hover:bg-violet-900/30 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-300 flex flex-col items-end text-right">
                                                <div className="flex items-center text-xs font-semibold text-violet-600/70 dark:text-violet-400/70 mb-2 uppercase tracking-wider">
                                                    Next <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-1" />
                                                </div>
                                                <div className="font-semibold text-foreground group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">{nextItem.title}</div>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="h-20" />
                        </div>
                    </div>
                    {/* TOC Sidebar */}
                    <aside className="w-72 bg-background/50 hidden xl:block shrink-0 p-4 backdrop-blur-sm">
                        <div className="sticky top-4 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2 pt-3">
                            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">On this page</h3>
                            <nav className="space-y-2 border-l border-border pl-4">
                                {toc.map((item) => (
                                    <a key={item.id} href={`#${item.id}`} className={clsx("block text-sm py-0.5 transition-all duration-200 border-l -ml-[17px] pl-4", activeId === item.id ? "border-violet-500 font-medium text-violet-600 dark:text-violet-400" : item.level === 1 ? "border-transparent text-foreground hover:text-primary hover:border-border" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")} style={{ paddingLeft: item.level > 1 ? `${(item.level - 1) * 1}rem` : undefined }} onClick={(e) => { e.preventDefault(); document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" }); setActiveId(item.id); }}>
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
