# Tasker frontend

```bash

#Cambiar a carpeta de front
cd frontend

#Instalar dependencias
npm ci

#Iniciar proyecto
npm start
```
Abrir http://localhost:4200.

Cualquier cambio en las variables de entorno, se modifican los 2 archivos de la carpeta environments.

environment.development.ts es para las pruebas locales, es decir para probar funcionalidades y demas en su entorno local, modifican este

environment.ts es el que usa el servidor web para levantar el proyecto, por lo que si modifican el archivo de las variables de entorno local, luego deben agregar esos cambios a este archivo.
