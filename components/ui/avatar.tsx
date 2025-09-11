import * as React from "react";

export function Avatar({
  src,
  alt,
  className = "",
}: {
  src?: string;
  alt?: string;
  className?: string;
}) {
  return (
    <div
      className={`h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ${className}`}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <span className="text-lg font-semibold text-gray-600">
          {alt?.charAt(0).toUpperCase() ?? "U"}
        </span>
      )}
    </div>
  );
}
