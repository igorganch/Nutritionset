import { Image, StyleSheet, Platform } from 'react-native';
import {Text, View, } from 'react-native'

export default function FoodbankScreen() {
  return (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text>Food Bank</Text>
  </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
