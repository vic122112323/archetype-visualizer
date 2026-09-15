Archetype Visualizer

Aplicación web para explorar los arquetipos de rendimiento de aplicaciones software propuestos.

Este proyecto forma parte de un Trabajo de Fin de Grado.


¿Qué hace?

La aplicación tiene cuatro secciones, accesibles desde la barra de navegación superior.

Arquetipos es un explorador con buscador que muestra, para cada arquetipo  y sus subtipos, sus características, los criterios que lo definen, ejemplos representativos y su perfil en un diagrama radial.

Criterios deja explorar por separado cada eje de clasificación (patrón de acceso, working set, comportamiento de caché, intensidad computacional, entre otros) junto con los valores posibles de cada uno y los arquetipos a los que están asociados.

Diagramas muestra los perfiles radiales de todos los arquetipos, tanto por separado como combinados, agrupando familias y subtipos para comparar.

Predictor parte de contadores hardware obtenidos con perf stat, calcula a partir de ellos los ratios derivados, y estima con eso el arquetipo de rendimiento más probable de una aplicación, junto con los criterios que lo justifican.

Los datos de arquetipos, criterios y ejes radiales estan en src/data/data.json y src/data/radar.json.


Estructura del proyecto

src/
  app/                  Punto de entrada de la app
  components/           Componentes de cada sección
  data/                 Datos de arquetipos, criterios y ejes radiales (JSON)


Puesta en marcha

bash
npm install
npm run dev

Abre http://localhost:3000/archetype-visualizer en el navegador.

O busca https://vic122112323.github.io/archetype-visualizer/ 