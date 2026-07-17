"use client";

export function QuoteReplyButton({ text, author }: { text: string; author: string }) {
  const handleQuote = () => {
    const event = new CustomEvent("quote-reply", {
      detail: { text, author },
    });
    window.dispatchEvent(event);

    const form = document.getElementById("reply");
    if (form) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button onClick={handleQuote} className="btn-ghost text-xs">
      Quote
    </button>
  );
}
