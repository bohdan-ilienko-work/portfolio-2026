import Image from "next/image";
import Link from "next/link";
import { FaLocationArrow } from "react-icons/fa6";

import { educationItems } from "@/data";

export const Education = () => {
  return (
    <section id="education" className="py-20">
      <h1 className="heading">
        My <span className="text-purple">education</span>
      </h1>

      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {educationItems.map((item) => (
          <article
            key={item.id}
            className="group relative overflow-hidden rounded-3xl border border-white/[0.12] bg-gradient-to-b from-[#0c1233] to-[#070b22] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
          >
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.12]">
              <Image
                src={item.image}
                alt={item.title}
                width={960}
                height={600}
                className="h-56 w-full object-cover object-center transition duration-300 group-hover:scale-[1.02] md:h-64"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#04071d]/40 via-transparent to-transparent" />
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                {item.institution}
              </p>
              <h3 className="mt-2 text-xl font-bold text-white md:text-2xl">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-white/85 md:text-base">
                {item.degree}
              </p>
              <p className="mt-1 text-sm text-purple">{item.period}</p>
              <p className="mt-3 text-sm text-white/70">{item.description}</p>

              <Link
                href={item.link}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-5 inline-flex items-center text-sm text-purple transition-opacity hover:opacity-80 md:text-base"
              >
                {item.ctaLabel}
                <FaLocationArrow className="ms-3 h-3 w-3 md:h-4 md:w-4" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
