
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Index from "./pages/Index";
import Simulation from "./pages/Simulation";
import Reactions from "./pages/Reactions";
import ElementaryReactions from "./pages/ElementaryReactions";
import FreeMode from "./pages/FreeMode";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

// Configure the QueryClient with better mobile support
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  // Add mobile viewport meta tag dynamically
  useEffect(() => {
    // Check if the viewport meta tag already exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    // If it doesn't exist, create and append it
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }
    
    // Set the content attribute to enable proper mobile scaling
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    
    // Add touch-action CSS to improve touch response
    const style = document.createElement('style');
    style.textContent = `
      * {
        touch-action: manipulation;
      }
      html, body {
        overscroll-behavior: none;
        overflow-x: hidden;
        position: relative;
        height: 100%;
        width: 100%;
      }
      
      /* Improve mobile tap targets */
      button, a, [role="button"] {
        min-height: 44px;
        min-width: 44px;
      }
      
      /* Improve mobile form elements */
      input, select, textarea {
        font-size: 16px; /* Prevents zoom on iOS */
      }
      
      /* Better mobile scrolling */
      .scrollable {
        -webkit-overflow-scrolling: touch;
      }
      
      /* Orientation support */
      @media screen and (orientation: portrait) {
        .landscape-only {
          display: none;
        }
      }
      
      @media screen and (orientation: landscape) {
        .portrait-only {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              
              {/* These routes use SimulationProvider internally */}
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/free-mode" element={<FreeMode />} />
              <Route path="/reactions" element={<Reactions />} />
              <Route path="/elementary-reactions" element={<ElementaryReactions />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
