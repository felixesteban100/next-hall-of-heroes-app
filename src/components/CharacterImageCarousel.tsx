"use client"

import Autoplay from "embla-carousel-autoplay"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Image from "next/image"

export function CharacterImageCarousel({ images, name }: { images: string[], name: string }) {
  return (
    <Carousel
      className="w-80 sm:w-80 rounded-lg overflow-hidden shrink-0"
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
      <CarouselContent className="-ml-0">
        {images.map((image, index) => (
          <CarouselItem key={index} className="pl-0">
            {/* Giving this wrapper an explicit height/width + relative fixes `fill` */}
            <div className="relative h-[24rem] w-full bg-muted rounded-lg overflow-hidden">
              <Image
                src={image}
                alt={`${name}-${index}`}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="object-cover rounded-lg"
                priority={index === 0}
                unoptimized
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}