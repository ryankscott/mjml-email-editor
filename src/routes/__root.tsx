import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";

import { BrandProvider } from "../components/editor/BrandProvider";
import { EditorProvider } from "../components/editor/EditorProvider";
import { Toaster } from "../components/ui/sonner";
import { ToastProvider } from "../shared/ui/ToastProvider";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => {
    return (
      <ToastProvider>
        <BrandProvider>
          <EditorProvider>
            <Outlet />
            <Toaster />
            <TanStackDevtools
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
                TanStackQueryDevtools,
              ]}
            />
          </EditorProvider>
        </BrandProvider>
      </ToastProvider>
    );
  },
});
