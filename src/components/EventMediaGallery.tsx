import { EventConfig } from "../types/event";
import { useState } from "react";
import { X, Share2 } from "lucide-react";

interface EventMediaGalleryProps {
  event: EventConfig;
}

export default function EventMediaGallery({ event }: EventMediaGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState("");

  const openLightbox = (src: string) => {
    setLightboxImage(src);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage("");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `Check out ${event.title}!`,
          url: window.location.href,
        });
      } catch {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Event link copied to clipboard!");
    }
  };

  return (
    <>
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-6xl mx-auto">
          {event.flyerImage && (
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Event Flyer
              </h2>
              <div className="flex flex-col items-center">
                <div
                  className="max-w-md mx-auto rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => openLightbox(event.flyerImage!)}
                  style={{
                    border: "2px solid var(--color-primary)",
                    boxShadow: `
                      0 10px 40px rgba(212, 175, 55, 0.3),
                      0 20px 60px rgba(212, 175, 55, 0.2),
                      0 30px 80px rgba(0, 0, 0, 0.5)
                    `,
                  }}
                >
                  <img
                    src={event.flyerImage}
                    alt={`${event.title} Flyer`}
                    className="w-full h-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `
                          <div style="
                            background-color: var(--color-surface);
                            padding: 4rem;
                            text-align: center;
                            color: var(--color-muted);
                          ">
                            <p style="font-size: 1.125rem;">Event Flyer</p>
                          </div>
                        `;
                      }
                    }}
                  />
                </div>
                <button
                  onClick={handleShare}
                  className="mt-6 flex items-center gap-2 px-4 py-2 rounded transition-all hover:scale-105"
                  style={{
                    border: "1px solid var(--color-primary)",
                    color: "var(--color-primary)",
                    backgroundColor: "transparent",
                  }}
                >
                  <Share2 size={18} />
                  <span className="text-sm font-semibold">Share This Event</span>
                </button>
              </div>
            </div>
          )}

          {event.showRecap && event.recapVideo && (
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Event Recap
              </h2>
              <div className="max-w-4xl mx-auto">
                <div
                  className="rounded-lg overflow-hidden"
                  style={{
                    border: "2px solid var(--color-primary)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.4)",
                  }}
                >
                  <video controls className="w-full">
                    <source src={event.recapVideo} type="video/mp4" />
                    Your browser does not support video playback.
                  </video>
                </div>
              </div>
            </div>
          )}

          {event.gallery.length > 0 && (
            <>
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {event.gallery.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => item.type === "image" && openLightbox(item.src)}
                  style={{
                    border: "1px solid var(--color-border)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="
                              background-color: var(--color-surface);
                              height: 16rem;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              color: var(--color-muted);
                            ">
                              <p>${item.alt}</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <video className="w-full h-64 object-cover">
                      <source src={item.src} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      </section>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.95)" }}
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full transition-colors"
            style={{
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            }}
            onClick={closeLightbox}
          >
            <X size={24} />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
