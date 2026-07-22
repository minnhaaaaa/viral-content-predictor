"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchLocations } from "@/lib/api";
import { LocationResult } from "./types";

interface Props {
  value: LocationResult | null;
  onChange: (loc: LocationResult | null) => void;
}

export function LocationAutocomplete({ value, onChange }: Props) {
  const [query, setQuery] = useState(value?.display_name ?? "");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Debounced search — 300ms, only fires for queries >= 2 chars
  useEffect(() => {
    // If the query still matches the selected location's label, don't re-search
    if (value && query === value.display_name) {
      setResults([]);
      setErrorMsg(null);
      return;
    }
    if (query.trim().length < 2) {
      setResults([]);
      setErrorMsg(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      const res = await searchLocations(query, controller.signal);
      if (controller.signal.aborted) return;
      if (res.ok) {
        setResults(res.results);
        setErrorMsg(null);
      } else {
        setResults([]);
        // "timeout" here just means a newer keystroke superseded this
        // request — don't show an error for that, only for real failures
        if (res.error.kind !== "timeout") {
          setErrorMsg(res.error.message);
        }
      }
      setLoading(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Click away closes the dropdown
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback((loc: LocationResult) => {
    onChange(loc);
    setQuery(loc.display_name);
    setResults([]);
    setErrorMsg(null);
    setIsOpen(false);
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (value) onChange(null); // clear selection if user starts typing again
  };

  const showNoResults =
    isOpen && !loading && !errorMsg && query.trim().length >= 2 &&
    results.length === 0 && (!value || query !== value.display_name);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => { if (results.length > 0 || errorMsg) setIsOpen(true); }}
          placeholder="e.g. Mumbai, India"
          className={`w-full rounded-input border px-4 py-3 text-body-sm font-body bg-black text-white placeholder:text-charcoal transition-colors duration-150 ease-out focus:outline-none ${
            errorMsg ? "border-alarm-red focus:border-alarm-red" : "border-graphite-hairline focus:border-white"
          }`}
        />
        {loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-iris-violet border-t-transparent animate-spin" />
        )}
        {value && !loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-iris-violet">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        )}
        {errorMsg && !loading && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-alarm-red">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-card border border-graphite-hairline bg-black shadow-card overflow-hidden max-h-64 overflow-y-auto"
          >
            {results.map((loc, i) => (
              <button
                key={`${loc.city}-${loc.lat}-${i}`}
                type="button"
                onClick={() => handleSelect(loc)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left text-body-sm font-body text-ash-gray hover:bg-[#0b0e14] hover:text-white transition-colors duration-150 ease-out border-b border-graphite-hairline last:border-b-0"
              >
                <span>
                  <span className="text-white">{loc.city}</span>
                  <span className="text-charcoal">, {loc.country}</span>
                </span>
                {loc.population && (
                  <span className="font-mono text-[0.65rem] text-charcoal flex-shrink-0">
                    {loc.population >= 1_000_000
                      ? `${(loc.population / 1_000_000).toFixed(1)}M`
                      : `${Math.round(loc.population / 1000)}K`}
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {errorMsg && isOpen && !loading && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-card border border-alarm-red/40 bg-black px-4 py-3">
          <p className="font-mono text-caption text-alarm-red leading-relaxed">
            Couldn&apos;t search locations: {errorMsg}
          </p>
        </div>
      )}

      {showNoResults && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-card border border-graphite-hairline bg-black px-4 py-3 text-body-sm font-mono text-charcoal">
          No cities found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  );
}
