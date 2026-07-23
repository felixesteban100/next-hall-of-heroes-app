import { Badge } from "./ui/badge";

export default function CharacterBadge({ icon, text, color }: { icon: React.ReactNode; text: string; color: string }) {
    return (
        <Badge /* variant="secondary" */ className={`${color}`}>
            {icon} {text}
        </Badge>
    );
}