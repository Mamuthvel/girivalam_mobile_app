import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { Home, Map, BookOpen, Users, Menu, X, LogOut, User, LogIn, Shield, MessageSquare, Settings, MapPinPlus, AlertTriangle, Heart, MoreHorizontal, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/newlogo.svg?format=webp&w=128&q=80";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navigate } from "react-router-dom";
import { logger } from "@/lib/logger";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleShare = async () => {
    const shareData = {
      title: 'Arunachala Vibe - Sacred Girivalam',
      text: '🙏 Start your sacred Girivalam journey with me',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: "Link copied",
          description: "Share link copied to clipboard",
        });
      }
    } catch (error) {
      // User cancelled or error - silently ignore
      if ((error as Error).name !== 'AbortError') {
        logger.error('Share failed:', error);
      }
    }
  };

  // Primary items always visible on desktop
  const primaryNavItems = [
    { name: t('nav.home'), href: "/" , icon: Home },
    { name: t('nav.map'),  href: "/girivalam-map", icon: Map },
    { name: t('nav.guide'),    href: "/ai-guide",    icon: BookOpen },
    { name: t('nav.services'), href: user ? "/girivalam-services" : "/girivalam-services-preview", icon: Users },
    ...(user ? [{ name: "My Girivalam", href: "/my-girivalam-history", icon: User }] : []),
  ];

  // Secondary items — auth-required ones are hidden from guests
  const secondaryNavItems = [
    ...(user ? [
      { name: "Personal",                   href: "/personal",          icon: User       },
      { name: t('nav.donate'),              href: "/support-girivalam", icon: Heart      },
      { name: t('nav.savedLocations'),      href: "/saved-locations",   icon: MapPinPlus },
      { name: t('nav.settings'),            href: "/settings",          icon: Settings   },
    ] : []),
    { name: t('nav.emergency'), href: "/emergency-contacts", icon: AlertTriangle },
    { name: t('nav.feedback'),  href: "/feedback",           icon: MessageSquare },
  ];

  // All items for mobile
  const navigationItems = [...primaryNavItems, ...secondaryNavItems];

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Use secure SECURITY DEFINER function to check admin status
      const { data, error } = await supabase.rpc('is_admin', { _user_id: user.id });

      if (error) {
        logger.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data === true);
    };

    checkAdminStatus();
  }, [user]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      setIsOpen(false);
    }
  };
  const handleLogIn = () => {
    navigate("/auth")
  }
  const handleProfileClick = () => {
    navigate("/profile");
  }
  return (
    <>
      <nav className="hidden md:flex bg-card/80 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-3 shadow-lg">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoUrl} alt="Arunachala Vibe" className="h-8 w-auto" loading="eager" fetchPriority="high" />
            <span className="sr-only">Arunachala Vibe</span>
          </Link>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Share Icon - Telegram-style send/paper-rocket */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors md:hidden"
            aria-label="Share this page"
          >
            <Send className="h-4 w-4 text-muted-foreground/60 hover:text-primary transition-colors" />
          </button>

          <div className="h-5 w-px bg-border/40 mx-1" />

          {/* Primary Nav Items - Always Visible */}
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-1.5 px-2 lg:px-3 py-2 rounded-xl transition-all duration-300 whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-primary/10 text-foreground"
                )
              }
            >
              <item.icon className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
              <span className="font-medium text-sm lg:text-base">{item.name}</span>
            </NavLink>
          ))}

          {/* More Dropdown for Secondary Items */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-1.5 px-2 lg:px-3 py-2 rounded-xl hover:bg-primary/10 text-foreground"
              >
                <MoreHorizontal className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
                <span className="font-medium text-sm lg:text-base">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-lg z-50">
              {secondaryNavItems.map((item) => (
                <DropdownMenuItem key={item.name} asChild className="cursor-pointer">
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 w-full",
                        isActive && "text-primary font-medium"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {isAdmin && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-1.5 px-2 lg:px-3 py-2 rounded-xl transition-all duration-300 whitespace-nowrap",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "hover:bg-primary/10 text-foreground"
                )
              }
            >
              <Shield className="h-4 w-4 lg:h-5 lg:w-5 shrink-0" />
              <span className="font-medium text-sm lg:text-base">Admin</span>
            </NavLink>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 px-3 py-2 min-w-0">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium max-w-[120px] lg:max-w-[150px] truncate hidden sm:inline">
                    {user?.email?.split("@")[0]}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card border-border shadow-lg z-50">
                <DropdownMenuLabel className="font-semibold" onClick={handleProfileClick}>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled className="text-sm text-muted-foreground cursor-default focus:bg-transparent">
                  {user?.email?.split("@")[0]}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogIn}
              variant="outline"
              className="flex items-center gap-2 px-4 rounded-xl border-primary/20 text-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300"
            >
              <LogIn className="h-4 w-4" />
              <span className="font-medium">Login</span>
            </Button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden w-full flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center">
            <img src={logoUrl} alt="Arunachala Vibe" className="h-7 sm:h-8 w-auto" loading="eager" />
            <span className="sr-only">Arunachala Vibe</span>
          </Link>

          {/* Language switcher */}
          <LanguageSwitcher />

          {/* Share Icon - Telegram-style send/paper-rocket */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg hover:bg-muted/50 active:scale-95 transition-all"
            aria-label="Share this page"
          >
            <Send className="h-3.5 w-3.5 text-muted-foreground/60" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Avatar className="h-8 w-8 border-2 border-primary/20" onClick={handleProfileClick} >
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {user.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
          <button
            onClick={() => setIsOpen(true)}
            className="bg-primary text-primary-foreground p-2.5 sm:p-3 rounded-xl shadow-lg active:scale-95 transition-transform"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Mobile Menu Overlay — portalled to body so it sits above all page stacking contexts */}
        {isOpen && createPortal(
          <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
            <div
              className="flex h-full flex-col bg-card border-r border-border shadow-2xl w-[85vw] max-w-sm ml-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <img src={logoUrl} alt="Arunachala Vibe" className="h-7 sm:h-8 w-auto shrink-0" />
                  <h2 className="font-playfair text-lg sm:text-xl font-semibold truncate">Arunachala Vibe</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <nav className="flex-1 p-4 sm:p-6 space-y-2 overflow-y-auto">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 active:scale-95",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-primary/10 text-foreground active:bg-primary/20"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 sm:h-6 sm:w-6 shrink-0" />
                    <span className="font-medium text-base sm:text-lg">{item.name}</span>
                  </NavLink>
                ))}

                {user ? (
                  <div className="p-4 sm:p-6 border-t border-border space-y-3 shrink-0 bg-card">
                    <div className="bg-background rounded-xl p-4 shadow-sm border border-border/50">
                      <p className="text-sm font-semibold text-foreground mb-3">My Account</p>
                      <div className="flex items-center gap-3 mb-4" onClick={handleProfileClick}>
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 border-2 border-primary/20">
                          <AvatarFallback className="bg-primary/10 text-primary font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full flex items-center gap-3 px-4 py-2.5 justify-center text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 active:scale-95 transition-transform"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span className="font-medium">Logout</span>
                      </Button>
                    </div>
                  </div>
                ) : <Button
                  onClick={handleLogIn}
                  variant="outline"
                  className="w-full flex items-center gap-3 px-4 py-2.5 justify-center 
                  text-primary border-primary 
                  hover:bg-primary hover:text-white 
                  rounded-xl active:scale-95 transition"
                >
                  <LogIn className="h-4 w-4 shrink-0" />
                  <span className="font-medium">LogIn</span>
                </Button>
                }
              </nav>
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
};