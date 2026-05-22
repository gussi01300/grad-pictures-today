"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HexColorPicker } from "react-colorful";
import { schoolColorsPresets } from "@/lib/utils";

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = React.useState(false);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="w-10 h-10 rounded-md border border-input cursor-pointer"
          style={{ backgroundColor: value }}
          onClick={() => setShowPicker(!showPicker)}
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>
      {showPicker && (
        <div className="p-3 border rounded-md bg-background">
          <HexColorPicker color={value} onChange={onChange} />
          <div className="flex flex-wrap gap-1 mt-2">
            {schoolColorsPresets.map((preset) => (
              <button
                key={preset.hex}
                type="button"
                className="w-6 h-6 rounded border border-input cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: preset.hex }}
                onClick={() => onChange(preset.hex)}
                title={preset.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface GenerationFormProps {
  type: "YEARBOOK" | "PORTRAIT";
  onSubmit: (data: GenerationFormData) => void;
  disabled?: boolean;
}

export interface GenerationFormData {
  userPhoto: File | null;
  referencePhoto: File | null;
  gownColor: string;
  capColor: string;
  sashColor: string;
  background?: string;
  style?: string;
  capOn: boolean;
  diplomaOn: boolean;
}

export function GenerationForm({ type, onSubmit, disabled }: GenerationFormProps) {
  const [userPhoto, setUserPhoto] = React.useState<File | null>(null);
  const [referencePhoto, setReferencePhoto] = React.useState<File | null>(null);
  const [gownColor, setGownColor] = React.useState("#1a1a2e");
  const [capColor, setCapColor] = React.useState("#1a1a2e");
  const [sashColor, setSashColor] = React.useState("#C41E3A");
  const [background, setBackground] = React.useState("studio");
  const [style, setStyle] = React.useState("cinematic");
  const [capOn, setCapOn] = React.useState(true);
  const [diplomaOn, setDiplomaOn] = React.useState(false);
  const [consentGiven, setConsentGiven] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userPhoto || !consentGiven) return;

    onSubmit({
      userPhoto,
      referencePhoto,
      gownColor,
      capColor,
      sashColor,
      background: type === "PORTRAIT" ? background : undefined,
      style: type === "PORTRAIT" ? style : undefined,
      capOn,
      diplomaOn,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Your Photo *</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {userPhoto ? (
              <div className="space-y-2">
                <img
                  src={URL.createObjectURL(userPhoto)}
                  alt="Preview"
                  className="max-h-48 mx-auto rounded"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUserPhoto(null)}
                >
                  Remove
                </Button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setUserPhoto(e.target.files?.[0] ?? null)}
                className="hidden"
                id="user-photo"
              />
            )}
            {!userPhoto && (
              <label
                htmlFor="user-photo"
                className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
              >
                Click to upload your photo
              </label>
            )}
          </div>
        </div>

        {type === "YEARBOOK" && (
          <div>
            <Label className="mb-2 block">Reference Photo (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload a graduation photo from your school to match the gown style
            </p>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {referencePhoto ? (
                <div className="space-y-2">
                  <img
                    src={URL.createObjectURL(referencePhoto)}
                    alt="Reference Preview"
                    className="max-h-32 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setReferencePhoto(null)}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => setReferencePhoto(e.target.files?.[0] ?? null)}
                  className="hidden"
                  id="ref-photo"
                />
              )}
              {!referencePhoto && (
                <label
                  htmlFor="ref-photo"
                  className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
                >
                  Upload reference photo
                </label>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ColorPicker label="Gown Color" value={gownColor} onChange={setGownColor} />
          <ColorPicker label="Cap Color" value={capColor} onChange={setCapColor} />
          <ColorPicker label="Sash Color" value={sashColor} onChange={setSashColor} />
        </div>

        {type === "PORTRAIT" && (
          <>
            <div className="space-y-2">
              <Label>Background</Label>
              <Select value={background} onValueChange={setBackground}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="campus">Campus</SelectItem>
                  <SelectItem value="forest">Fall Forest</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="elegant">Elegant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch checked={capOn} onCheckedChange={setCapOn} />
            <Label>Cap On</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={diplomaOn} onCheckedChange={setDiplomaOn} />
            <Label>Diploma</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="consent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="mt-1"
          />
          <Label htmlFor="consent" className="text-sm font-normal">
            I confirm I own or have permission to use the uploaded photos.
            {type === "YEARBOOK" && (
              <span className="block text-xs text-muted-foreground mt-1">
                Reference images are used only to match gown and photography style, not to identify or copy the original person.
              </span>
            )}
          </Label>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={disabled || !userPhoto || !consentGiven}>
        Generate Photo
      </Button>
    </form>
  );
}