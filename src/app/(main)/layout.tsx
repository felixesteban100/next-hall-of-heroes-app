import Navbar from "@/components/navbar";

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
