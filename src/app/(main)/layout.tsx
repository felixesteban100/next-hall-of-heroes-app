import Navbar from "@/components/navbar";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen">
            <header>
                <Navbar />
            </header>
            <div className="p-6">
                {children}
            </div>
        </div>
    )
}
