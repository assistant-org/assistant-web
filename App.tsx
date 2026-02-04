import Providers from "./src/shared/context/Providers";
import AppRoutes from "./src/shared/routes";

export default function App() {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  );
}
