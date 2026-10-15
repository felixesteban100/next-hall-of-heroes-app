"use client"

import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { CharacterImage } from "../shared/CharacterImage"

export function CharacterImageCarousel({ images, name, imageFocus }: { images: { [key: string]: string }, name: string, imageFocus: string }) {
  return (
    <Carousel
      className="w-80 h-[24rem] rounded-lg overflow-hidden shrink-0"
      plugins={[
        Autoplay({
          delay: 2500,
        }),
      ]}
      opts={{
        loop: true,
        align: "start",
      }}
    >
      <CarouselContent className="-ml-0 h-full">
        {Object.entries(images).map(([key, image], index) => (
          <CarouselItem key={index} className="pl-0 h-full">
            <div className="relative h-[24rem] w-full bg-muted rounded-lg overflow-hidden">
              <CharacterImage
                src={image}
                alt={`${name}-${index}`}
                imageFocus={key == "md" ? imageFocus : null}
                width={400}
                height={500}
                className="w-full h-full rounded-xl"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}