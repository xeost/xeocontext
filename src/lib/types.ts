export interface XeoConfig {
    title: string;
    logo?: string;
    files: {
        systemDesign?: { title: string; path: string; slug?: string; }[];
        openapi?: string;
        asyncapi?: string;
    };
}

