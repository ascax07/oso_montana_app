// Categorias.js

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';

const Categorias = ({ categories, activeCategoryId, handlePress }) => {
  return (
    <FlatList
      horizontal
      data={categories}
      keyExtractor={(item) => item}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => handlePress(item)}
          style={styles.button}
        >
          <Text
            style={[
              styles.categoriaTexto,
              activeCategoryId === item && styles.activeText
            ]}
          >
            {item}
          </Text>
          {activeCategoryId === item && <View style={styles.indicador} />}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  button: {
    marginRight: 16,
    alignItems: 'center',
  },
  categoriaTexto: {
    color: '#888',
    fontSize: 18,
  },
  activeText: {
    color: '#D1425A',
  },
  indicador: {
    height: 6,
    width: 6,
    backgroundColor: '#D1425A',
    borderRadius: 3,
    marginTop: 4,
  },
});

export default Categorias;
