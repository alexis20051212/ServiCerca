-- Base de datos de ServiCerca (MySQL)
-- No es necesario importarla: la app crea la base y las tablas sola al iniciar.
-- Sirve como respaldo o para revisarla en phpMyAdmin / MySQL Workbench.


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `servicerca` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;

USE `servicerca`;
DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` varchar(40) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `rol` varchar(80) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES
('cerrajeria','Cerrajería','Cerrajero'),
('computadoras','Computadoras','Técnico en cómputo'),
('electricidad','Electricidad','Electricista'),
('electrodomesticos','Electrodomésticos','Técnico en línea blanca'),
('jardineria','Jardinería','Jardinero'),
('limpieza','Limpieza','Encargado de limpieza'),
('mantenimiento','Instalación y mantenimiento','Técnico de mantenimiento'),
('mecanica','Mecánica','Mecánico'),
('plomeria','Plomería','Fontanero');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` varchar(40) NOT NULL,
  `prestador_id` varchar(40) NOT NULL,
  `remitente` enum('client','provider') NOT NULL,
  `texto` text NOT NULL,
  `enviado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `prestador_id` (`prestador_id`),
  CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `notificaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `notificaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` varchar(40) NOT NULL,
  `titulo` varchar(120) NOT NULL,
  `cuerpo` varchar(300) NOT NULL,
  `solicitud_id` varchar(40) DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT 0,
  `creada_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `notificaciones` WRITE;
/*!40000 ALTER TABLE `notificaciones` DISABLE KEYS */;
/*!40000 ALTER TABLE `notificaciones` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `pagos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `solicitud_id` varchar(40) NOT NULL,
  `metodo` varchar(60) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `comision` decimal(10,2) NOT NULL,
  `folio_cfdi` varchar(40) NOT NULL,
  `estado` enum('confirmado','pendiente') NOT NULL DEFAULT 'confirmado',
  `pagado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `solicitud_id` (`solicitud_id`),
  CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `pagos` WRITE;
/*!40000 ALTER TABLE `pagos` DISABLE KEYS */;
INSERT INTO `pagos` VALUES
(1,'req_demo1','Tarjeta •••• 4242',300.00,30.00,'CFDI-DEMO-0001','confirmado','2026-10-25 12:00:00');
/*!40000 ALTER TABLE `pagos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `prestador_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestador_documentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prestador_id` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `prestador_id` (`prestador_id`),
  CONSTRAINT `prestador_documentos_ibfk_1` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `prestador_documentos` WRITE;
/*!40000 ALTER TABLE `prestador_documentos` DISABLE KEYS */;
INSERT INTO `prestador_documentos` VALUES
(1,'p1','INE (frente y reverso)'),
(2,'p1','Comprobante de domicilio'),
(3,'p2','INE (frente y reverso)'),
(4,'p2','Comprobante de domicilio'),
(5,'p3','INE (frente y reverso)'),
(6,'p3','Comprobante de domicilio'),
(7,'p4','INE (frente y reverso)'),
(8,'p4','Comprobante de domicilio'),
(9,'p5','INE (frente y reverso)'),
(10,'p5','Comprobante de domicilio'),
(11,'p6','INE (frente y reverso)'),
(12,'p6','Comprobante de domicilio'),
(13,'p7','INE (frente y reverso)'),
(14,'p7','Comprobante de domicilio'),
(15,'p8','INE (frente y reverso)'),
(16,'p8','Comprobante de domicilio'),
(17,'p9','INE (frente y reverso)'),
(18,'p9','Comprobante de domicilio'),
(19,'p10','INE (frente y reverso)'),
(20,'p10','Comprobante de domicilio'),
(21,'p13','INE (frente y reverso)'),
(22,'p13','Comprobante de domicilio'),
(23,'p14','INE (frente y reverso)'),
(24,'p14','Comprobante de domicilio'),
(25,'p11','INE (frente y reverso)'),
(26,'p11','Comprobante de domicilio'),
(27,'p12','INE (frente y reverso)'),
(28,'p12','Comprobante de domicilio'),
(29,'p12','Carta de no antecedentes');
/*!40000 ALTER TABLE `prestador_documentos` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `prestador_servicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestador_servicios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prestador_id` varchar(40) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `prestador_id` (`prestador_id`),
  CONSTRAINT `prestador_servicios_ibfk_1` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `prestador_servicios` WRITE;
/*!40000 ALTER TABLE `prestador_servicios` DISABLE KEYS */;
INSERT INTO `prestador_servicios` VALUES
(1,'p1','Reparación de fugas'),
(2,'p1','Destape de drenaje'),
(3,'p1','Instalación de boiler'),
(4,'p1','Cambio de llaves'),
(5,'p2','Cortos circuitos'),
(6,'p2','Instalación de contactos'),
(7,'p2','Centro de carga'),
(8,'p2','Luminarias LED'),
(9,'p3','Apertura de puertas'),
(10,'p3','Cambio de chapas'),
(11,'p3','Apertura de autos'),
(12,'p3','Cerraduras digitales'),
(13,'p4','Limpieza general'),
(14,'p4','Limpieza profunda'),
(15,'p4','Lavado de salas'),
(16,'p4','Limpieza post-obra'),
(17,'p5','Corte de pasto'),
(18,'p5','Poda de árboles'),
(19,'p5','Diseño de jardín'),
(20,'p5','Sistema de riego'),
(21,'p6','Formateo'),
(22,'p6','Eliminación de virus'),
(23,'p6','Cambio de pantalla'),
(24,'p6','Configuración de red'),
(25,'p7','Refrigeradores'),
(26,'p7','Lavadoras'),
(27,'p7','Secadoras'),
(28,'p7','Estufas y hornos'),
(29,'p8','Instalación de minisplit'),
(30,'p8','Calentador solar'),
(31,'p8','Pintura'),
(32,'p8','Mantenimiento general'),
(33,'p9','Muebles de baño'),
(34,'p9','Fugas'),
(35,'p9','Calentadores'),
(36,'p10','Ventiladores de techo'),
(37,'p10','Cámaras de seguridad'),
(38,'p10','Cableado'),
(39,'p10','Timbres'),
(40,'p13','Afinación'),
(41,'p13','Cambio de frenos'),
(42,'p13','Cambio de batería'),
(43,'p13','Diagnóstico por escáner'),
(44,'p14','Cambio de aceite'),
(45,'p14','Suspensión'),
(46,'p14','Revisión general'),
(47,'p11','Limpieza de oficinas'),
(48,'p11','Limpieza de ventanas'),
(49,'p12','Duplicado de llaves'),
(50,'p12','Chapas de seguridad');
/*!40000 ALTER TABLE `prestador_servicios` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `prestadores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `prestadores` (
  `id` varchar(40) NOT NULL,
  `usuario_id` varchar(40) DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `categoria_id` varchar(40) NOT NULL,
  `tarifa` decimal(10,2) NOT NULL,
  `distancia_km` decimal(5,1) NOT NULL DEFAULT 1.0,
  `zona` varchar(60) NOT NULL,
  `horario` varchar(80) NOT NULL,
  `anios_experiencia` int(11) NOT NULL DEFAULT 1,
  `verificado` tinyint(1) NOT NULL DEFAULT 0,
  `rechazado` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `premium` tinyint(1) NOT NULL DEFAULT 0,
  `plan_premium` varchar(20) DEFAULT NULL,
  `premium_desde` date DEFAULT NULL,
  `telefono` varchar(30) DEFAULT '',
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `prestadores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `prestadores_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `prestadores` WRITE;
/*!40000 ALTER TABLE `prestadores` DISABLE KEYS */;
INSERT INTO `prestadores` VALUES
('p1','u2','Juan Pérez Morales','plomeria',350.00,1.2,'Centro','Lun a Sáb · 8:00 – 19:00',12,1,0,1,1,'mensual',NULL,'449 555 0101','Plomero con más de 12 años de experiencia. Reparación de fugas, instalación de tinacos, boilers y destapes.'),
('p10',NULL,'Electro Hogar Ramírez','electricidad',350.00,1.5,'Centro','Lun a Sáb · 8:00 – 20:00',11,1,0,1,0,NULL,NULL,'449 555 0110','Instalaciones eléctricas, ventiladores de techo, timbres y cámaras de seguridad.'),
('p11',NULL,'Brillo Total','limpieza',250.00,2.2,'Zona Oriente','Lun a Vie · 8:00 – 16:00',4,0,0,1,0,NULL,NULL,'449 555 0111','Servicio de limpieza para casas y oficinas pequeñas.'),
('p12',NULL,'Llaves Express','cerrajeria',260.00,4.0,'Zona Poniente','Lun a Sáb · 9:00 – 21:00',3,0,0,1,0,NULL,NULL,'449 555 0112','Duplicado de llaves, cambio de combinación y chapas de seguridad.'),
('p13',NULL,'Taller Mecánico Gómez','mecanica',450.00,2.0,'Zona Norte','Lun a Sáb · 8:00 – 18:00',16,1,0,1,1,'mensual',NULL,'449 555 0113','Mecánico a domicilio: afinaciones, frenos, batería, diagnóstico por computadora y auxilio vial.'),
('p14',NULL,'Auto Servicio Luna','mecanica',380.00,3.9,'Zona Sur','Lun a Vie · 9:00 – 19:00',7,1,0,1,0,NULL,NULL,'449 555 0114','Cambio de aceite, suspensión y revisión general de tu auto sin que salgas de casa.'),
('p2',NULL,'Roberto Sánchez','electricidad',400.00,2.4,'Zona Norte','Lun a Vie · 9:00 – 18:00',8,1,0,1,0,NULL,NULL,'449 555 0102','Electricista certificado. Instalaciones residenciales, cortos circuitos, centros de carga y luminarias.'),
('p3',NULL,'Cerrajería Hernández','cerrajeria',300.00,0.8,'Centro','Todos los días · 24 horas',15,1,0,1,1,'mensual',NULL,'449 555 0103','Apertura de puertas y autos, cambio de chapas y duplicado de llaves. Servicio de emergencia 24/7.'),
('p4',NULL,'María López','limpieza',220.00,3.1,'Zona Sur','Lun a Sáb · 7:00 – 15:00',6,1,0,1,0,NULL,NULL,'449 555 0104','Limpieza profunda de casas y departamentos, lavado de salas y alfombras.'),
('p5',NULL,'Jardines Verdes','jardineria',280.00,4.5,'Zona Poniente','Mar a Dom · 7:00 – 17:00',10,1,0,1,0,NULL,NULL,'449 555 0105','Poda de árboles, corte de pasto, diseño de jardines y sistemas de riego.'),
('p6',NULL,'TecnoFix · Andrés Ruiz','computadoras',300.00,1.9,'Centro','Lun a Sáb · 10:00 – 20:00',7,1,0,1,1,'mensual',NULL,'449 555 0106','Reparación y mantenimiento de laptops y PCs, eliminación de virus, formateo y redes Wi-Fi.'),
('p7',NULL,'Refrigeración Torres','electrodomesticos',380.00,5.2,'Zona Oriente','Lun a Vie · 9:00 – 19:00',14,1,0,1,0,NULL,NULL,'449 555 0107','Reparación de refrigeradores, lavadoras, secadoras y estufas de todas las marcas.'),
('p8',NULL,'Instalaciones Díaz','mantenimiento',330.00,2.8,'Zona Norte','Lun a Sáb · 8:00 – 18:00',9,1,0,1,0,NULL,NULL,'449 555 0108','Instalación de minisplits, calentadores solares, cortinas, repisas y mantenimiento general.'),
('p9',NULL,'Pedro Castillo','plomeria',280.00,3.6,'Zona Sur','Lun a Dom · 8:00 – 20:00',5,1,0,1,0,NULL,NULL,'449 555 0109','Plomería general, instalación de muebles de baño y calentadores.');
/*!40000 ALTER TABLE `prestadores` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
  `id` varchar(40) NOT NULL,
  `prestador_id` varchar(40) NOT NULL,
  `autor` varchar(120) NOT NULL,
  `motivo` varchar(120) NOT NULL,
  `detalle` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `estado` enum('abierto','resuelto') NOT NULL DEFAULT 'abierto',
  `resolucion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `prestador_id` (`prestador_id`),
  CONSTRAINT `reportes_ibfk_1` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
INSERT INTO `reportes` VALUES
('rep1','p7','Iván K.','Impuntualidad','Llegó 2 horas tarde sin avisar.','2026-10-30','abierto',NULL),
('rep2','p9','Elena B.','Cobro distinto al acordado','Pidió $100 extra al terminar.','2026-10-27','abierto',NULL);
/*!40000 ALTER TABLE `reportes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `resenas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `resenas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prestador_id` varchar(40) NOT NULL,
  `solicitud_id` varchar(40) DEFAULT NULL,
  `autor` varchar(80) NOT NULL,
  `calificacion` tinyint(4) NOT NULL,
  `comentario` text DEFAULT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`id`),
  KEY `prestador_id` (`prestador_id`),
  CONSTRAINT `resenas_ibfk_1` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `resenas` WRITE;
/*!40000 ALTER TABLE `resenas` DISABLE KEYS */;
INSERT INTO `resenas` VALUES
(1,'p1',NULL,'Laura G.',5,'Llegó puntual y resolvió la fuga en menos de una hora. Muy recomendable.','2026-10-21'),
(2,'p1',NULL,'Carlos M.',5,'Excelente trabajo con el boiler, precio justo.','2026-10-09'),
(3,'p1',NULL,'Ana R.',4,'Buen servicio, solo tardó un poco en confirmar.','2026-09-28'),
(4,'p2',NULL,'Miguel T.',5,'Encontró el corto rápidamente. Muy profesional.','2026-10-18'),
(5,'p2',NULL,'Sofía L.',4,'Buen trabajo y limpio.','2026-10-02'),
(6,'p3',NULL,'Jorge P.',5,'Me abrió la puerta a las 2 a.m. en 20 minutos. ¡Gracias!','2026-10-25'),
(7,'p3',NULL,'Daniela C.',5,'Rápido y honesto.','2026-10-11'),
(8,'p3',NULL,'Luis F.',4,'Buen servicio.','2026-09-15'),
(9,'p4',NULL,'Patricia V.',5,'Dejó la casa impecable.','2026-10-20'),
(10,'p4',NULL,'Fernando D.',4,'Muy detallista.','2026-10-05'),
(11,'p5',NULL,'Ricardo N.',4,'El jardín quedó muy bien.','2026-10-14'),
(12,'p6',NULL,'Valeria S.',5,'Recuperó todos mis archivos.','2026-10-22'),
(13,'p6',NULL,'Héctor A.',5,'Mi laptop quedó como nueva.','2026-10-01'),
(14,'p7',NULL,'Gabriela O.',4,'Arregló mi lavadora el mismo día.','2026-10-17'),
(15,'p7',NULL,'Iván K.',3,'Funcionó, pero llegó tarde.','2026-09-30'),
(16,'p8',NULL,'Mónica E.',5,'Instaló el minisplit muy limpio.','2026-10-12'),
(17,'p9',NULL,'Elena B.',4,'Buen precio y trabajo rápido.','2026-10-08'),
(18,'p10',NULL,'Arturo J.',5,'Instaló 4 cámaras perfectamente.','2026-10-19'),
(19,'p10',NULL,'Karla Z.',4,'Muy amable.','2026-10-03'),
(20,'p13',NULL,'Raúl S.',5,'Me cambió la batería en mi cochera, muy rápido.','2026-10-26'),
(21,'p13',NULL,'Diana P.',5,'Diagnóstico honesto, no me cobró de más.','2026-10-13'),
(22,'p13',NULL,'Tomás V.',4,'Buena afinación.','2026-09-29'),
(23,'p14',NULL,'Claudia M.',4,'Puntual y amable.','2026-10-16');
/*!40000 ALTER TABLE `resenas` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `resenas_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `resenas_clientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cliente_id` varchar(40) NOT NULL,
  `prestador_id` varchar(40) NOT NULL,
  `solicitud_id` varchar(40) NOT NULL,
  `calificacion` tinyint(4) NOT NULL,
  `comentario` text DEFAULT NULL,
  `fecha` date NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `solicitud_id` (`solicitud_id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `prestador_id` (`prestador_id`),
  CONSTRAINT `resenas_clientes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resenas_clientes_ibfk_2` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `resenas_clientes_ibfk_3` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `resenas_clientes` WRITE;
/*!40000 ALTER TABLE `resenas_clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `resenas_clientes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `sesiones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `sesiones` (
  `token` varchar(80) NOT NULL,
  `usuario_id` varchar(40) NOT NULL,
  `creada_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`token`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `sesiones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `sesiones` WRITE;
/*!40000 ALTER TABLE `sesiones` DISABLE KEYS */;
/*!40000 ALTER TABLE `sesiones` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `solicitud_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_historial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `solicitud_id` varchar(40) NOT NULL,
  `estado` varchar(20) NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `solicitud_id` (`solicitud_id`),
  CONSTRAINT `solicitud_historial_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `solicitud_historial` WRITE;
/*!40000 ALTER TABLE `solicitud_historial` DISABLE KEYS */;
INSERT INTO `solicitud_historial` VALUES
(1,'req_demo1','calificada','2026-10-25 12:10:00');
/*!40000 ALTER TABLE `solicitud_historial` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes` (
  `id` varchar(40) NOT NULL,
  `cliente_id` varchar(40) NOT NULL,
  `prestador_id` varchar(40) NOT NULL,
  `servicio` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` varchar(5) NOT NULL,
  `direccion` varchar(200) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `estado` enum('pendiente','aceptada','reprogramada','en_camino','en_proceso','completada','pagada','calificada','rechazada','cancelada') NOT NULL DEFAULT 'pendiente',
  `calificacion_cliente` tinyint(4) DEFAULT NULL,
  `creada_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `prestador_id` (`prestador_id`),
  CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`prestador_id`) REFERENCES `prestadores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `solicitudes` WRITE;
/*!40000 ALTER TABLE `solicitudes` DISABLE KEYS */;
INSERT INTO `solicitudes` VALUES
('req_demo1','u1','p3','Cambio de chapas','Cambiar la chapa de la puerta principal.','2026-10-25','10:00','Calle Madero 120, Centro',300.00,'calificada',5,'2026-11-01 20:43:57');
/*!40000 ALTER TABLE `solicitudes` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `tickets_soporte`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets_soporte` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` varchar(40) DEFAULT NULL,
  `mensaje` text NOT NULL,
  `estado` enum('abierto','resuelto') NOT NULL DEFAULT 'abierto',
  `respuesta` text DEFAULT NULL,
  `respondido_en` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `tickets_soporte_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `tickets_soporte` WRITE;
/*!40000 ALTER TABLE `tickets_soporte` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets_soporte` ENABLE KEYS */;
UNLOCK TABLES;
DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` varchar(40) NOT NULL,
  `rol` enum('cliente','prestador','admin') NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `email` varchar(160) NOT NULL,
  `password_hash` varchar(200) NOT NULL,
  `telefono` varchar(30) DEFAULT '',
  `direccion` varchar(200) DEFAULT '',
  `acepto_terminos_en` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES
('u1','cliente','Alexis Jiménez','cliente@demo.com','a4fa4ae61f295e433750d2f67cbdf56c:f0ff30b7f3cf99c378a1dbca44455c12ab8469b65b5d2b0f3511b0fff2f0ca6170540f0355c81429bb95a985d358c9ed076624492875495a7d663562e5323012','449 555 0001','Calle Madero 120, Centro','2026-11-01 20:43:57','2026-11-01 20:43:57'),
('u2','prestador','Juan Pérez Morales','prestador@demo.com','3de19dbaf046896ab1f76ff40d07bce0:58791560cf5eefe3683d7a890dea369056789e1ba7028cdd24908f6dc0273632ce8a913b018379203055dacbbdc3b1857723d268b77f9ee3204bb54faa2f4a62','449 555 0101','','2026-11-01 20:43:57','2026-11-01 20:43:57'),
('u3','admin','Administrador ServiCerca','admin@demo.com','535f05547c35630acc9644732727c5eb:915325c7b093989f96675989ab11e6df2902a7abde74a2ad2c640e50c317408245558bc7e941ee8e30e7b95efeecc5ef579438cce1ed7bbab69f4f9f8725ff12','','','2026-11-01 20:43:57','2026-11-01 20:43:57');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

