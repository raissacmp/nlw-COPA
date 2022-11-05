import { useState } from "react";
import { Heading, Text, VStack, useToast } from "native-base";

import Logo from "../assets/logo.svg";
import { Button } from "../components/Button";
import { Header } from "../components/Header";
import { Input } from "../components/Input";

import { api } from "../services/api";

export function New() {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const toast = useToast();

  async function handlePoolCreate() {
    if (!title.trim()) {
      //trim - remover espaçços vazios
      return toast.show({
        title: "Eita! Você não informou o nome do seu bolão 😞",
        placement: "top",
        bgColor: "red.500",
      });
    }

    try {
      setIsLoading(true);
      await api.post("/pools", { title });
      toast.show({
        title: "Bolão criado com sucesso! ⚽",
        placement: "top",
        bgColor: "green.500",
      });
      setTitle("");
    } catch (error) {
      console.log(error);
      toast.show({
        title: "Não conseguimos criar seu bolão 😕 Tente novamente mais tarde!",
        placement: "top",
        bgColor: "red.500",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <VStack flex={1} bg="gray.900">
      <Header title="Criar novo bolão" />

      <VStack mt={8} mx={5} alignItems="center">
        <Logo />

        <Heading
          fontFamily="heading"
          color="white"
          fontSize="xl"
          my={8}
          textAlign="center"
        >
          Crie seu próprio bolão da copa{"\n"}e compartilhe entre amigos!
        </Heading>

        <Input
          mb={2}
          placeholder="Qual o nome do seu bolão?"
          onChangeText={setTitle} //pega automaticamente o valor do input
          value={title} //pra limpar o conteúdo
        />

        <Button
          title="CRIAR MEU BOLÃO"
          onPress={handlePoolCreate}
          isLoading={isLoading}
        />

        <Text color="gray.200" fontSize="sm" textAlign="center" px={10} mt={4}>
          Após criar seu bolão, você receberá um código único que poderá usar
          para convidar outras pessoas.
        </Text>
      </VStack>
    </VStack>
  );
}
