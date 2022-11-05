import { Box } from "native-base";
import { NavigationContainer } from "@react-navigation/native";

import { AppRoutes } from "./app.routes";

export function Routes() {
  //   const { user } = useAuth();

  return (
    <Box flex={1} bgColor="gray.900">
      <NavigationContainer>
        {/* {user.name ? <AppRoutes /> : <SignIn />} */}
        <AppRoutes />
      </NavigationContainer>
    </Box>
  );
}
