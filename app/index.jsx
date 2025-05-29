import React from "react";
import { registerRootComponent } from "expo";
import AppNavigator from "./AppNavigator"; // Corrected path

function App() {
  return <AppNavigator />;
}

export default registerRootComponent(App);