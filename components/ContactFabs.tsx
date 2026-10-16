"use client";

/**
 * Two floating action buttons — Call on the left, WhatsApp on the right.
 *
 * Fixed to the viewport so they stay visible while scrolling. Both numbers
 * come from env so the office can change them without a code edit.
 */
import { MessageCircle, Phone } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "918800505050";
const CALL_NUMBER = process.env.NEXT_PUBLIC_CALL_NUMBER || "+918800505050";

/** Pre-filled message so the user just hits send. */
function openWhatsApp() {
  const msg = encodeURIComponent("Hello IndiaFloor.com, I Want Expert Advice.");
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

export default function ContactFabs() {
  return (
    <>
      {/* Call — left */}
      <a
        href={`tel:${CALL_NUMBER}`}
        aria-label="Call us"
        className="fixed bottom-5 left-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#314367] text-white shadow-[0_8px_24px_rgba(49,67,103,0.45)] transition-transform hover:scale-110 active:scale-95 sm:bottom-6 sm:left-6"
      >
        <Phone className="h-6 w-6" strokeWidth={2} />
      </a>

      {/* WhatsApp — right */}
      <button
        type="button"
        onClick={openWhatsApp}
        aria-label="Chat with us on WhatsApp"
        className="fixed right-4 bottom-5 z-40 flex h-13 w-13 cursor-pointer items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-110 active:scale-95 sm:right-6 sm:bottom-6"
      >
        <MessageCircle className="h-6 w-6" strokeWidth={2} />
      </button>
    </>
  );
}
