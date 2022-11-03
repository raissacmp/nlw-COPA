import { Center, Icon, Text } from "native-base";
import { Fontisto } from "@expo/vector-icons";
import Logo from "../assets/logo.svg";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/Button";

export function SignIn() {
  const { signIn, user } = useAuth();
  console.log("🚀 ~ file: SignIn.tsx ~ line 9 ~ SignIn ~ dados usuarios", user);

  return (
    <Center flex={1} bgColor="gray.900" p={7}>
      <Logo width={212} height={40} />
      <Button
        title="ENTRAR COM O GOOGLE"
        leftIcon={<Icon as={Fontisto} name="google" color="white" size="md" />}
        type="SECONDARY"
        mt={12}
        onPress={signIn}
      />
      <Text color="white" textAlign="center" mt={4}>
        Não utilizamos nenhuma informação além {"\n"} do seu e-mail para criação
        de sua conta.
      </Text>
    </Center>
  );
}
