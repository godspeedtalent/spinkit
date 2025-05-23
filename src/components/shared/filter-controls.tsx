
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { RotateCcw } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet"; // For mobile sheet apply button

export type FilterOption = {
  id: string;
  label: string;
  value: string;
};

export type FilterConfig =
  | {
      type: "text";
      label: string;
      id: string;
      state: string;
      setState: (value: string) => void;
      placeholder?: string;
    }
  | {
      type: "slider";
      label: string;
      id: string;
      state: [number] | [number, number]; // Can be single value or range
      setState: (value: [number] | [number, number]) => void;
      min: number;
      max: number;
      step: number;
      range?: boolean; // True for two-thumb slider
    }
  | {
      type: "popover-checkbox";
      label: string;
      id: string;
      state: string[]; // Array of selected values
      setState: (value: string[]) => void; // Or (value: string) => void for single select logic
      options: FilterOption[];
      popoverPlaceholder?: string;
    }
  | {
      type: "checkbox";
      label: string;
      id: string;
      state: boolean;
      setState: (value: boolean) => void;
    };

interface FilterControlsProps {
  config: FilterConfig[];
  onApplyFilters: () => void;
  onResetFilters: () => void;
  isSheet?: boolean; // To conditionally render SheetClose for apply button
}

export default function FilterControls({
  config,
  onApplyFilters,
  onResetFilters,
  isSheet = false,
}: FilterControlsProps) {
  return (
    <div className="space-y-4">
      {config.map((filter) => {
        switch (filter.type) {
          case "text":
            return (
              <div key={filter.id}>
                <Label htmlFor={filter.id} className="text-base font-semibold">
                  {filter.label}
                </Label>
                <Input
                  id={filter.id}
                  placeholder={filter.placeholder || `Enter ${filter.label.toLowerCase()}`}
                  value={filter.state}
                  onChange={(e) => filter.setState(e.target.value)}
                  className="mt-1"
                />
              </div>
            );
          case "slider":
            return (
              <div key={filter.id}>
                <Label htmlFor={filter.id} className="text-base font-semibold">
                  {filter.label}:{" "}
                  {filter.range
                    ? `${filter.state[0]} - ${filter.state[1]}`
                    : `${filter.state[0]}`}
                </Label>
                <Slider
                  id={filter.id}
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={filter.state}
                  onValueChange={(value) => filter.setState(value as [number] | [number, number])}
                  className="mt-2 slider-track"
                />
              </div>
            );
          case "popover-checkbox":
            return (
              <div key={filter.id}>
                <Label className="text-base font-semibold">{filter.label}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-1"
                    >
                      {filter.state.length > 0
                        ? filter.state.join(", ")
                        : filter.popoverPlaceholder || `Select ${filter.label.toLowerCase()}`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0" align="start">
                    <div className="p-2 max-h-60 overflow-y-auto">
                      <div className="space-y-2 p-2">
                        {filter.options.map((option) => (
                          <div
                            key={option.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${filter.id}-${option.id}`}
                              checked={filter.state.includes(option.value)}
                              onCheckedChange={(checked) => {
                                const newState = checked
                                  ? [...filter.state, option.value]
                                  : filter.state.filter((v) => v !== option.value);
                                filter.setState(newState);
                              }}
                            />
                            <Label
                              htmlFor={`${filter.id}-${option.id}`}
                              className="text-sm font-normal cursor-pointer flex-1"
                            >
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            );
            case "checkbox":
              return (
                <div key={filter.id} className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id={filter.id}
                    checked={filter.state}
                    onCheckedChange={(checked) => filter.setState(Boolean(checked))}
                  />
                  <Label htmlFor={filter.id} className="text-sm font-normal cursor-pointer">
                    {filter.label}
                  </Label>
                </div>
              );
          default:
            return null;
        }
      })}

      {/* Action Buttons */}
      {/* If not in a sheet, these buttons are part of a separate SheetFooter in the calling component */}
      {!isSheet && (
        <div className="pt-4 border-t flex flex-col gap-2">
            <Button onClick={onApplyFilters} className="w-full">Apply Filters</Button>
            <Button onClick={onResetFilters} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
        </div>
      )}
      {/* If it IS a sheet, the parent component (FilterSheetContent) provides the footer with buttons */}
       {isSheet && (
        <div className="pt-4 flex flex-col gap-2">
            <SheetClose asChild>
                <Button onClick={onApplyFilters} className="w-full">Apply Filters</Button>
            </SheetClose>
            <Button onClick={onResetFilters} variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
        </div>
      )}
    </div>
  );
}
