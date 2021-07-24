import { createTheme, ThemeProvider } from "@material-ui/core";
import Globe from "./Globe";

const theme = createTheme({});
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Globe />
      </div>
    </ThemeProvider>
  );
}
