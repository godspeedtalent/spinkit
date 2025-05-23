
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, Settings, FileText, Save, UploadCloud, Check, ChevronsUpDown, XIcon, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { allGenresList as availableGenresForSelection } from "@/data/mock-data/djs";

type ArtistConfigSectionId = 'general' | 'rider';

interface NavLinkProps {
  label: string;
  sectionId: ArtistConfigSectionId;
  activeSection: ArtistConfigSectionId;
  setActiveSection: (section: ArtistConfigSectionId) => void;
  icon: React.ElementType;
  disabled?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ label, sectionId, activeSection, setActiveSection, icon: Icon, disabled }) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start text-base py-6",
        activeSection === sectionId && "bg-accent text-accent-foreground font-semibold",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !disabled && setActiveSection(sectionId)}
      disabled={disabled}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </Button>
  );
};

const availableEventTypes: string[] = [
  "Clubs", "Festivals", "Private Parties", "Corporate Events", 
  "Online Streams", "Underground Parties", "Weddings", "Concerts", "Showcases"
].sort();

export default function ArtistConfigPage() {
  const [activeSection, setActiveSection] = useState<ArtistConfigSectionId>('general');
  const { toast } = useToast();

  // General settings state
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [allowBuyerMessages, setAllowBuyerMessages] = useState(true);
  const [allowFanMessages, setAllowFanMessages] = useState(false);
  
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["Techno", "House"]);
  const [genreInputOpen, setGenreInputOpen] = useState(false);
  const [genreSearchTerm, setGenreSearchTerm] = useState("");

  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(["Clubs", "Festivals"]);
  const [eventTypeInputOpen, setEventTypeInputOpen] = useState(false);
  const [eventTypeSearchTerm, setEventTypeSearchTerm] = useState("");

  const [setLengthHours, setSetLengthHours] = useState("2");
  const [setLengthMinutes, setSetLengthMinutes] = useState("0");

  const [travelWillingness, setTravelWillingness] = useState("national");
  const [travelRadius, setTravelRadius] = useState("");
  const [minNotice, setMinNotice] = useState("14");
  
  const [standardRateMin, setStandardRateMin] = useState("200");
  const [standardRateMax, setStandardRateMax] = useState("500");


  // Rider info state
  const [technicalRider, setTechnicalRider] = useState("2x Pioneer CDJ-3000 (or CDJ-2000NXS2)\n1x Pioneer DJM-900NXS2 (or Allen & Heath Xone:96)\n2x High-quality monitor speakers (e.g., QSC K10.2, Yamaha DXR10)\nSturdy, vibration-free DJ booth (min. 2m wide x 1m deep)");
  const [hospitalityRider, setHospitalityRider] = useState("1x Private, secure dressing room\n6x Bottled still water (room temperature)\n2x Fresh towels\nHealthy snacks (fruit, nuts)\nIf travel > 2 hours, reasonable accommodation may be required.");

  const handleSaveGeneral = () => {
    toast({ title: "General Settings Saved", description: "Your general artist settings have been updated (mock)." });
    console.log("General settings saved (mock):", {
      isProfilePublic, allowBuyerMessages, allowFanMessages, selectedGenres, selectedEventTypes,
      setLengthHours, setLengthMinutes, travelWillingness, travelRadius, minNotice, standardRateMin, standardRateMax
    });
  };

  const handleSaveRider = () => {
    toast({ title: "Rider Information Saved", description: "Your performance rider details have been updated (mock)." });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
    setGenreSearchTerm("");
  };

  const removeGenre = (genreToRemove: string) => {
    setSelectedGenres(prev => prev.filter(g => g !== genreToRemove));
  };

  const filteredGenres = availableGenresForSelection.filter(genre => 
    genre.toLowerCase().includes(genreSearchTerm.toLowerCase()) && !selectedGenres.includes(genre)
  );

  const toggleEventType = (eventType: string) => {
    setSelectedEventTypes(prev => 
      prev.includes(eventType) ? prev.filter(et => et !== eventType) : [...prev, eventType]
    );
    setEventTypeSearchTerm("");
  };

  const removeEventType = (eventTypeToRemove: string) => {
    setSelectedEventTypes(prev => prev.filter(et => et !== eventTypeToRemove));
  };

  const filteredEventTypes = availableEventTypes.filter(eventType => 
    eventType.toLowerCase().includes(eventTypeSearchTerm.toLowerCase()) && !selectedEventTypes.includes(eventType)
  );


  const sections: Array<{ id: ArtistConfigSectionId; label: string; icon: React.ElementType; component: React.ReactNode; disabled?: boolean }> = [
    {
      id: 'general',
      label: 'General Settings',
      icon: Settings,
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <Settings className="mr-2 h-5 w-5 text-primary" /> General Artist Settings
            </CardTitle>
            <CardDescription>Manage your primary artist information and preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3 p-3 border rounded-md bg-card">
              <div className="flex items-center justify-between">
                <Label htmlFor="profile-public" className="text-sm font-medium">Public Profile Visibility</Label>
                <Switch id="profile-public" checked={isProfilePublic} onCheckedChange={setIsProfilePublic} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="buyer-messages" className="text-sm font-medium">Allow Messages from Buyers/Venues</Label>
                <Switch id="buyer-messages" checked={allowBuyerMessages} onCheckedChange={setAllowBuyerMessages} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="fan-messages" className="text-sm font-medium">Allow Messages from Fans</Label>
                <Switch id="fan-messages" checked={allowFanMessages} onCheckedChange={setAllowFanMessages} />
              </div>
            </div>

            <div className="space-y-4">
              {/* Preferred Genres */}
              <div>
                <Label className="text-sm font-medium">Preferred Genres for Gigs</Label>
                <Popover open={genreInputOpen} onOpenChange={setGenreInputOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={genreInputOpen}
                      className="w-full justify-between mt-1 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setGenreInputOpen(prev => !prev)}
                    >
                      {selectedGenres.length > 0 ? `Selected ${selectedGenres.length} genre(s)` : "Select genres..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search genres..." 
                        value={genreSearchTerm}
                        onValueChange={setGenreSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No genres found.</CommandEmpty>
                        <CommandGroup>
                          {filteredGenres.map((genre) => (
                            <CommandItem
                              key={genre}
                              value={genre}
                              onSelect={() => toggleGenre(genre)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedGenres.includes(genre) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {genre}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="mt-2 flex flex-wrap gap-1 rounded-md border p-3 min-h-[56px] bg-background shadow-sm">
                  {selectedGenres.length > 0 ? selectedGenres.map((genre) => (
                    <Badge key={genre} variant="secondary" className="text-xs">
                      {genre}
                      <button onClick={() => removeGenre(genre)} className="ml-1 rounded-full outline-none focus:ring-1 focus:ring-ring hover:bg-destructive/20 p-0.5">
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  )) : <p className="text-xs text-muted-foreground">No genres selected.</p>}
                </div>
              </div>

              {/* Preferred Event Types */}
              <div>
                <Label className="text-sm font-medium">Preferred Event Types</Label>
                <Popover open={eventTypeInputOpen} onOpenChange={setEventTypeInputOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={eventTypeInputOpen}
                      className="w-full justify-between mt-1 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setEventTypeInputOpen(prev => !prev)}
                    >
                      {selectedEventTypes.length > 0 ? `Selected ${selectedEventTypes.length} event type(s)`: "Select event types..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command>
                      <CommandInput 
                        placeholder="Search event types..." 
                        value={eventTypeSearchTerm}
                        onValueChange={setEventTypeSearchTerm}
                      />
                      <CommandList>
                        <CommandEmpty>No event types found.</CommandEmpty>
                        <CommandGroup>
                          {filteredEventTypes.map((eventType) => (
                            <CommandItem
                              key={eventType}
                              value={eventType}
                              onSelect={() => toggleEventType(eventType)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedEventTypes.includes(eventType) ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {eventType}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                 <div className="mt-2 flex flex-wrap gap-1 rounded-md border p-3 min-h-[56px] bg-background shadow-sm">
                  {selectedEventTypes.length > 0 ? selectedEventTypes.map((eventType) => (
                    <Badge key={eventType} variant="secondary" className="text-xs">
                      {eventType}
                      <button onClick={() => removeEventType(eventType)} className="ml-1 rounded-full outline-none focus:ring-1 focus:ring-ring hover:bg-destructive/20 p-0.5">
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  )) : <p className="text-xs text-muted-foreground">No event types selected.</p>}
                </div>
              </div>
              
              {/* Typical Set Duration */}
              <div>
                <Label className="text-sm font-medium mb-1 block">Typical Set Duration</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="set-hours" className="text-xs text-muted-foreground">Hours</Label>
                    <Input id="set-hours" type="number" min="0" max="12" value={setLengthHours} onChange={(e) => setSetLengthHours(e.target.value)} className="mt-1 text-sm" />
                  </div>
                  <div>
                     <Label htmlFor="set-minutes" className="text-xs text-muted-foreground">Minutes</Label>
                    <Input id="set-minutes" type="number" min="0" max="45" step="15" value={setLengthMinutes} onChange={(e) => setSetLengthMinutes(e.target.value)} className="mt-1 text-sm" placeholder="00"/>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <Label htmlFor="travel-willingness" className="text-sm font-medium">Willingness to Travel</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-1 text-sm text-muted-foreground hover:text-foreground justify-between">
                            {travelWillingness ? travelWillingness.charAt(0).toUpperCase() + travelWillingness.slice(1) : "Select travel range"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                            <CommandList>
                                <CommandItem onSelect={() => setTravelWillingness("local")}>Local / Regional</CommandItem>
                                <CommandItem onSelect={() => setTravelWillingness("national")}>National</CommandItem>
                                <CommandItem onSelect={() => setTravelWillingness("international")}>International</CommandItem>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
              </div>
              {travelWillingness === 'local' && (
                <div>
                  <Label htmlFor="travel-radius" className="text-sm font-medium">Travel Radius (miles)</Label>
                  <Input id="travel-radius" type="number" value={travelRadius} onChange={(e) => setTravelRadius(e.target.value)} placeholder="e.g., 100" className="mt-1 text-sm" />
                </div>
              )}
              <div>
                <Label htmlFor="min-notice" className="text-sm font-medium">Minimum Notice for Bookings (days)</Label>
                <Input id="min-notice" type="number" value={minNotice} onChange={(e) => setMinNotice(e.target.value)} placeholder="e.g., 7" className="mt-1 text-sm" />
              </div>
            </div>
             <div>
                <Label className="text-sm font-medium mb-1 block">Standard Fee Range ($)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="rate-min" className="text-xs text-muted-foreground">Min Rate ($)</Label>
                    <Input id="rate-min" type="number" min="0" value={standardRateMin} onChange={(e) => setStandardRateMin(e.target.value)} placeholder="e.g., 100" className="mt-1 text-sm" />
                  </div>
                  <div>
                     <Label htmlFor="rate-max" className="text-xs text-muted-foreground">Max Rate ($)</Label>
                    <Input id="rate-max" type="number" min="0" value={standardRateMax} onChange={(e) => setStandardRateMax(e.target.value)} placeholder="e.g., 500" className="mt-1 text-sm" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Or leave blank / specify "Negotiable" in notes if preferred.</p>
              </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSaveGeneral}><Save className="mr-2 h-4 w-4" /> Save General Settings</Button>
          </CardFooter>
        </Card>
      ),
    },
    {
      id: 'rider',
      label: 'Performance Rider',
      icon: FileText,
      component: (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5 text-primary" /> Performance Rider
            </CardTitle>
            <CardDescription>Specify your technical and hospitality requirements for performances.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="tech-rider" className="text-sm font-medium">Technical Rider</Label>
              <Textarea id="tech-rider" value={technicalRider} onChange={(e) => setTechnicalRider(e.target.value)} placeholder="Detail your sound system, DJ booth, and equipment needs..." className="mt-1 min-h-[150px] text-sm" />
              <p className="text-xs text-muted-foreground mt-1">E.g., specific CDJ/turntable models, mixer, monitor requirements.</p>
            </div>
            <div>
              <Label htmlFor="hospitality-rider" className="text-sm font-medium">Hospitality Rider</Label>
              <Textarea id="hospitality-rider" value={hospitalityRider} onChange={(e) => setHospitalityRider(e.target.value)} placeholder="Outline your backstage, travel, and accommodation needs..." className="mt-1 min-h-[100px] text-sm" />
               <p className="text-xs text-muted-foreground mt-1">E.g., dressing room, refreshments, travel class if applicable.</p>
            </div>
            
          </CardContent>
           <CardFooter>
            <Button onClick={handleSaveRider}><Save className="mr-2 h-4 w-4" /> Save Rider Information</Button>
          </CardFooter>
        </Card>
      ),
    },
  ];

  const currentSectionItem = sections.find(item => item.id === activeSection);

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      <nav className="md:w-64 lg:w-72 shrink-0 md:border-r md:pr-6 space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight mb-4 px-2 flex items-center">
          <SlidersHorizontal className="mr-3 h-6 w-6 text-primary" /> Artist Configuration
        </h2>
        {sections.map((section) => (
          <NavLink
            key={section.id}
            label={section.label}
            sectionId={section.id}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            icon={section.icon}
            disabled={section.disabled}
          />
        ))}
      </nav>

      <div className="flex-1 min-w-0">
        {currentSectionItem ? currentSectionItem.component : <p>Select a configuration section.</p>}
      </div>
    </div>
  );
}
    

      

    
