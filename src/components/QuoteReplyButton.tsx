"use client";

export function QuoteReplyButton({
  postBody,
  author,
}: {
  postBody: string;
  author: string;
}) {
  function handleQuote() {
    // Scroll to reply form and pre-fill with quote
    const replySection = document.getElementById("reply");
    if (replySection) {
      replySection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Dispatch a custom event that ReplyForm listens to
    window.dispatchEvent(
      new CustomEvent("quote-reply", {
        detail: { text: postBody.slice(0, 200), author },
      }),
    );
  }

  return (
    <button
      type="button"
      onClick={handleQuote}
      title="Quote this post"
      className="rounded px-2 py-1 text-xs text-slate-400 hover:bg-teal-900/20 hover:text-teal-400"
    >
      ↩ Quote
    </button>
  );
}
