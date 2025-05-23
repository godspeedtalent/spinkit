
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { siteConfig, type UserRole } from "@/config/site";
import { Disc3, UserPlus, ArrowLeft, ArrowRight, Building, MicVocal, Heart, Mail, User, Image as ImageIconLucide } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { allGenresList as artistProfileGenres } from "@/data/mock-data/djs"; 
import { allGenresDataList as fanFavoriteGenresList } from "@/data/mock-data/genres"; 


const baseSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  confirmPassword: z.string(),
});

const buyerSchema = baseSchema.extend({
  venueName: z.string().min(2, "Venue name is required.").optional(),
  venueLocation: z.string().min(2, "Venue location is required.").optional(),
});

const artistSchema = baseSchema.extend({ // Renamed from sellerSchema
  djName: z.string().min(2, "Artist name is required."), // Changed label
  genres: z.array(z.string()).min(1, "Select at least one genre.").max(5, "Select up to 5 genres."),
  djLocation: z.string().min(2, "Location is required."),
});

const fanSchema = baseSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters."),
  profilePic: z.any().optional(), 
  favoriteGenres: z.array(z.string()).min(1, "Select at least one favorite genre."),
});

const formSchema = z.union([buyerSchema, artistSchema, fanSchema]).refine( // Used artistSchema
  (data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  }
);

type FormData = z.infer<typeof formSchema>;

export default function SignupPage() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      venueName: "",
      venueLocation: "",
      djName: "", // For artistSchema
      genres: [], // For artistSchema
      djLocation: "", // For artistSchema
      username: "",
      profilePic: undefined,
      favoriteGenres: [],
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (currentStep === 2) { 
        fieldsToValidate = ["email", "password", "confirmPassword"];
    } else if (currentStep === 3 && selectedRole) { 
        if (selectedRole === "Buyer") fieldsToValidate = ["venueName", "venueLocation"];
        if (selectedRole === "Artist") fieldsToValidate = ["djName", "genres", "djLocation"]; // Changed from "Seller"
        if (selectedRole === "Fan") fieldsToValidate = ["username", "favoriteGenres", "profilePic"]; 
    }

    const isValid = fieldsToValidate.length > 0 ? await form.trigger(fieldsToValidate) : true;
    if (isValid) {
        setCurrentStep((prev) => prev + 1);
    } else {
        fieldsToValidate.forEach(field => {
            if (form.formState.errors[field]) {
                // @ts-ignore
                form.setFocus(field); 
                return;
            }
        });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => prev - 1);
  };

  function onSubmit(values: FormData) {
    if (!selectedRole) {
        toast({ title: "Error", description: "Please select a role.", variant: "destructive" });
        return;
    }
    if (typeof window !== 'undefined' && window.handleAuthSuccess) {
      window.handleAuthSuccess(selectedRole); // Removed second argument for redirect path
      toast({
        title: "Signup Successful!",
        description: `Welcome to ${siteConfig.name}! You are now logged in as a ${selectedRole}.`,
      });
    } else {
      toast({
        title: "Signup Error",
        description: "Could not complete signup process. (window.handleAuthSuccess not found)",
        variant: "destructive",
      });
      console.warn("Signup attempt, but window.handleAuthSuccess is not defined. This function should be set by AppLayout.");
    }
    console.log("Signup values:", { ...values, role: selectedRole });
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Role Selection
        return (
          <div className="flex flex-col items-center justify-center w-full">
            <div className="text-center mb-10">
              <Disc3 className="h-20 w-20 text-primary mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-2">Join {siteConfig.name}</h1>
              <p className="text-muted-foreground text-lg">First, tell us who you are.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl mb-8">
              {(["Buyer", "Artist", "Fan"] as UserRole[]).map((role) => ( // Changed "Seller" to "Artist"
                <Button
                  key={role}
                  variant={selectedRole === role ? "default" : "outline"}
                  className="h-auto p-6 flex flex-col items-center justify-center space-y-3 shadow-lg hover:shadow-xl transition-shadow duration-200 rounded-xl aspect-square text-lg border-2"
                  onClick={() => setSelectedRole(role)}
                >
                  {role === "Buyer" && <Building className="h-20 w-20 mb-2 text-primary" />}
                  {role === "Artist" && <MicVocal className="h-20 w-20 mb-2 text-primary" />} 
                  {role === "Fan" && <Heart className="h-20 w-20 mb-2 text-primary" />}
                  <span className="font-semibold">I am a {role === "Buyer" ? "Venue / Event Organizer" : role}</span>
                </Button>
              ))}
            </div>
            {selectedRole && (
              <p className="text-md text-muted-foreground text-center mb-6">
                You selected: <span className="font-semibold text-primary">{selectedRole}</span>
              </p>
            )}
            <div className="w-full max-w-xs">
              <Button onClick={handleNext} disabled={!selectedRole} className="w-full" size="lg">
                Next <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        );
      case 2: // Basic Info (Email, Password)
        return (
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Account Credentials</CardTitle>
              <CardDescription>Set up your login details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Minimum 8 characters" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl><Input type="password" placeholder="Re-enter your password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
              <Button onClick={handleNext}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardFooter>
          </Card>
        );
      case 3: // Role-Specific Info
        return (
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                {selectedRole === "Buyer" && "Your Venue"}
                {selectedRole === "Artist" && "Your Artist Identity"} 
                {selectedRole === "Fan" && "Your Fan Profile"}
              </CardTitle>
              <CardDescription>A few more details to get you started.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRole === "Buyer" && (
                <>
                  <FormField control={form.control} name="venueName" render={({ field }) => (
                    <FormItem><FormLabel>Venue Name</FormLabel><FormControl><Input placeholder="e.g., The Groove Lounge" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="venueLocation" render={({ field }) => (
                    <FormItem><FormLabel>Venue Location</FormLabel><FormControl><Input placeholder="e.g., New York, NY" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </>
              )}
              {selectedRole === "Artist" && ( // Changed from "Seller"
                <>
                  <FormField control={form.control} name="djName" render={({ field }) => ( // djName is used in artistSchema
                    <FormItem><FormLabel>Artist Name</FormLabel><FormControl><Input placeholder="e.g., DJ Sparkle" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="djLocation" render={({ field }) => ( // djLocation is used in artistSchema
                    <FormItem><FormLabel>Your Location</FormLabel><FormControl><Input placeholder="e.g., Los Angeles, CA" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="genres" render={() => ( // genres is used in artistSchema
                    <FormItem>
                      <FormLabel>Main Genres (select up to 5)</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                        {artistProfileGenres.map((genre) => (
                          <FormField key={`artist-${genre}`} control={form.control} name="genres" // Changed from dj- to artist-
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox checked={field.value?.includes(genre)}
                                    onCheckedChange={(checked) => {
                                      const currentGenres = field.value || [];
                                      if (checked) {
                                        if (currentGenres.length < 5) field.onChange([...currentGenres, genre]);
                                        else toast({ title: "Limit Reached", description: "You can select up to 5 genres.", variant: "default" });
                                      } else {
                                        field.onChange(currentGenres.filter(value => value !== genre));
                                      }
                                    }} />
                                </FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">{genre}</FormLabel>
                              </FormItem>
                            )} />
                        ))}
                      </div><FormMessage />
                    </FormItem>
                  )} />
                </>
              )}
              {selectedRole === "Fan" && (
                <>
                  <FormField control={form.control} name="username" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><User className="mr-2 h-4 w-4"/>Username</FormLabel>
                      <FormControl><Input placeholder="Your unique username" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="profilePic" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center"><ImageIconLucide className="mr-2 h-4 w-4"/>Profile Picture (Optional)</FormLabel>
                      <FormControl><Input type="file" accept="image/*" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} /></FormControl>
                      <FormDescription>Upload an image for your profile.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="favoriteGenres" render={() => (
                    <FormItem>
                      <FormLabel>Favorite Genres (select all that apply)</FormLabel>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                        {fanFavoriteGenresList.map((genre) => (
                          <FormField key={`fan-${genre}`} control={form.control} name="favoriteGenres"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl><Checkbox checked={field.value?.includes(genre)}
                                  onCheckedChange={(checked) => field.onChange(
                                    checked ? [...(field.value || []), genre] : field.value?.filter(value => value !== genre)
                                  )} /></FormControl>
                                <FormLabel className="text-sm font-normal cursor-pointer">{genre}</FormLabel>
                              </FormItem>
                            )} />
                        ))}
                      </div><FormMessage />
                    </FormItem>
                  )} />
                </>
              )}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
              <Button onClick={handleNext}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </CardFooter>
          </Card>
        );
      case 4: // Confirmation / Submit
         return (
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Go!</CardTitle>
              <CardDescription>Review your information and create your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>You are signing up as a <span className="font-semibold text-primary">{selectedRole}</span>.</p>
              <p>Email: <span className="font-semibold">{form.getValues("email")}</span></p>
              {selectedRole === "Fan" && <p>Username: <span className="font-semibold">{form.getValues("username")}</span></p>}
              {selectedRole === "Buyer" && <p>Venue: <span className="font-semibold">{form.getValues("venueName")}</span> at <span className="font-semibold">{form.getValues("venueLocation")}</span></p>}
              {selectedRole === "Artist" && <p>Artist Name: <span className="font-semibold">{form.getValues("djName")}</span> playing <span className="font-semibold">{form.getValues("genres")?.join(', ')}</span></p>}
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={handlePrev}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button>
              <Button type="submit" size="lg">
                <UserPlus className="mr-2 h-5 w-5" /> Create Account
              </Button>
            </CardFooter>
          </Card>
        );
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col items-center">
          {renderStepContent()}
        </form>
      </Form>
      {currentStep > 1 && ( 
          <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/login">Log in</Link>
              </Button>
              </p>
          </div>
      )}
       <p className="mt-8 text-center text-sm text-muted-foreground">
        This is a prototype. Account creation is simulated.
      </p>
    </div>
  );
}
