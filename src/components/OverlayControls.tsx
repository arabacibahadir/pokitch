"use client";

import { Check, Copy, Eye, EyeOff, Heart, RotateCcw, Settings, Sparkles, Zap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OverlayView } from "@/features/overlay/OverlayView";
import type { ActivePoke, OverlayCatch, OverlayEvent, OverlaySize } from "@/features/overlay/model";
import { OVERLAY_PRESETS } from "@/features/overlay/presets";

const THEME_PRESETS = [
  { name: "Default Yellow", primary: "#facc15", card: "#1a1625", text: "#ffffff" },
  { name: "Crimson Flame", primary: "#ef4444", card: "#2e0a0a", text: "#fecaca" },
  { name: "Electric Blue", primary: "#3b82f6", card: "#0b132b", text: "#dbeafe" },
  { name: "Emerald Forest", primary: "#22c55e", card: "#022c22", text: "#dcfce7" },
  { name: "Cyberpunk Magenta", primary: "#ec4899", card: "#2d0b25", text: "#fce7f3" },
];

export default function OverlayControls({
  url,
  onCopied,
}: {
  url: string;
  onCopied?: () => void;
}) {
  const [showUrl, setShowUrl] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  // Customization state
  const [size, setSize] = useState<OverlaySize>("auto");
  const [showLastCatch, setShowLastCatch] = useState(true);
  const [showLastAttack, setShowLastAttack] = useState(true);
  const [theme, setTheme] = useState("default");
  const [showTicker, setShowTicker] = useState(true);

  // Color customization states (initialize to default colors)
  const [primaryColor, setPrimaryColor] = useState("#facc15");
  const [cardColor, setCardColor] = useState("#1a1625");
  const [textColor, setTextColor] = useState("#ffffff");

  // Simulation states for interactive preview
  const [simPoke, setSimPoke] = useState("pikachu");
  const [simHealth, setSimHealth] = useState(38);
  const [simEvent, setSimEvent] = useState<OverlayEvent>({
    kind: null,
    player: null,
    damage: null,
    at: null,
  });
  const [simCatch, setSimCatch] = useState<OverlayCatch>({
    poke: null,
    player: null,
    at: null,
  });

  // Calculate dynamic URL
  const queryParams = new URLSearchParams();
  if (size !== "auto") queryParams.set("size", size);
  if (!showLastCatch) queryParams.set("hideCatch", "true");
  if (!showLastAttack) queryParams.set("hideAttack", "true");
  if (theme !== "default") queryParams.set("theme", theme);
  if (!showTicker) queryParams.set("hideTicker", "true");

  const cleanHex = (hex: string) => hex.replace("#", "");
  if (primaryColor && primaryColor !== "#facc15") queryParams.set("primary", cleanHex(primaryColor));
  if (cardColor && cardColor !== "#1a1625") queryParams.set("card", cleanHex(cardColor));
  if (textColor && textColor !== "#ffffff") queryParams.set("text", cleanHex(textColor));

  const queryString = queryParams.toString();
  const customizedUrl = queryString ? `${url}?${queryString}` : url;

  async function copyUrl() {
    try {
      await navigator.clipboard.writeText(customizedUrl);
      setCopied(true);
      setCopyError(false);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setCopyError(true);
      setShowUrl(true);
    }
  }

  // Simulation handlers
  function handleSimulateHit() {
    const damage = Math.floor(Math.random() * 8) + 5;
    setSimHealth((prev) => Math.max(0, prev - damage));
    setSimEvent({
      kind: "hit",
      player: "ash_ketchum",
      damage,
      at: Date.now().toString(),
    });
  }

  function handleSimulateCatch() {
    const randomPokemon = ["charizard", "gengar", "mew", "eevee", "snorlax"][
      Math.floor(Math.random() * 5)
    ];
    setSimEvent({
      kind: "caught",
      player: "goh_trainer",
      damage: null,
      at: Date.now().toString(),
    });
    setSimCatch({
      poke: randomPokemon,
      player: "goh_trainer",
      at: Date.now().toString(),
    });
    // Update simulation poke to the newly caught pokemon
    setTimeout(() => {
      setSimPoke(randomPokemon);
      setSimHealth(50);
    }, 3000);
  }

  function handleResetSim() {
    setSimPoke("pikachu");
    setSimHealth(38);
    setSimEvent({ kind: null, player: null, damage: null, at: null });
    setSimCatch({ poke: null, player: null, at: null });
  }

  const demoPoke: ActivePoke = {
    poke: simPoke,
    health: simHealth,
  };

  return (
    <div className="grid gap-6 laptop:grid-cols-[1.1fr_.9fr]">
      {/* Left Column: Customization Controls */}
      <div className="flex flex-col gap-5">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 font-semibold mb-4 text-primary">
            <Settings className="size-4" />
            <span>Customize Style & Layout</span>
          </div>

          {/* Color Presets */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Preset Color Themes</p>
            <div className="flex flex-wrap gap-2">
              {THEME_PRESETS.map((theme) => (
                <button
                  key={theme.name}
                  type="button"
                  onClick={() => {
                    setPrimaryColor(theme.primary);
                    setCardColor(theme.card);
                    setTextColor(theme.text);
                  }}
                  className="flex items-center gap-1.5 rounded border border-border bg-muted/30 px-2 py-1 text-xs hover:bg-muted/70 transition"
                >
                  <span
                    className="size-3.5 rounded-full border border-border"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primary} 50%, ${theme.card} 50%)`,
                    }}
                  />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Color Pickers */}
            <div className="grid gap-3">
              <Field>
                <FieldLabel htmlFor="color-primary">Primary/Border Color</FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="color-primary-picker"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="size-8 cursor-pointer rounded border border-border bg-transparent p-0"
                  />
                  <input
                    type="text"
                    id="color-primary"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs font-mono"
                    placeholder="#facc15"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="color-card">Card Background</FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="color-card-picker"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="size-8 cursor-pointer rounded border border-border bg-transparent p-0"
                  />
                  <input
                    type="text"
                    id="color-card"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs font-mono"
                    placeholder="#1a1625"
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="color-text">Text Color</FieldLabel>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="color-text-picker"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="size-8 cursor-pointer rounded border border-border bg-transparent p-0"
                  />
                  <input
                    type="text"
                    id="color-text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs font-mono"
                    placeholder="#ffffff"
                  />
                </div>
              </Field>
            </div>

            {/* Size, Theme & Badges */}
            <div className="grid gap-3">
              <Field>
                <FieldLabel htmlFor="overlay-size-select">Overlay Preset Size</FieldLabel>
                <Select
                  value={size}
                  onValueChange={(val) => setSize(val as OverlaySize)}
                >
                  <SelectTrigger id="overlay-size-select" className="w-full">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {Object.entries(OVERLAY_PRESETS).map(([key, item]) => (
                      <SelectItem key={key} value={key}>
                        {item.label} ({item.dimensions})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel htmlFor="overlay-theme-select">Overlay Theme / Skin</FieldLabel>
                <Select
                  value={theme}
                  onValueChange={setTheme}
                >
                  <SelectTrigger id="overlay-theme-select" className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="default">Glass (Default)</SelectItem>
                    <SelectItem value="retro">Retro GameBoy</SelectItem>
                    <SelectItem value="pokedex">Pokédex Sci-Fi</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex flex-col gap-2 mt-1">
                <Field className="flex-row items-center gap-2.5">
                  <Checkbox
                    id="toggle-last-catch"
                    checked={showLastCatch}
                    onCheckedChange={(checked) => setShowLastCatch(checked === true)}
                  />
                  <div className="grid gap-0.5">
                    <FieldLabel htmlFor="toggle-last-catch" className="text-xs">Show Last Catch badge</FieldLabel>
                  </div>
                </Field>

                <Field className="flex-row items-center gap-2.5">
                  <Checkbox
                    id="toggle-last-attack"
                    checked={showLastAttack}
                    onCheckedChange={(checked) => setShowLastAttack(checked === true)}
                  />
                  <div className="grid gap-0.5">
                    <FieldLabel htmlFor="toggle-last-attack" className="text-xs">Show Last Attacker badge</FieldLabel>
                  </div>
                </Field>

                <Field className="flex-row items-center gap-2.5">
                  <Checkbox
                    id="toggle-ticker"
                    checked={showTicker}
                    onCheckedChange={(checked) => setShowTicker(checked === true)}
                  />
                  <div className="grid gap-0.5">
                    <FieldLabel htmlFor="toggle-ticker" className="text-xs">Show scrolling info ticker</FieldLabel>
                  </div>
                </Field>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Preview & Copy Link */}
      <div className="flex flex-col gap-4">
        {/* Live Simulator Controls */}
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2 font-semibold mb-4 text-primary">
            <Zap className="size-4" />
            <span>Interactive Simulator</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="sim-poke-select">Demo Pokémon Species</FieldLabel>
              <Select value={simPoke} onValueChange={(val) => { setSimPoke(val); setSimHealth(50); }}>
                <SelectTrigger id="sim-poke-select" className="w-full">
                  <SelectValue placeholder="Select pokemon" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {["pikachu", "gengar", "charizard", "eevee", "mew", "snorlax", "bulbasaur", "squirtle"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <div className="flex justify-between items-center">
                <FieldLabel htmlFor="health-range">Simulated HP</FieldLabel>
                <span className="font-mono text-xs font-bold">{simHealth} / 50</span>
              </div>
              <input
                id="health-range"
                type="range"
                min="0"
                max="50"
                value={simHealth}
                onChange={(e) => setSimHealth(Number(e.target.value))}
                className="w-full accent-primary mt-1"
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <Button size="sm" onClick={handleSimulateHit} variant="outline" className="flex items-center gap-1 text-destructive hover:text-destructive">
              <Zap className="size-3" /> Simulate Hit
            </Button>
            <Button size="sm" onClick={handleSimulateCatch} variant="outline" className="flex items-center gap-1 text-success hover:text-success">
              <Sparkles className="size-3" /> Simulate Catch
            </Button>
            <Button size="sm" onClick={handleResetSim} variant="secondary" className="flex items-center gap-1">
              <RotateCcw className="size-3" /> Reset Sim
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 flex-1 flex flex-col">
          <div className="flex items-center gap-2 font-semibold mb-4 text-primary">
            <Heart className="size-4" />
            <span>Live Interactive Preview</span>
          </div>

          {/* Container query wrapper to emulate overlay viewport */}
          <div className="flex-1 flex items-center justify-center p-4 bg-muted/20 border border-border border-dashed rounded-lg min-h-[180px]">
            <div
              className="relative w-full overflow-hidden flex items-center justify-center"
              style={{
                containerName: "overlay",
                containerType: "size",
                aspectRatio: size === "compact" ? "256/76" : size === "large" ? "640/180" : "300/130",
                maxWidth: size === "large" ? "460px" : size === "compact" ? "280px" : "360px",
              }}
            >
              <OverlayView
                poke={demoPoke}
                size={size}
                event={simEvent}
                catch={simCatch}
                hideCatch={!showLastCatch}
                hideAttack={!showLastAttack}
                primaryColor={primaryColor}
                cardColor={cardColor}
                textColor={textColor}
                theme={theme}
                hideTicker={!showTicker}
              />
            </div>
          </div>
        </div>

        {/* Dynamic Copy Link Panel */}
        <div className="flex flex-col gap-2">
          <div className="grid gap-2 tablet:grid-cols-2">
            <Button onClick={copyUrl} type="button">
              {copied ? (
                <Check data-icon="inline-start" />
              ) : (
                <Copy data-icon="inline-start" />
              )}
              {copied ? "Copied!" : "Copy overlay URL"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowUrl((visible) => !visible)}
              type="button"
            >
              {showUrl ? (
                <EyeOff data-icon="inline-start" />
              ) : (
                <Eye data-icon="inline-start" />
              )}
              {showUrl ? "Hide URL" : "Show URL"}
            </Button>
            {showUrl ? (
              <div className="select-all break-all rounded-lg border border-border bg-muted/40 p-3 text-xs font-mono tablet:col-span-2">
                {customizedUrl}
              </div>
            ) : null}
            {copyError ? (
              <p className="text-sm text-warning tablet:col-span-2" role="alert">
                Clipboard access was blocked. Select and copy the URL shown above.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
