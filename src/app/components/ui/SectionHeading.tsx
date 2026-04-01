type SectionHeadingProps = {
    eyebrow?: string;
    title: string;
    description?: string;
  };
  
  export default function SectionHeading({
    eyebrow,
    title,
    description,
  }: SectionHeadingProps) {
    return (
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.18em] text-neutral-500">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-base leading-7 text-neutral-600">{description}</p>
        ) : null}
      </div>
    );
  }