import Image from "next/image";

export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a
      href="#top"
      className="flex items-center gap-2.5 leading-none"
      aria-label="IndiaFloor.com home"
    >
      <Image
        src="/logo.png"
        alt="India Floor"
        width={96}
        height={96}
        priority
        className="h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11"
      />
      <span>
        <span className="block text-[23px] font-extrabold tracking-tight sm:text-[28px]">
          <span className="text-navy-900">India</span>
          <span className="text-[#314367]">Floor</span>
          <span className="text-navy-900">.com</span>
        </span>
        {!compact && (
          <span className="mt-0.5 block text-[8.5px] font-semibold tracking-[0.18em] text-navy-900/70">
            THE DOOR TO EVERY INDIAN FLOOR.
          </span>
        )}
      </span>
    </a>
  );
}
