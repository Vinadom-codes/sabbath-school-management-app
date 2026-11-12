import { useEffect, useState } from "react";
import bible from '../assets/images/sabbath-bible-scene.png'

const beatitudes = [
  {
    text: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
    reference: "Matthew 5:3",
  },
  {
    text: "Blessed are they that mourn: for they shall be comforted.",
    reference: "Matthew 5:4",
  },
  {
    text: "Blessed are the meek: for they shall inherit the earth.",
    reference: "Matthew 5:5",
  },
  {
    text: "Blessed are they which do hunger and thirst after righteousness: for they shall be filled.",
    reference: "Matthew 5:6",
  },
  {
    text: "Blessed are the merciful: for they shall obtain mercy.",
    reference: "Matthew 5:7",
  },
  {
    text: "Blessed are the pure in heart: for they shall see God.",
    reference: "Matthew 5:8",
  },
  {
    text: "Blessed are the peacemakers: for they shall be called the children of God.",
    reference: "Matthew 5:9",
  },
  {
    text: "Blessed are they which are persecuted for righteousness' sake: for theirs is the kingdom of heaven.",
    reference: "Matthew 5:10",
  },
];

const Hero = () => {

            const [activeIndex, setActiveIndex] = useState(0);

            useEffect(() => {
                const interval = setInterval(() => {
                setActiveIndex((current) =>
                    (current + 1) % beatitudes.length
                );
                }, 8000);

                return () => clearInterval(interval);
            }, []);

            const activeBeatitude = beatitudes[activeIndex];

        return (
            <section className="relative isolate flex min-h-[190px] w-full overflow-hidden rounded-xl bg-white">

            {/* Right-side photographic background */}
            <div
                className="absolute inset-y-0 right-0 w-[64%] bg-cover bg-center"
                style={{
                backgroundImage: `url('${bible}')`,
                }}
            />

            {/* Soft transition between the white and photographic sections */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-navy/100 via-30% to-transparent" />

            {/* Left content */}
            <div className="relative z-10 flex w-full flex-col justify-center gap-2 px-6 py-5 md:w-[58%] md:px-8">

                <span className="w-fit rounded-full bg-blue-100 px-3 py-1 text-[9px] font-semibold text-blue-700">
                Welcome to Sabbath School Management System
                </span>

                <h1 className="text-2xl font-extrabold leading-[1.05] tracking-tight text-[#092B63] md:text-[27px]">
                Every Sabbath 
                <br />
                Morning, <span className="text-white">there's a place for you</span>
                </h1>

                {/* <p className="max-w-[340px] text-[11px] leading-relaxed text-[#31517e]">
                Our Sabbath School family is a community of believers,
                learning, growing and serving together.
                </p> */}

              {/* Feature links */}
                
            </div>

            {/* Animated Beatitudes */}
            <div className="absolute right-[3%] top-1/2 z-20 flex w-[34%] -translate-y-1/2 items-center justify-center px-2 text-center md:right-[4%] md:w-[20%]">


                <div
                key={activeIndex}
                className="relative flex min-h-[95px] flex-col items-center justify-center gap-2 py-3 text-white verse-enter md:min-h-[110px]"
                >
                <p className="text-[10px] font-medium italic leading-relaxed drop-shadow md:text-sm lg:text-base">
                    "{activeBeatitude.text}"
                </p>

                <span className="text-[9px] font-semibold tracking-wide text-white/95 md:text-xs">
                    — {activeBeatitude.reference}
                </span>

                {/* Slide indicator */}
                <div className="mt-1 flex items-center gap-1">
                    {beatitudes.map((_, index) => (
                    <span
                        key={index}
                        className={`h-1 rounded-full transition-all duration-500 ${
                        index === activeIndex
                            ? "w-4 bg-white"
                            : "w-1 bg-white/40"
                        }`}
                    />
                    ))}
                </div>
                </div>
            </div>

            </section>
        );

}

export default Hero
