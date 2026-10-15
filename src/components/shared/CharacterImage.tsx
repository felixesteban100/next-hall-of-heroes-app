// components/common/CharacterImage.tsx
import Image from "next/image";

interface CharacterImageProps {
    src?: string | null;
    alt: string;
    imageFocus?: string | null;
    fill?: boolean;
    width?: number;
    height?: number;
    className?: string;
    priority?: boolean;
    unoptimized?: boolean;
}

/**
 * Parses imageFocus string from MongoDB.
 * Supports formats: 
 * - "50% 18%" (position only)
 * - "50% 18% 1.5" (position + zoom scale)
 */
function parseImageFocus(imageFocus?: string | null) {
    if (!imageFocus) return { objectPosition: "50% 18%", scale: 0 };

    const parts = imageFocus.trim().split(" ");
    if (parts.length >= 3) {
        return {
            objectPosition: `${parts[0]} ${parts[1]}`,
            scale: parseFloat(parts[2]) || 0,
        };
    }
    return {
        objectPosition: imageFocus,
        scale: 0,
    };
}

export function CharacterImage({
    src,
    alt,
    imageFocus,
    fill = false,
    width = 800,
    height = 800,
    className = "",
    priority = false,
    unoptimized = true, // Default true for Pinterest/external hotlinks
}: CharacterImageProps) {
    const { objectPosition, scale } = parseImageFocus(imageFocus);

    const fallbackSrc = "/placeholder-character.png"; // Replace with your default placeholder path if desired
    const imageSrc = src && src !== "-" && src.trim() !== "" ? src : fallbackSrc;

    return (
        <div className={`relative overflow-hidden ${className}`}>
            <div
                className="relative w-full h-full transition-transform duration-200"
                style={{
                    transform: scale > 1 ? `scale(${scale})` : undefined,
                    transformOrigin: objectPosition,
                }}
            >
                <Image
                    src={imageSrc}
                    alt={alt}
                    fill={fill}
                    width={!fill ? width : undefined}
                    height={!fill ? height : undefined}
                    priority={priority}
                    unoptimized={unoptimized}
                    className="object-cover w-full h-full"
                    style={{ objectPosition }}
                />
            </div>
        </div>
    );
}