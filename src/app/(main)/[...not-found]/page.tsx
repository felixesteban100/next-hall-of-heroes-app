import { BrushCleaning } from "lucide-react";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components

export default function NotFound() {
    "use cache"
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <BrushCleaning className="w-12 h-12 text-muted-foreground" />
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
        </div>
    )
}