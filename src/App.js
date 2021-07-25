import { createTheme, ThemeProvider } from "@material-ui/core";
import Globe from "./Globe";

const theme = createTheme({
  palette: {
    type: "dark",
  },
  typography: {
    allVariants: {
      color: "white",
    },
  },
});
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <Globe />
      </div>
    </ThemeProvider>
  );
}
