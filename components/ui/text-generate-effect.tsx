import { cn } from "@/lib/utils";

export const TextGenerateEffect = ({
  words,
  className,
}: {
  words: string;
  className?: string;
}) => {
  const wordsArray = words.split(" ");

  return (
    <h1 className={cn("my-4 font-bold leading-snug tracking-wide text-[--text-primary]", className)}>
      {wordsArray.map((word, index) => (
        <span key={index} className={index > 3 ? "text-purple" : undefined}>
          {word}{index < wordsArray.length - 1 ? " " : ""}
        </span>
      ))}
    </h1>
  );
};
