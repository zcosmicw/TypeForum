import ChromaticFluid from "@/components/ui/chromatic-fluid";

export default function ChromaticFluidDemo() {
  return (
    <ChromaticFluid height="500px">
      <div className="flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Chromatic Fluid
        </h1>
        <p className="max-w-md text-sm text-white/70 sm:text-base">
          A WebGL-powered animated fluid background with procedural noise and
          chromatic glint highlights.
        </p>
      </div>
    </ChromaticFluid>
  );
}
