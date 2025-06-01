import { registerRootComponent } from "expo";
import AppNavigator from "./Navigator/AppNavigator"; // Corrected path

function App() {
  return <AppNavigator />;
}

export default registerRootComponent(App);