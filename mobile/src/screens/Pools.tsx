import React, { useCallback, useState } from 'react';
import { VStack, Icon, useToast, FlatList } from 'native-base';
import { Octicons} from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { api } from '../services/api';
import { PoolCard, PoolCardPros } from '../components/PoolCard';
import { EmptyPoolList } from '../components/EmptyPoolList';
import { Loading } from '../components/Loading';

export function Pools() {
  const navigation = useNavigation();
  const [pools, setPools] = useState<PoolCardPros[]>([]);
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
 
  async function fetchPools (){
    try {
      setIsLoading(true);
      const response = await api.get('/pools');
      setPools(response.data.pools);
    } catch (error) {
      console.log(error);
       toast.show({
        title: 'Não foi possivel carregar os bolões',
        placement: 'top',
        bgColor: 'red.500'
    });
    }finally{
      setIsLoading(false);
    }
  }

  useFocusEffect(useCallback(() => {
    fetchPools();
  }, []));

  return (
    <VStack flex={1} bgColor="gray.900">
      <Header title="Meus bolões" 
          showBackButton
          showShareButton
          onShare={() => {}}
      />
      <VStack mt={6} 
              mx={5} borderBottomWidth={1} 
              borderBottomColor="gray.600" 
              pb={4}
              mb={4}>
                
         <Button title="BUSCAR BOLÃO POR CÓDIGO"
          leftIcon={<Icon as={Octicons} name="search" 
          color="black" size="md" />}
          onPress={() => navigation.navigate('find')}
         />
      </VStack>
      {
        isLoading ? <Loading /> :
        <FlatList 
          data={pools}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
          <PoolCard 
            data={item}
            onPress={() => navigation.navigate('details', {id: item.id})}
          />
          )
        }
          ListEmptyComponent={() => <EmptyPoolList /> }
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{pb: 20}}
          px={5}
        />
      }
    </VStack>
  );
}