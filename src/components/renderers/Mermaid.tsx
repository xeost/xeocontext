import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

mermaid.initialize({
    startOnLoad: false,
});

export function Mermaid({ chart }: { chart: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const [svg, setSvg] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Reset mermaid for theme change
        mermaid.initialize({
            startOnLoad: false,
            theme: theme === "dark" ? "dark" : "default",
            fontFamily: "\"Geist\", sans-serif",
            fontSize: 14,
        });
    }, [theme]);

    useEffect(() => {
        if (chart && ref.current) {
            const render = async () => {
                try {
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    setSvg(svg);
                } catch (error) {
                    console.error("Mermaid rendering error:", error);
                    setSvg(`<pre class="text-destructive">${error}</pre>`);
                }
            };
            render();
        }
    }, [chart, theme]);

    // Cleanup scrolling when modal is open and handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsModalOpen(false);
            }
        };

        if (isModalOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isModalOpen]);

    return (
        <>
            <div className="relative group my-8">
                <div
                    ref={ref}
                    className="mermaid flex justify-center p-6 rounded-xl overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="absolute top-3 right-3 p-2 bg-muted/80 hover:bg-muted backdrop-blur-md border border-border rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-foreground shadow-sm"
                    title="Expand"
                >
                    <Maximize2 className="w-4 h-4" />
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-xl p-6 animate-in fade-in duration-200">
                    <div className="w-full h-full rounded-2xl flex flex-col overflow-hidden relative border border-border bg-card/30 shadow-2xl">

                        <TransformWrapper
                            initialScale={3}
                            minScale={0.5}
                            maxScale={20}
                            centerOnInit
                        >
                            {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                                <>
                                    {/* Controls overlay */}
                                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 bg-background/60 backdrop-blur-md p-1.5 rounded-full border border-border/50 shadow-lg">
                                        <button
                                            onClick={() => zoomIn()}
                                            className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-colors"
                                            title="Zoom In"
                                        >
                                            <ZoomIn className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-border/50" />
                                        <button
                                            onClick={() => zoomOut()}
                                            className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-colors"
                                            title="Zoom Out"
                                        >
                                            <ZoomOut className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-border/50" />
                                        <button
                                            onClick={() => centerView(3)}
                                            className="p-2 hover:bg-accent text-muted-foreground hover:text-foreground rounded-full transition-colors"
                                            title="Reset"
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Close Button */}
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="absolute top-6 right-6 z-20 p-2.5 bg-background/60 hover:bg-destructive hover:text-destructive-foreground backdrop-blur-md text-muted-foreground rounded-full border border-border/50 transition-all duration-200 shadow-lg"
                                        title="Close"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    <div className="flex-1 w-full h-full flex items-center justify-center cursor-move">
                                        <TransformComponent
                                            wrapperClass="!w-full !h-full"
                                            contentClass="!w-full !h-full flex items-center justify-center"
                                        >
                                            <div
                                                className="min-w-min min-h-min p-10"
                                                dangerouslySetInnerHTML={{ __html: svg }}
                                            />
                                        </TransformComponent>
                                    </div>
                                </>
                            )}
                        </TransformWrapper>
                    </div>
                </div>
            )}
        </>
    );
}
