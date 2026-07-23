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
      className="h-full max-w-50 sm:max-w-xs"
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      opts={{
        loop: true,
        align: "start",
        containScroll: "trimSnaps",
      }}
    >
      <CarouselContent className="w-full h-full ">
        {images.map((image, index) => (
          <CarouselItem key={index} className="w-full h-full ">
            <Image src={image} alt={`${name}-${index}`} width={300} height={500} className="rounded-lg h-[27rem] w-[50rem] object-cover" />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>

  )
}


{/* <Carousel
      plugins={[plugin.current]}
      className="w-full max-w-[10rem] sm:max-w-xs"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {Array.from({ length: 5 }).map((_, index) => (
          <CarouselItem key={index}>
            <div className="p-1">
              <Card>
                <CardContent className="flex aspect-square items-center justify-center p-6">
                  <span className="text-4xl font-semibold">{index + 1}</span>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel> */}