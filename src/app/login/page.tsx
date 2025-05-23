
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { siteConfig, type UserRole } from "@/config/site";
import { Disc3, LogIn } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Import next/image

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export default function LoginPage() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Login attempt:", values);
    
    let mockRole: UserRole = "Fan"; 
    if (values.email.startsWith("admin@")) mockRole = "Admin";
    else if (values.email.startsWith("buyer@")) mockRole = "Buyer";
    else if (values.email.startsWith("seller@")) mockRole = "Seller";

    if (typeof window !== 'undefined' && window.handleAuthSuccess) {
      window.handleAuthSuccess(mockRole); 
      toast({
        title: "Login Successful!",
        description: `Welcome back to ${siteConfig.name}! You are now logged in as a ${mockRole}.`,
      });
    } else {
      toast({
        title: "Login Error",
        description: "Could not complete login process. (window.handleAuthSuccess not found)",
        variant: "destructive",
      });
      console.warn("Login attempt, but window.handleAuthSuccess is not defined. This function should be set by AppLayout.");
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Column - Video/Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-muted/50 p-0 relative overflow-hidden">
         {/* YouTube video iframe */}
        <iframe 
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube.com/embed/GnGrjR3g24E?autoplay=1&mute=1&loop=1&playlist=GnGrjR3g24E&controls=0&showinfo=0&autohide=1&modestbranding=1&iv_load_policy=3"
            title="SpinKit promotional video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        ></iframe>
        <div className="absolute inset-0 bg-black/50 z-10"></div> {/* Dark overlay for text readability */}
        <div className="z-20 text-center text-white p-12">
          <Disc3 className="h-24 w-24 text-primary mx-auto mb-6 drop-shadow-lg" />
          <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">{siteConfig.name}</h1>
          <p className="text-2xl text-slate-200 drop-shadow-md">
            Connect. Collaborate. Create the Vibe.
          </p>
        </div>
      </div>

      {/* Right Column - Login Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 md:p-12">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 lg:hidden"> 
              <Disc3 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Log in to access your {siteConfig.name} account.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">
                  <LogIn className="mr-2 h-5 w-5" /> Log In
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
