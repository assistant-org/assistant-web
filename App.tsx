import Providers from "./src/shared/context/Providers";
import AppRoutes from "./src/shared/routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <Providers>
      <AppRoutes />
      <Toaster />
    </Providers>
  );
}
