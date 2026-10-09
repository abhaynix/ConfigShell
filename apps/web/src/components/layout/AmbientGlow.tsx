/**
 * Ambient atmospheric glow backdrop — sits at the top of each page.
 * Purely decorative, pointer-events-none.
 */
export function AmbientGlow() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-12 inset-x-0 mx-auto w-full max-w-[1000px] h-[340px] blur-3xl opacity-60 rounded-full"
      style={{
        background:
          'radial-gradient(ellipse at center, rgb(249 115 22 / 0.10) 0%, rgb(245 158 11 / 0.10) 40%, transparent 70%)',
      }}
    />
  );
}
