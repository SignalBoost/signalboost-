import { NextResponse } from "next/server";

const regionLanguageMap = {
  "es": "/es",   // Spanish
  "pt": "/pt",   // Portuguese
  "fr": "/fr",   // French
  "de": "/de",   // German
  "en": "/"
};

export function middleware(req) {
  const url = req.nextUrl.clone();

  // Detect browser language
  const acceptLang = req.headers.get("accept-language") || "";
  const browserLang = acceptLang.split(",")[0].split("-")[0]; // e.g. "es-MX" → "es"

  // Check if already on a localized route
  const currentPath = url.pathname;
  const isLocalized = Object.values(regionLanguageMap).some(route =>
    currentPath.startsWith(route)
  );

  if (!isLocalized) {
    const redirectPath = regionLanguageMap[browserLang] || "/";
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
