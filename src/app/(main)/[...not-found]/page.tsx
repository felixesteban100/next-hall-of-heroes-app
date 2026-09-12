import { BrushCleaning } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <BrushCleaning className="w-12 h-12 text-muted-foreground" />
            <h2>Not Found</h2>
            <p>Could not find requested resource</p>
        </div>
    )
}