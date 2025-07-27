// SelectTimeComponent.tsx
import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface SelectTimeComponentProps {
  rango: string;
  setRango: (rango: string) => void;
  rangos: string[];
}

const SelectTimeComponent: React.FC<SelectTimeComponentProps> = ({ rango, setRango, rangos }) => {
  const handleRangoChange = useCallback(
    (newRango: string) => {
      setRango(newRango);
    },
    [setRango]
  );

  return (
    <View>
      <Text style={styles.subtitulo}>Datos promediados</Text>
      <Text style={styles.tituloRango}>Último {rango}</Text>
      <View style={styles.rangoSelector}>
        {rangos.map((opcion) => (
          <TouchableOpacity
            key={opcion}
            style={[styles.botonRango, rango === opcion && styles.rangoActivo]}
            onPress={() => {
              handleRangoChange(opcion);
            }}
          >
            <Text>{opcion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  subtitulo: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 20,
  },
  tituloRango: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 10,
  },
  rangoSelector: {
    flexDirection: "row",
    marginVertical: 10,
    gap: 8,
  },
  botonRango: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
  },
  rangoActivo: {
    backgroundColor: "#ccc",
  },
});

export default SelectTimeComponent;