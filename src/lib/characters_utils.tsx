import { CircleQuestionMark, Frown, Meh, Smile } from "lucide-react";

export function CharacterBadgeIcon(Alignment: string) {
    switch (Alignment) {
        case "good":
            return <Smile className="" />;
        case "neutral":
            return <Meh className="" />;
        case "bad":
            return <Frown className="" />;
        default:
            return <CircleQuestionMark className="" />;
    }
}