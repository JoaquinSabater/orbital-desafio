# Orbital 2.0 - Migración de AtencionService

Hola. Acá está mi resolución del desafío. La respuesta al cliente de la Parte 2 está en RESPUESTA_CLIENTE.md.

## Cómo está armado y cómo probarlo

El backend está en Node con Express, el frontend en React con Vite y el script de la tabla en database/schema.sql. La lógica que migré de Java esta en backend/src/services/prioridad.js, separada de Express y de MySQL, para poder testearla sin levantar nada y reutilizarla cuando se migre el resto de Orbital. La API expone un único endpoint, POST /api/atenciones: la ruta está en backend/src/routes/atenciones.routes.js, el controlador que valida, calcula y responde en backend/src/controllers/atenciones.controller.js, y el INSERT parametrizado en backend/src/repositories/atenciones.repository.js. El formulario que la consume está en frontend/src/components/AtencionForm.jsx.

No tenía MySQL instalado, así que levanté la base en Docker. Dejo los pasos porque es la forma más rápida de probarlo (hace falta MySQL 8.0.16 o superior; yo usé Node 22):

```
docker run --name orbital-mysql -e MYSQL_ROOT_PASSWORD=root -p 3306:3306 -d mysql:8.4
docker cp database/schema.sql orbital-mysql:/schema.sql
docker exec orbital-mysql sh -c "mysql -uroot -proot < /schema.sql"

cd backend  && cp .env.example .env && npm install && npm test && npm run dev
.env: DB_USER=root y DB_PASSWORD=root si usan el contenedor de arriba
cd frontend && cp .env.example .env && npm install && npm run dev
```

Con todo andando cargué casos desde el formulario y revisé la tabla: un corporativo con calificación 2 da 2.00 (el Java daba 2.40), uno con 3 da 3.60, un VIP con 2 da 3.00 y un VIP con 5 urgente da 9.50. También mandé datos inválidos directo a la API y todos devolvieron 400 sin llegar a la base.

## Decisiones que tomé

La regla que faltaba la implementé así: si el cliente es corporativo y la calificación es 1 o 2, no se aplica el multiplicador (factor 1). Con 3 sí multiplica, el +2 de urgencia se mantiene y la regla no la extendí a VIP porque el comentario no lo dice. Para esto tuve que asumir algo: el método no recibe ningún dato sobre cómo fue la atención, así que interpreté que la calificación es la nota que el cliente le puso. Es el único dato donde "menor a 3" tiene sentido.

Hay tres cosas que me parecieron raras. La regla parece ir al revés de lo que uno esperaría en servicio al cliente (a un corporativo que calificó mal le baja la prioridad en vez de subirla). "Los VIP tienen máxima prioridad" no se cumple si se entiende como que van siempre primero, porque un VIP con calificación 1 queda debajo de un corporativo con 5. Y el tope de 10 nunca se alcanza, porque el máximo posible es 9.5. Las tres las validaría con negocio.

Migrar de Java a JavaScript no fue traducir línea por línea. En Java el tipo int ya garantiza un número entero; en JavaScript un texto como "abc" pasa la validación de rango del Java tal cual está escrita, y el string "false" cuenta como verdadero y sumaría la urgencia. Por eso valido los tipos de forma estricta y rechazo con 400 cualquier tipo de cliente que no sea VIP, CORPORATIVO o ESTANDAR (el Java lo dejaba pasar con factor 1; es un cambio a propósito). La prioridad la calcula siempre el backend y se redondea a dos decimales, porque 3 por 1.2 da 3.5999999999999996.

En la tabla usé DECIMAL para la prioridad (no FLOAT, porque tiene que ser exacta), ENUM para el tipo de cliente, DATETIME en UTC para la fecha (TIMESTAMP termina en 2038 y cambia según la zona horaria) y CHECK para que la base rechace valores imposibles aunque alguien inserte por fuera de la API. Guardo también el factor aplicado para poder auditar cada cálculo. No agregué índices porque hoy ninguna consulta los usa. El INSERT es parametrizado y, después de guardar, la API responde con los datos calculados sin volver a leer la fila.

Dejé afuera a propósito la autenticación (para una demo alcanza, pero antes de exponer la API haría falta), un usuario de base con permisos mínimos en vez de root, y la protección contra duplicados si se reintenta un pedido cuya respuesta se perdió.

## Examen de IA

Usé IA en todo el proceso, como sugiere la consigna, y quiero ser transparente sobre cómo. Con Claude (Opus 5.5) en chat analicé la consigna y el código Java, discutí las trampas y repasé conceptos del stack. Con Claude Code generé el código por fases, revisando cada una antes de commitearla. Y al final le pasé la solución terminada a GPT-6 con Astra como revisor independiente, pidiéndole una revisión crítica sin reescribir nada.

---------------------------------------------------------------------------------------------------------

*¿La IA detectó la regla de negocio no implementada en el comentario del Java?*

Sí. Igual hay que aclarar que le pasé el código junto con la consigna, y la consigna ya avisa que la regla falta, así que encontrarla no tuvo mucho mérito.

Lo que me resultó más útil fue lo que detectó además de la regla: que en JavaScript un texto pasa la validación de rango del Java, que el string "false" sumaría la urgencia, que 3 por 1.2 da 3.5999…, que el tope de 10 es inalcanzable y que la frase sobre los VIP es ambigua. Son cosas que, traduciendo el código línea por línea, se pasan por alto fácilmente.

Lo que no planteó ninguna IA, y me surgió a mí al revisar, fue la pregunta de fondo: ¿cómo sé si la atención fue mala si el método no recibe ese dato? Las IAs dieron por hecho que la calificación era eso, sin cuestionarlo. Al pensarlo me di cuenta de que era un supuesto, y de ahí salió también la observación de que la regla parece ir en contra de lo que uno esperaría en servicio al cliente. Por eso implementé la regla tal como está escrita, pero dejé el supuesto y la duda documentados para que se puedan validar. Después, GPT-6 con Astra verificó las 30 combinaciones válidas de entrada y coincidió con mi interpretación.

---------------------------------------------------------------------------------------------------------

*¿Qué correcciones o ajustes de seguridad o validación tuviste que hacerle a lo que generó la IA?*

El código que generó Claude Code ya vino con el INSERT parametrizado y la validación estricta, pero porque se lo pedí explícitamente después del análisis. Si le hubiera pedido "migrá esto a Node" a secas, no daría por sentado que lo hiciera así. Aun así, tuve que corregir varias cosas.

La primera fue el tamaño. La versión inicial estaba sobredimensionada para lo que pedía el ejercicio: tenía un endpoint de listado que nadie pidió, tests de la API con mocks, un README de más de 300 líneas y 200 líneas de CSS para un formulario de tres campos. Lo recorté para entregar algo mas acorde a lo que se pedia.

La revisión de GPT-6 con Astra encontró un problema más sutil. La API guardaba la atención y después la volvía a leer con una segunda consulta. Si esa lectura fallaba, el usuario veía un error aunque la atención ya estaba guardada, y si reintentaba quedaba duplicada. Lo resolví respondiendo directamente con el id generado y los valores calculados.

También encontró que un pedido con un charset no soportado terminaba en un error 500, como si fuera una falla del servidor, cuando en realidad es un error del cliente. Ahora esos casos devuelven 4xx. Y que el formulario confiaba en cualquier respuesta exitosa: si la API devolvía algo vacío o sin prioridad, se limpiaba sin confirmar nada o se rompía al mostrar el resultado. Ahora valida la respuesta antes de usarla.

Hubo sugerencias que evalué y descarté a propósito: agregar autenticación (no la pide la consigna, así que la dejé como limitación), proteger los reintentos contra duplicados (fuera de alcance) y validar más estrictamente las variables de entorno (menor, no afecta los datos).

---------------------------------------------------------------------------------------------------------

*¿Qué tipos de datos o índices te propuso originalmente la IA y qué ajustes hiciste?*

Acá la IA arrancó bien, en parte porque yo ya le había pedido evitar los errores típicos. Propuso DECIMAL para la prioridad en vez de FLOAT, ENUM para el tipo de cliente, DATETIME en UTC en lugar de TIMESTAMP, CHECK para la calificación y la prioridad, BIGINT para el id y dos índices, uno por fecha y otro por prioridad y fecha, pensados para ordenar una cola de atención.

Después de la revisión hice tres ajustes. Saqué los dos índices: tenían sentido mientras existía el endpoint de listado, pero al recortarlo quedaron sin ninguna consulta que los usara y solo sumaban costo a cada inserción. Además, el comentario que los justificaba afirmaba que MySQL "nunca" usaría un índice de pocos valores, lo cual es demasiado absoluto, así que lo saqué también.

Agregué CHECK para es_urgente y para el factor aplicado, porque en MySQL un BOOLEAN es en realidad un número que acepta un 2, y el factor no tenía ninguna restricción. Cambié el id de BIGINT a INT, porque JavaScript pierde precisión con enteros muy grandes; en la práctica es casi imposible llegar a ese número, pero preferí que los tipos fueran coherentes entre la base y el código.

Y decidí no replicar la regla de negocio completa en la base con triggers, aunque la revisión señaló que con un INSERT directo se podría guardar un corporativo con un factor que no le corresponde. Me pareció excesivo para el alcance.
