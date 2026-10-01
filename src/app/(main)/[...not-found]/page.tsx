import { BrushCleaning } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center">
            <BrushCleaning className="w-12 h-12 text-muted-foreground" />
            <h2>404 - Page Not Found</h2>
            <p>The hero or page you are looking for does not exist.</p>
        </div>
    )
}