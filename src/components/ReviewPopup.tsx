import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ReviewPopup() {
  const [visible, setVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    // Show after 90 seconds, only once per session
    const seen = sessionStorage.getItem("qreview");
    if (seen) return;
    const t = setTimeout(() => setVisible(true), 90_000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("qreview", "1");
    setVisible(false);
  };

  const submit = () => {
    sessionStorage.setItem("qreview", "1");
    // In production: send to Firestore or analytics
    console.info("[Quietly Review]", { rating, feedback });
    setSubmitted(true);
    setTimeout(dismiss, 2000);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-[200] review-popup">
      <div className="bg-card border border-border rounded-xl shadow-lift overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-medium">How's Quietly working for you?</p>
          <button onClick={dismiss} className="text-muted-foreground hover:text-foreground transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          <div className="px-4 py-5 text-center">
            <p className="text-2xl mb-1">🎉</p>
            <p className="text-sm font-medium">Thanks for the feedback!</p>
            <p className="text-xs text-muted-foreground mt-1">It helps us build a better Quietly.</p>
          </div>
        ) : (
          <div className="px-4 py-4 space-y-3">
            {/* Stars */}
            <div className="flex items-center gap-1 justify-center">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-110">
                  <Star className={`h-6 w-6 transition-colors ${
                    s <= (hover || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground/30"
                  }`} />
                </button>
              ))}
            </div>

            {/* Feedback input */}
            {rating > 0 && (
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder={rating >= 4 ? "What do you love most?" : "What could we improve?"}
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-subtle px-3 py-2 text-xs outline-none focus:border-foreground/30 transition placeholder:text-muted-foreground/50"
              />
            )}

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={dismiss} className="flex-1 h-8 text-xs">
                Not now
              </Button>
              <Button size="sm" onClick={submit} disabled={!rating} className="flex-1 h-8 text-xs rounded-md">
                Submit
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
