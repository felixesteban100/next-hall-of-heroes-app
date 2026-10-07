import { CircleQuestionMark, Frown, Meh, Smile } from "lucide-react";

export function CharacterBadgeIcon(alignment: string) {
    switch (alignment) {
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

export function getAligmentIcon(alignment: string) {
    switch (alignment) {
        case "good":
            return Smile;
        case "neutral":
            return Meh;
        case "bad":
            return Frown
        default:
            return CircleQuestionMark;
    }
}