# Manual de Políticas de Desarrollo Seguro de Software

## 1. Generalidades

### 1.1 Objetivo

Establecer los lineamientos aplicables a todo el ciclo de vida de desarrollo de software desarrollado por Horbath Technologies S.A.S., que permitan regular y establecer el marco normativo interno frente a la gestión y desarrollo de software.

### 1.2 Alcance

Estas políticas como parte del Sistema de Gestión de Seguridad de la Información (SGSI), tiene alcance en todos los procesos necesarios para gestionar el ciclo de vida de los Software, aplicaciones y sistemas de información que se desarrollen por Horbath Technologies S.A.S.

### 1.3 Responsables

El manual de políticas de desarrollo de software es elaborado por Operations & Services Management. La Alta dirección realizara las gestiones requeridas para que el manual de políticas de desarrollo de software y las directrices contenidas en él, sean comunicadas a todas las partes interesadas de la organización.

### 1.4 Definiciones

- **Ambiente de Desarrollo**: Infraestructura tecnológica (hardware y software), controlado por el o los desarrolladores de la funcionalidad con el fin de poder documentar el código de programación sin afectar otros ambientes.
- **Ambiente de Producción**: Infraestructura tecnológica (hardware y software), en donde se aloja la última versión estable y en uso de la funcionalidad desarrollada.
- **Ambiente de Pruebas**: Infraestructura tecnológica (hardware y software), controlado tanto por el o los desarrolladores de software, como por el o los usuarios de pruebas del proceso de negocio que solicita el desarrollo del software, con el fin de poder realizar las pruebas necesarias a la funcionalidad en desarrollo con el fin de garantizar su correcto funcionamiento.
- **Casos de Pruebas**: Documentación que se realiza con el fin de determinar si el sistema de información construido cumple con los requerimientos funcionales y no funcionales identificados en la etapa de análisis.
- **Desarrollo de software**: Actividades involucradas desde la concepción de la idea, análisis, diseño, construcción e implementación de aplicaciones de software.
- **Requerimiento**: Concepción de la idea la cual busca generar soluciones a necesidades específicas, el cual se puede manejar mediante una herramienta automatizada de software.
- **Software**: Aplicaciones desarrolladas bajo un lenguaje de programación y un entorno de ejecución que dan solución a un problema o necesidad específica.

## 2. Políticas de Desarrollo de Software

### 2.1 Aspectos Generales

#### 2.1.1 Patrones de Diseño

Los patrones de diseño describen una solución a un problema recurrente en diseño el cual ocurre en un contexto dado. Estas soluciones han sido extractadas de la solución de problemas reales y especificadas formalmente en documentos disponibles en la industria como un mecanismo de distribución de conocimiento. Los patrones de diseño se clasifican en:

- Patrones Creacionales
- Patrones Estructurales
- Patrones de Comportamiento

#### 2.1.2 Metodologías de Desarrollo

Durante el proceso de desarrollo de software se deben tener unas buenas prácticas y un proceso claro para trabajar colaborativamente en equipo. Horbath Technologies S.A.S en cabeza de Operations & Services Management debe propender por la implementación y cumplimiento de metodologías de desarrollo que permitan agilizar la entrega de valor en el menor tiempo posible.

#### 2.1.3 Documentación de los Sistemas de Información y Aplicaciones

Tener la información de los sistemas de información y aplicaciones documentada de acuerdo con las metodologías de desarrollo es un indicio que se ha realizado un ejercicio de planificación y diseño de los sistemas de información. La documentación de los proyectos de desarrollo es importante para Horbath Technologies S.A.S pues el conocimiento alrededor de un sistema no se centraliza en personas sino en documentos, garantizando así la transferencia del conocimiento.

#### 2.1.4 Estándares, Herramientas y Tecnologías para el desarrollo de Software

Los estándares de desarrollo son necesarios para la generación de pautas o lineamientos que se adoptan para conseguir una uniformidad en el desarrollo, facilitando el mantenimiento y la actualización de los aplicativos.

### 2.2 Lineamientos

1. El Head of Operations se compromete a estipular atributos de calidad de software como la modificabilidad, la escalabilidad, la seguridad de la información entre otros, al implantar la presente política de desarrollo y mantenimiento de software.
2. La verificación de la aplicación de la política de desarrollo y mantenimiento de software está a cargo Head of Operations.
3. Los terceros involucrados y todos aquellos actores que tengan responsabilidad sobre el desarrollo y mantenimiento de sistemas de información, deben optar los lineamientos contenidos en la presente política.
4. Operations & Services Management es responsable de hacer conocer a los terceros, funcionarios involucrados y vinculados a Horbath Technologies S.A.S los lineamientos definidos en la presente política.
5. El incumplimiento parcial o total por parte de cualquier tercero o funcionario de la presente política podrá constituirse como falta disciplinaria y por lo tanto podrá dar lugar a la acción e imposición de la sanción correspondiente.

### 2.3 Política de Desarrollo y Mantenimiento de Software

#### 2.3.1 Atributos de Calidad

**A. Disponibilidad:** Antes de pasar un sistema a producción, cada proyecto deberá contar con un documento donde especifique los parámetros tenidos en cuenta para garantizar la calidad y disponibilidad del sistema.

**B. Capacidad de Mantenimiento:** Cada producto de software debe ser capaz de aceptar la implementación de correcciones y/o mejoras a nivel de código, cambios en su entorno y especificaciones de requerimientos funcionales. Durante esta modificación, la aplicación debe conservar su criterio de estabilidad para así evitar efectos inesperados en su ejecución.

**C. Capacidad para ser Analizado:** Todo proyecto de software que vaya a ser implementado en producción debe contar con funcionalidades que permitan realizar seguimientos a los errores y excepciones a nivel de software.

**D. Portabilidad:** Las aplicaciones y sistemas de información desarrollados deben tener la capacidad de cambiar de ambiente de producción de una manera ágil, sin afectar su funcionalidad inicial. También está relacionada con la capacidad que tiene el software para ejecutarse en diferentes plataformas (Web, PC, Tablet).

**E. Eficiencia:** Cada software, aplicación y sistema de información hará un adecuado uso de los recursos ofrecidos para su entorno de producción. Los tiempos de respuesta y procesamiento de la aplicación serán los apropiados de acuerdo con los requerimientos de las partes interesadas.

**F. Funcionalidad:** Los software, aplicaciones y sistemas de información desarrollados deben cumplir y proveer las funciones para satisfacer las necesidades consignadas explícitamente en el levantamiento de requerimientos funcionales.

**G. Interoperabilidad:** Todo desarrollo de software debe tener la capacidad de intercambiar datos con otras aplicaciones o bases de datos por medio del formato JSON o Web Services, ETL u otro mecanismo que permita interactuar con otros sistemas.

**H. Seguridad:** Todo Software, aplicación o sistema de información desarrollado por Horbath Technologies S.A.S tendrá la capacidad de proteger la información y los datos de tal forma que los usuarios y/o sistemas no autorizados no puedan acceder a ellos. Métodos propuestos:

- Antes de realizar el paso a producción, cuando aplique, todo proyecto de software debe contar con el visto bueno correspondiente.
- Todo software, aplicación o sistema debe contar con un módulo de seguridad que garantice la identificación y autenticación por medio de usuario y contraseña.
- Se debe proteger la información sensible como (contraseñas, tokens, firmas digitales) en todos sus estados: tránsito, en reposo y en uso por medio de herramientas y técnicas criptográficas.

**I. Usabilidad:** Todos los sistemas desarrollados y sus componentes deben ser entendidos y aprendidos por el usuario de manera sencilla y práctica. Todo producto de software deberá seguir parámetros de usabilidad cómo simplicidad, organización de los elementos y adaptación a diferentes dispositivos, navegación intuitiva y accesibilidad.

**J. Facilidad de Pruebas:** Todo software, aplicación o sistema de información debe permitir pruebas a los componentes desarrollados o modificados. Tipos de pruebas:

- Pruebas con usuario final para determinar si el sistema cumple con los requerimientos.
- Pruebas unitarias de código para garantizar el funcionamiento esperado de los métodos.
- Pruebas de integración sobre cada uno de los módulos y otros sistemas.
- Pruebas funcionales de sistema que validen su funcionamiento en condiciones específicas.
- Pruebas de regresión posteriores a una modificación y/o mejora.

**K. Facilidad de Despliegue:** Los software, aplicaciones y sistemas de información deben permitir ser instalados y configurados en producción sin afectar su integridad ni su total funcionalidad. Entregables requeridos:

- Documento de instalación, configuración, integración y migración.
- Manual de usuario (si aplica).
- Manual de administración (si aplica).

**L. Facilidad de Desarrollo:** Los software, aplicaciones y sistemas de información deben ser codificados utilizando estándares de calidad que permitan al desarrollador atender los proyectos en el menor tiempo posible y haciendo uso de patrones de diseño.

#### 2.3.2 Gestión y Documentación de los Sistemas de Información

1. Todas las iniciativas de desarrollo de software y las nuevas aplicaciones que se implementen en el cliente, deben ser analizadas y gestionadas por la dirección de operaciones y el líder técnico.
2. El proceso de operaciones debe disponer de un sitio para alojar la documentación requerida para el almacenamiento de la documentación relacionada con los desarrollos.
3. Todo desarrollo que se realice para Horbath Technologies S.A.S debe generar los siguientes entregables:
   - Plan de trabajo de acuerdo con la metodología de desarrollo.
   - Historias de usuario.
   - Diagramas de flujo y requerimientos funcionales.
   - Solicitud de cambios o ajustes a software.
   - Documento de casos de pruebas.
   - Manual de usuario.
   - Códigos fuentes debidamente documentados (en los casos que aplique).
   - Paso a producción de software.
   - Diccionario De Modelo De Datos.
   - Diagrama de arquitectura de software.
4. Todo proyecto de software, aplicaciones o sistema de información que sea puesto en producción debe estar autorizado previamente por Operations & Services Management.
5. El proceso de operaciones como encargada de los sistemas de información debe custodiar los archivos fuentes (cuando aplique), instaladores y las bases de datos de las aplicaciones propiedad del cliente.
6. Para el manejo de nomenclatura de desarrollo el proveedor debe adoptar estándares que aseguren un código legible, fácil de entender y mantener.
7. Para garantizar seguridad de la información se deben establecer para cada proyecto la separación de ambientes de desarrollo, prueba y producción.
8. Las herramientas de desarrollo de software utilizadas por la empresa deben estar licenciadas.
9. Se debe hacer uso de un software de control de versiones el cual salvaguarde la integridad del código fuente desarrollado.
10. La empresa debe mantener actualizada las versiones de lenguaje de programación, frameworks y librerías usadas en los proyectos, de acuerdo con los niveles de servicio contratado por el cliente.

## 3. Cumplimiento del Manual de Políticas de Seguridad de la Información

El Head of Operations es responsable de socializar y verificar el cumplimiento de los lineamientos establecidos en el presente manual y de comunicar los cambios a los todos miembros de Operations & Services Management.

Todos los funcionarios, proveedores externos y contratistas deben cumplir con la Normatividad vigente adoptada por la organización, leyes de derechos de autor, acuerdos de licenciamiento de software, acuerdos de confidencialidad y las políticas y directrices contempladas en el presente Manual.

El incumplimiento de estas políticas de desarrollo de software traerá consigo las consecuencias legales que apliquen y las establecidas en Reglamento Interno de Trabajo, incluyendo lo establecido en las normas que competen al Gobierno Nacional y Territorial en cuanto a seguridad y privacidad de la información se refiere.
