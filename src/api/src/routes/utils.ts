export function slugify(s?: string): string {
    return (s || "").toLowerCase()
        .replace(/[äöü ]/g, m => ({ "ä": "ae", "ö": "oe", "ü": "ue", " ": "-" } as Record<string, string>)[m])
        .replace(/[^a-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function today(): string {
    return new Date().toISOString().slice(0, 10);
}
