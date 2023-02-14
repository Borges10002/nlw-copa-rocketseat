import { useEffect, useState } from "react";
import { Share } from "react-native";
import { useRoute } from "@react-navigation/native";
import { HStack, Stack, useToast, VStack } from "native-base";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { api } from "../services/api";
import { PoolCardPros } from "../components/PoolCard";
import { PoolHeader } from "../components/PoolHeader";
import { EmptyMyPoolList } from "../components/EmptyMyPoolList";
import { Option } from "../components/Option";
import { Guesses } from "../components/Guesses";

interface RouteParams {
  id: string;
}

export function Details() {
  const [optionSelected, setOptionSelected] = useState<'Seus Palpites' | 'Ranking do Grupo'>('Seus Palpites');
  const [isLoading, setIsLoading] = useState(true);
  const [poolDetails, setPoolsDetails] = useState<PoolCardPros>({} as PoolCardPros);

  const route = useRoute();
  const toast = useToast();

  const { id } = route.params as RouteParams;

  async function fetchPoolsDetails() {
    try {
      setIsLoading(true);

      const response = await api.get(`/pools/${id}`);
      setPoolsDetails(response.data.pool);

    } catch (error) {
      console.log(error);
      toast.show({
        title: 'Não foi possivel carregar os detalhes do bolões',
        placement: 'top',
        bgColor: 'red.500'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCodeShare() {
    await Share.share({
      message: poolDetails.code
    })
  }

  useEffect(() => {
    fetchPoolsDetails();
  }, [id]);

  if (isLoading) {
    return (
      <Loading />
    )
  };

  return (
    <Stack flex={1} bgColor="gray.900">
      <Header
        title={poolDetails.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />
      {
        poolDetails._count?.participants > 0 ?
          <VStack px={5} flex={1}>
            <PoolHeader data={poolDetails} />
            <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
              <Option title="Seus palpites" isSelected={optionSelected === 'Seus Palpites'} onPress={() => setOptionSelected('Seus Palpites')} />
              <Option title="Ranking do grupo" isSelected={optionSelected === 'Ranking do Grupo'} onPress={() => setOptionSelected('Ranking do Grupo')} />
            </HStack>
            <Guesses poolId={poolDetails.id} code={poolDetails.code} />
          </VStack>
          : <EmptyMyPoolList code={poolDetails.code} />
      }
    </Stack>
  )
}