
import React from 'react';
import { ModuleData, ModuleId } from './types';

export const PROCESS_TYPES = [
  "TI", 
  "Operacional", 
  "Finanzas", 
  "RRHH", 
  "Legal", 
  "Logística", 
  "Ventas"
];

const NA_OPTION = { texto: "No aplica", valor: -1 };

export const MODULES: ModuleData[] = [
  {
    id: 'ADN',
    name: 'ADN: Dependencia Digital',
    description: 'Análisis de criticidad y mapa de dependencias tecnológicas, humanas y de terceros.',
    objetivo: 'Establecer el contexto del negocio: nivel de criticidad, impacto y tolerancia al riesgo del proceso evaluado. Estos parámetros base determinan cómo se interpretan los resultados del resto de los módulos.',
    icon: 'Network',
    questions: [
      { 
        id: 1, 
        categoria: "Gobernanza", 
        pregunta: "¿El proceso está documentado formalmente en un manual vigente que incluya su flujo, entradas, salidas y KPI?",
        opciones: [
          { texto: "Sí, documentado y vigente", valor: 1.0 },
          { texto: "Parcialmente, existe flujo pero no manual", valor: 0.5 },
          { texto: "No existe documentación formal", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 2, 
        categoria: "Responsabilidad", 
        pregunta: "¿Existe una matriz de responsabilidades (RACI) que identifique claramente quién es el dueño del proceso (Process Owner) y quiénes son los responsables de su ejecución y supervisión?", 
        opciones: [
          { texto: "Sí, matriz RACI definida", valor: 1.0 },
          { texto: "Solo responsables nombrados de palabra", valor: 0.5 },
          { texto: "No hay responsables definidos", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 3, 
        categoria: "Criticidad Operativa", 
        pregunta: "¿Cuál es el impacto directo en la continuidad del negocio si este proceso fallara durante un periodo de alta demanda estacional?", 
        opciones: [
          { texto: "Bajo: Impacto despreciable", valor: 1.0 },
          { texto: "Medio: Impacto operativo recuperable", valor: 0.6 },
          { texto: "Alto: Afecta significativamente la entrega", valor: 0.3 },
          { texto: "Crítico: Cese total de la operación principal", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 4, 
        categoria: "Riesgo Reputacional", 
        pregunta: "¿En qué medida la falla de este proceso afectaría la imagen pública, la confianza de los clientes o generaría multas por incumplimiento de niveles de servicio (SLA)?", 
        opciones: [
          { texto: "Bajo: Sin impacto externo", valor: 1.0 },
          { texto: "Moderado: Quejas internas o de partners", valor: 0.6 },
          { texto: "Significativo: Afecta confianza pública", valor: 0.3 },
          { texto: "Extremo: Pérdida masiva de clientes/Imagen", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 5, 
        categoria: "Tolerancia (RTO)", 
        pregunta: "¿Cuál es el tiempo objetivo de recuperación (RTO) máximo definido antes de que la interrupción cause un daño irreversible o financiero inasumible?", 
        opciones: [
          { texto: "Diferible: Más de una semana", valor: 1.0 },
          { texto: "Recuperable: Entre 1 y 3 días", valor: 0.6 },
          { texto: "Urgente: Entre 4 y 24 horas", valor: 0.3 },
          { texto: "Crítico: Menos de 4 horas", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 6, 
        categoria: "Modo de Contingencia", 
        pregunta: "¿El proceso cuenta con un Plan de Continuidad (BCP) que defina cómo operar en modo degradado o de forma manual, sin depender de sistemas TI?",
        opciones: [
          { texto: "Sí, probado y documentado", valor: 1.0 },
          { texto: "Parcial, se conoce pero no se ha probado", valor: 0.5 },
          { texto: "No existe alternativa manual viable", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 7, 
        categoria: "Infraestructura TI", 
        pregunta: "¿Los servidores que soportan este proceso (on-premise, nube o híbrido) cuentan con redundancia configurada para evitar puntos únicos de falla?",
        opciones: [
          { texto: "Redundancia Total (Activo-Activo)", valor: 1.0 },
          { texto: "Redundancia Parcial (Activo-Pasivo)", valor: 0.5 },
          { texto: "Soporte simple sin redundancia", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 8, 
        categoria: "Ecosistema de Sistemas", 
        pregunta: "¿Cuántas aplicaciones críticas e interfaces de integración (API, ETL) participan en el flujo de datos necesario para completar el proceso?", 
        opciones: [
          { texto: "Simple (1 sistema centralizado)", valor: 1.0 },
          { texto: "Intermedio (2 a 4 sistemas)", valor: 0.5 },
          { texto: "Ecosistema complejo (>5 sistemas)", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 9, 
        categoria: "Puntos de Falla TI", 
        pregunta: "Si el sistema central (ERP/Core) queda fuera de línea, ¿el proceso cuenta con una base de datos local o caché que permita seguir operando temporalmente?", 
        opciones: [
          { texto: "Permite operación autónoma temporal", valor: 1.0 },
          { texto: "Permite solo consultas", valor: 0.5 },
          { texto: "El proceso se detiene de inmediato", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 10, 
        categoria: "Dependencia de Terceros", 
        pregunta: "¿El proceso requiere obligatoriamente servicios de terceros (SaaS, Outsourcing, Mensajería) para que se considere finalizado correctamente?", 
        opciones: [
          { texto: "Sin dependencia de terceros", valor: 1.0 },
          { texto: "Dependencia moderada (soporte)", valor: 0.5 },
          { texto: "Dependencia crítica de terceros", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 11, 
        categoria: "Gobernanza de Proveedores", 
        pregunta: "¿Cuenta con contratos de soporte y mantenimiento (SLA) vigentes con los proveedores críticos que soportan este proceso?", 
        opciones: [
          { texto: "SLA formal y penalidades definidas", valor: 1.0 },
          { texto: "Acuerdo básico de soporte", valor: 0.5 },
          { texto: "Sin contratos de soporte vigentes", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 12, 
        categoria: "Riesgo de Concentración", 
        pregunta: "Si su proveedor principal de nube o infraestructura fallara globalmente, ¿tiene una estrategia de salida o multicloud que permita migrar el proceso?", 
        opciones: [
          { texto: "Estrategia de salida probada", valor: 1.0 },
          { texto: "Plan de migración teórico", valor: 0.5 },
          { texto: "Dependencia total (Lock-in)", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 13, 
        categoria: "Factor Humano Crítico", 
        pregunta: "¿Existen personas cuyo conocimiento exclusivo del proceso es tan crítico que, ante su ausencia, el proceso no podría ejecutarse ni recuperarse?",
        opciones: [
          { texto: "Conocimiento distribuido y documentado", valor: 1.0 },
          { texto: "Dependencia de un equipo pequeño", valor: 0.5 },
          { texto: "Dependencia total de una persona", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 14, 
        categoria: "Transferencia de Conocimiento", 
        pregunta: "¿Existe un plan de sucesión o rotación de cargos que asegure que al menos dos personas conozcan la ejecución técnica del proceso?", 
        opciones: [
          { texto: "Sí, plan de sucesión activo", valor: 1.0 },
          { texto: "Parcial, entrenamiento cruzado básico", valor: 0.5 },
          { texto: "No, el conocimiento está aislado en una persona", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 15, 
        categoria: "Calidad de Documentación", 
        pregunta: "¿La documentación técnica (diagramas de arquitectura, diccionarios de datos) es suficiente para que un consultor externo pueda operar el proceso?", 
        opciones: [
          { texto: "Documentación completa y profesional", valor: 1.0 },
          { texto: "Parcial, requiere guía del titular", valor: 0.5 },
          { texto: "No existe documentación técnica", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 16, 
        categoria: "Efecto Cascada", 
        pregunta: "¿Este proceso es el disparador (Trigger) de otros procesos críticos de la cadena de valor, como facturación, despachos o pagos?", 
        opciones: [
          { texto: "Impacto limitado a su área", valor: 1.0 },
          { texto: "Impacta procesos adyacentes importantes", valor: 0.5 },
          { texto: "Es el Core: detiene toda la cadena", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 17, 
        categoria: "Riesgo de Datos", 
        pregunta: "Si el proceso falla, ¿existe riesgo de pérdida de integridad de los datos (corrupción de BD) que afecte a otros módulos de la empresa?", 
        opciones: [
          { texto: "Bajo riesgo: datos aislados", valor: 1.0 },
          { texto: "Riesgo moderado de pérdida de registros", valor: 0.5 },
          { texto: "Riesgo alto de desincronización masiva", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 18, 
        categoria: "Monitoreo de Salud", 
        pregunta: "¿Se cuenta con tableros de control (Dashboards) o alertas automáticas que informen en tiempo real cuando el proceso se degrada?", 
        opciones: [
          { texto: "Monitoreo Proactivo y Alertas", valor: 1.0 },
          { texto: "Monitoreo Reactivo manual", valor: 0.5 },
          { texto: "Sin monitoreo del proceso", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 19, 
        categoria: "Gestión de Crisis", 
        pregunta: "¿Está definido el comité de crisis y los protocolos de escalamiento para cuando este proceso supera su tiempo de tolerancia?", 
        opciones: [
          { texto: "Protocolos claros y comité definido", valor: 1.0 },
          { texto: "Solo escalamiento jerárquico básico", valor: 0.5 },
          { texto: "No hay protocolo de crisis definido", valor: 0.0 },
          NA_OPTION
        ] 
      },
      { 
        id: 20, 
        categoria: "Evaluación Residual", 
        pregunta: "Considerando controles actuales, redundancias y planes de respaldo, ¿cuál es su percepción final de riesgo de este proceso?", 
        opciones: [
          { texto: "Riesgo Controlado", valor: 1.0 },
          { texto: "Riesgo Aceptable", valor: 0.7 },
          { texto: "Riesgo Alto", valor: 0.3 },
          { texto: "Riesgo Crítico", valor: 0.0 },
          NA_OPTION
        ] 
      }
    ]
  },
  {
    id: 'CIBER',
    name: 'Ciberseguridad (CIS Controls IG1)',
    description: 'Auditoría de los 18 Controles Críticos de Seguridad CIS (Grupo de Implementación 1), organizados en 43 salvaguardas esenciales.',
    objetivo: 'Evaluar qué tan bien protegida está la infraestructura digital contra los ataques más comunes (ransomware, phishing, robo de credenciales) y la capacidad de la organización para detectar, contener y recuperarse ante incidentes.',
    icon: 'ShieldCheck',
    questions: [
      { id: 1, peso: 4, pregunta: "¿La organización mantiene un inventario completo, actualizado y verificable de todos los activos (estaciones, servidores, dispositivos de red, móviles y otros), identificando tipo, responsable, criticidad y ubicación, y lo revisa periódicamente?" },
      { id: 2, peso: 4, pregunta: "¿Existen mecanismos técnicos y procedimientos formales para detectar, aislar y gestionar activos no autorizados, asegurando que ningún dispositivo se conecte a la red productiva sin control y registro?" },
      { id: 3, peso: 4, pregunta: "¿La organización mantiene un inventario centralizado del software instalado y ejecutable, incluyendo versión y estado de soporte, que permita identificar software no autorizado o vulnerable?" },
      { id: 4, peso: 6, pregunta: "¿Se asegura que todo el software autorizado se encuentre soportado por el proveedor, existiendo un proceso para identificar software fuera de soporte, evaluar el riesgo y definir acciones de reemplazo o controles compensatorios?" },
      { id: 5, peso: 8, pregunta: "¿La organización dispone de controles técnicos efectivos para detectar, bloquear o eliminar software no autorizado, registrando los eventos y analizando recurrencias para prevenir ejecuciones maliciosas?" },
      { id: 6, peso: 8, pregunta: "¿La organización controla el acceso a datos críticos, sensibles y personales mediante mecanismos técnicos formales (ACL, RBAC, permisos de base de datos o aplicaciones), aplicando el principio de mínimo privilegio, y realiza revisiones periódicas documentadas de dichos accesos?" },
      { id: 7, peso: 8, pregunta: "¿Los dispositivos de usuario final que almacenan o procesan datos sensibles o personales utilizan cifrado de disco completo habilitado, con gestión segura de claves, y existe evidencia de verificación periódica del cumplimiento?" },
      { id: 8, peso: 9, pregunta: "¿La organización tiene estándares de configuración segura (baselines) formalmente aprobados para estaciones, servidores y dispositivos de red, y verifica periódicamente que los activos productivos los cumplan?" },
      { id: 9, peso: 8, pregunta: "¿Los activos nuevos, reinstalados o reprovisionados se incorporan a producción exclusivamente con configuraciones seguras aplicadas, existiendo un proceso técnico que impida su uso operativo antes de cumplir el baseline definido?" },
      { id: 10, peso: 9, pregunta: "¿Los sistemas, servicios y aplicaciones se configuran de forma segura desde su despliegue, eliminando credenciales por defecto, restringiendo funciones administrativas solo a roles autorizados, y evitando accesos anónimos o innecesarios?" },
      { id: 11, peso: 9, pregunta: "¿La organización identifica y deshabilita de forma sistemática los servicios, puertos y funcionalidades innecesarias en todos los activos, y esta práctica forma parte del estándar de configuración segura (no es solo correctiva)?" },
      { id: 12, peso: 9, pregunta: "¿Las cuentas locales, especialmente las administrativas, se encuentran restringidas, controladas y gestionadas mediante políticas técnicas (por ejemplo, LAPS o equivalentes), evitando su uso compartido y limitando privilegios únicamente a casos justificados y documentados?" },
      { id: 13, peso: 9, pregunta: "¿El uso de scripts, macros y código embebido se encuentra restringido por política y controles técnicos, permitiendo solo aquellos estrictamente necesarios para la operación, y bloqueando la ejecución de código no autorizado que pueda facilitar la entrega de malware?" },
      { id: 14, peso: 7, pregunta: "¿La organización mantiene un inventario completo y actualizado de todas las cuentas (usuarios, administrativas, de servicio y de terceros), identificando propósito, nivel de privilegio y responsable, y lo revisa periódicamente para asegurar su vigencia y trazabilidad?" },
      { id: 15, peso: 9, pregunta: "¿Existe un proceso formal que deshabilite automáticamente las cuentas inactivas en plazos definidos, con registro de las acciones realizadas?" },
      { id: 16, peso: 9, pregunta: "¿Al término de una relación laboral o contractual, existe un proceso obligatorio que revoca o deshabilita todas las cuentas del usuario (sistemas, aplicaciones y accesos remotos) dentro de plazos verificables?" },
      { id: 17, peso: 9, pregunta: "¿La organización aplica autenticación multifactor obligatoria para cuentas administrativas, accesos remotos y sistemas críticos, utilizando factores independientes, sin excepciones no justificadas y con evidencia de uso efectivo en los accesos?" },
      { id: 18, peso: 9, pregunta: "¿Las credenciales de acceso se almacenan, transmiten y gestionan de forma segura mediante mecanismos técnicos adecuados (hashing seguro, cifrado, gestores de secretos), incluyendo políticas de rotación para cuentas privilegiadas y de servicio?" },
      { id: 19, peso: 8, pregunta: "¿Los sistemas y servicios implementan controles de limitación de intentos fallidos de autenticación, tales como bloqueos temporales o retrasos progresivos, y registran y alertan eventos asociados a intentos de acceso sospechosos?" },
      { id: 20, peso: 9, pregunta: "¿La organización utiliza una plataforma centralizada de gestión de identidades y accesos para controlar el acceso a sistemas críticos y servicios en la nube, evitando la proliferación de cuentas locales no gestionadas y permitiendo una administración coherente de privilegios?" },
      { id: 21, peso: 9, pregunta: "¿La organización cuenta con un proceso formal de gestión de vulnerabilidades que cubra todos los activos, defina roles y criterios de priorización por riesgo, y se ejecute periódicamente con evidencia verificable?" },
      { id: 22, peso: 9, pregunta: "¿Existe un proceso estructurado de remediación de vulnerabilidades que establezca plazos de corrección según criticidad, seguimiento del avance, resolución de bloqueos y verificación del cierre efectivo de las vulnerabilidades identificadas?" },
      { id: 23, peso: 10, pregunta: "¿Los sistemas operativos soportados reciben parches de seguridad de forma automatizada, dentro de plazos definidos según criticidad, manteniendo un nivel de cumplimiento verificable igual o superior al 95%, sin activos críticos excluidos del proceso?" },
      { id: 24, peso: 9, pregunta: "¿Las aplicaciones instaladas y soportadas reciben actualizaciones de seguridad de forma automatizada, con seguimiento del estado de aplicación de parches, gestión de excepciones justificadas y evidencia de cumplimiento igual o superior al 90%?" },
      { id: 25, peso: 7, pregunta: "¿La organización tiene un proceso formal para gestionar los registros de auditoría, que defina qué eventos registrar, dónde almacenarlos, por cuánto tiempo y quién es responsable de su integridad?" },
      { id: 26, peso: 8, pregunta: "¿Los sistemas operativos, aplicaciones, dispositivos de red y controles de seguridad se encuentran configurados para registrar eventos relevantes de seguridad, recolectando los logs de forma centralizada y asegurando una cobertura suficiente para la detección y análisis de incidentes?" },
      { id: 27, peso: 9, pregunta: "¿Los registros de auditoría se almacenan de forma centralizada y protegida contra modificación o eliminación, utilizando controles de integridad, retención definida y acceso restringido, permitiendo su uso como evidencia confiable ante incidentes o auditorías?" },
      { id: 28, peso: 8, pregunta: "¿La organización permite únicamente el uso de navegadores web y clientes de correo electrónico con soporte vigente, manteniéndolos actualizados, y dispone de controles técnicos que impidan la ejecución de versiones obsoletas o no autorizadas?" },
      { id: 29, peso: 9, pregunta: "¿Se utiliza un servicio de filtrado DNS que bloquee el acceso a dominios maliciosos o de phishing, aplicándose a todos los dispositivos, incluidos equipos remotos, y manteniendo actualización automática de listas de amenazas?" },
      { id: 30, peso: 9, pregunta: "¿Todos los activos en alcance cuentan con defensas antimalware activas, soportadas y protegidas contra desactivación, manteniéndose operativas y actualizadas, y generando alertas ante detecciones o comportamientos maliciosos?" },
      { id: 31, peso: 9, pregunta: "¿Las firmas y motores antimalware se actualizan de forma automática y continua en todos los activos, existiendo mecanismos de verificación y alerta cuando un equipo no recibe oportunamente las actualizaciones de seguridad?" },
      { id: 32, peso: 8, pregunta: "¿La organización cuenta con un proceso formal y documentado de respaldo de datos que defina alcance, responsabilidades, frecuencia, tipos de respaldo y criterios de restauración, y que sea revisado periódicamente?" },
      { id: 33, peso: 9, pregunta: "¿Los respaldos de datos se ejecutan de forma automatizada, con una frecuencia coherente con la criticidad de los sistemas, y existe evidencia verificable del éxito o falla de cada ejecución?" },
      { id: 34, peso: 9, pregunta: "¿Los respaldos de datos se encuentran protegidos contra acceso no autorizado, modificación o eliminación, mediante controles de acceso, cifrado y segregación de funciones, evitando su compromiso en escenarios de ransomware?" },
      { id: 35, peso: 9, pregunta: "¿La organización mantiene copias de respaldo fuera de línea, inmutables o lógicamente aisladas del entorno productivo, protegidas frente a credenciales administrativas comprometidas, y realiza pruebas periódicas de restauración?" },
      { id: 36, peso: 9, pregunta: "¿La infraestructura de red (firewalls, routers, switches y otros dispositivos) se mantiene ejecutando versiones de software y firmware soportadas, con un proceso definido de actualización, revisión periódica y gestión oportuna de componentes fuera de soporte o con vulnerabilidades críticas?" },
      { id: 37, peso: 6, pregunta: "¿La organización cuenta con un programa formal, continuo y documentado de concientización en ciberseguridad, que incluya campañas periódicas de ciberhigiene, contenidos actualizados según amenazas reales, cobertura de trabajadores y colaboradores, y evidencia verificable de su ejecución?" },
      { id: 38, peso: 8, pregunta: "¿El personal recibe capacitación periódica para reconocer señales de incidentes de seguridad y conoce claramente los canales y plazos para reportarlos, existiendo evidencia de participación y contenidos alineados a las amenazas actuales?" },
      { id: 39, peso: 7, pregunta: "¿La organización mantiene un inventario actualizado de proveedores de servicios con acceso a sistemas, redes o datos, identificando tipo de servicio, nivel de acceso y responsable interno, y evalúa periódicamente los riesgos de ciberseguridad asociados?" },
      { id: 40, peso: 8, pregunta: "¿Se ha designado formalmente a una o más personas responsables de la gestión de incidentes de seguridad, con roles, responsabilidades y facultades claramente definidas, y con designaciones vigentes y conocidas por la organización?" },
      { id: 41, peso: 8, pregunta: "¿La organización cuenta con un proceso formal, documentado y difundido para el reporte de incidentes de seguridad, que defina qué reportar, a quién, por qué medio y en qué plazo, y que sea revisado y probado periódicamente?" },
      { id: 42, peso: 7, pregunta: "¿Existe un proceso formal, documentado y aprobado de gestión de incidentes de ciberseguridad, que defina roles, responsabilidades, escalamiento, procedimientos de contención, e incluya la realización periódica de ejercicios o simulacros, con registro de resultados y lecciones aprendidas?" },
      { id: 43, peso: 7, pregunta: "¿La organización mantiene un programa planificado y recurrente de pruebas de seguridad (por ejemplo, pruebas de penetración, análisis técnicos o ejercicios de resiliencia), cuyos resultados se documentan, se utilizan para ajustar controles y planes, y sirven como evidencia de revisión periódica del sistema de ciberseguridad?" }
    ]
  },
  {
    id: 'LEGAL',
    name: 'Protección de Datos (Ley 21.719)',
    description: 'Cumplimiento normativo del nuevo marco legal chileno de protección de la vida privada y datos personales.',
    objetivo: 'Evaluar si la organización cumple con la Ley 21.719 al recopilar y usar datos personales, y si puede demostrarlo ante una fiscalización. Cubre: base legal del tratamiento, derechos de las personas, medidas de seguridad y capacidad de notificación ante brechas.',
    icon: 'Scale',
    questions: [
      { id: 1, peso: 8, pregunta: "¿La organización puede acreditar con documentación que cada tratamiento de datos personales es lícito, identificando la base legal que lo ampara, y mantiene esa información disponible ante fiscalizaciones o solicitudes de titulares?" },
      { id: 2, peso: 7, pregunta: "¿Las finalidades específicas de cada tratamiento de datos personales se encuentran definidas, documentadas y comunicadas, y existen controles que impidan el uso de los datos para finalidades distintas a las originalmente informadas o autorizadas?" },
      { id: 3, peso: 8, pregunta: "¿La organización recolecta solo los datos estrictamente necesarios para cada finalidad y aplica reglas formales de conservación, supresión o anonimización una vez cumplido el propósito o vencido el plazo legal?" },
      { id: 4, peso: 6, pregunta: "¿Existen mecanismos operativos y documentados para asegurar que los datos personales tratados sean exactos, completos y actualizados, y para corregir oportunamente aquellos que resulten inexactos o desactualizados?" },
      { id: 5, peso: 9, pregunta: "Cuando el tratamiento de datos personales no se basa en el consentimiento del titular, ¿la organización identifica, documenta y puede acreditar claramente la base legal aplicable (obligación legal, contrato, interés legítimo u otra), y verifica que el tratamiento se ajuste estrictamente a dicha base?" },
      { id: 6, peso: 8, pregunta: "Cuando la organización basa el tratamiento en interés legítimo, ¿existe una evaluación documentada que identifique dicho interés, analice su prevalencia frente a los derechos del titular, y garantice que el titular puede ser informado adecuadamente sobre este fundamento?" },
      { id: 7, peso: 9, pregunta: "¿El responsable mantiene antecedentes documentados, actualizados y accesibles que permitan acreditar la licitud de cada tratamiento, y puede entregarlos de forma oportuna ante solicitudes de titulares o fiscalizaciones de la autoridad?" },
      { id: 8, peso: 7, pregunta: "¿La organización cuenta con procedimientos formales que aseguren que los datos personales se recolectan únicamente desde fuentes lícitas, para fines determinados, y que su tratamiento se limita estrictamente a dichos fines?" },
      { id: 9, peso: 7, pregunta: "Antes de comunicar o ceder datos personales a terceros, ¿la organización verifica y documenta que los datos sean exactos, completos y actualizados, y mantiene evidencia de dicha validación?" },
      { id: 10, peso: 6, pregunta: "Cuando los datos personales son recolectados en una fase precontractual, ¿existen reglas formales y aplicadas para su supresión o anonimización cuando no se concreta la relación contractual o cesa la finalidad que justificó su tratamiento?" },
      { id: 11, peso: 8, pregunta: "¿La organización cuenta con una política de tratamiento de datos personales formal, publicada, vigente y con control de versiones, que describa de manera clara y accesible cómo se tratan los datos personales?" },
      { id: 12, peso: 7, pregunta: "¿La política de tratamiento identifica claramente al responsable del tratamiento, su representante legal cuando corresponda y los medios de contacto válidos para ejercer derechos conforme a la ley?" },
      { id: 13, peso: 9, pregunta: "¿La organización dispone de un canal operativo, permanente y de fácil acceso para que los titulares ejerzan sus derechos, y puede acreditar tiempos de respuesta, gestión y cierre de solicitudes conforme a la ley?" },
      { id: 14, peso: 8, pregunta: "¿La organización informa de forma clara, completa y accesible a los titulares sobre las finalidades del tratamiento, categorías de datos, destinatarios, base de licitud, y, cuando corresponda, el interés legítimo invocado?" },
      { id: 15, peso: 6, pregunta: "¿La política de tratamiento describe las medidas de seguridad adoptadas para proteger los datos personales, al menos a nivel de estándares y principios, y se mantiene actualizada conforme a la evolución de los riesgos?" },
      { id: 16, peso: 9, pregunta: "¿La organización informa claramente a los titulares sobre sus derechos de acceso, rectificación, supresión, oposición y portabilidad, y sobre su derecho a reclamar ante la Agencia, y puede acreditar la gestión oportuna de dichas solicitudes?" },
      { id: 17, peso: 8, pregunta: "¿La organización informa y aplica plazos de conservación definidos para cada tratamiento de datos personales, y puede demostrar su cumplimiento efectivo mediante procesos de supresión o anonimización?" },
      { id: 18, peso: 8, pregunta: "Cuando existen transferencias internacionales de datos personales, ¿la organización informa esta circunstancia y verifica/documenta que el país de destino ofrezca un nivel adecuado de protección o que existan garantías legales equivalentes?" },
      { id: 19, peso: 6, pregunta: "¿La organización identifica e informa el origen o fuente de los datos personales tratados, incluyendo si provienen de fuentes de acceso público, y mantiene dicha información actualizada y verificable?" },
      { id: 20, peso: 9, pregunta: "Cuando existen decisiones automatizadas o elaboración de perfiles que produzcan efectos jurídicos o significativos, ¿la organización informa su existencia, la lógica general involucrada y las consecuencias previstas, y mantiene evidencia de dicha información?" },
      { id: 21, peso: 9, pregunta: "¿La organización incorpora protección de datos desde el diseño (privacy by design) en proyectos y sistemas nuevos, y puede acreditar que se evaluaron y aplicaron medidas técnicas y organizativas proporcionales al riesgo?" },
      { id: 22, peso: 8, pregunta: "¿Las configuraciones por defecto de sistemas y procesos garantizan que solo se traten los datos personales estrictamente necesarios en cuanto a volumen, acceso, plazo de conservación y difusión, sin requerir intervención manual posterior?" },
      { id: 23, peso: 8, pregunta: "¿La organización cuenta con políticas y controles formales que aseguren el deber de secreto y confidencialidad respecto de los datos personales, aplicables a trabajadores, colaboradores y terceros, incluso después del término de la relación que dio origen al tratamiento?" },
      { id: 24, peso: 9, pregunta: "¿La organización adopta medidas técnicas y organizativas apropiadas para garantizar la confidencialidad, integridad, disponibilidad y resiliencia de los datos personales, evitando accesos o tratamientos no autorizados, pérdida o destrucción, y puede acreditar dichas medidas según el riesgo?" },
      { id: 25, peso: 8, pregunta: "Cuando el riesgo lo requiere, ¿la organización implementa cifrado y/o seudonimización de los datos personales, mantiene evidencia técnica verificable de su correcta aplicación y revisa periódicamente su eficacia?" },
      { id: 26, peso: 8, pregunta: "¿La organización cuenta con la capacidad documentada y probada para restaurar la disponibilidad y el acceso a los datos personales ante incidentes, y realiza verificaciones y evaluaciones periódicas de la eficacia de las medidas de seguridad implementadas?" },
      { id: 27, peso: 9, pregunta: "¿La organización puede acreditar documental y técnicamente que las medidas de seguridad adoptadas son adecuadas al riesgo, considerando el estado de la técnica y el contexto del tratamiento, cumpliendo con la carga probatoria que impone la ley al responsable?" },
      { id: 28, peso: 10, pregunta: "¿Existe un procedimiento formal para notificar a la Agencia de Protección de Datos las brechas de seguridad en los plazos legales, y puede acreditarse su aplicación efectiva ante un incidente real?" },
      { id: 29, peso: 8, pregunta: "¿La organización mantiene un registro completo y actualizado de los incidentes de seguridad, que incluya su naturaleza, efectos, categorías de datos afectados, número aproximado de titulares, y las medidas adoptadas para gestionar el incidente y prevenir su repetición?" },
      { id: 30, peso: 9, pregunta: "Cuando un incidente involucra datos sensibles, datos de menores de 14 años o datos económicos, financieros o comerciales, ¿la organización notifica oportunamente a los titulares o sus representantes, en lenguaje claro, informando los datos comprometidos, posibles consecuencias y medidas adoptadas?" },
      { id: 31, peso: 9, pregunta: "Cuando se ceden datos a terceros o se contratan encargados del tratamiento, ¿la organización formaliza el acuerdo por escrito estableciendo finalidad, instrucciones, confidencialidad y prohibición de usos no autorizados, y controla su cumplimiento?" },
      { id: 32, peso: 7, pregunta: "¿La organización clasifica y gestiona sus tratamientos de datos personales considerando tipo de datos, volumen, número de titulares, actividad, finalidad y riesgos, y ajusta proporcionalmente sus medidas de información, seguridad y gestión conforme a dicha clasificación?" }
    ]
  },
  {
    id: 'INFRA',
    name: 'Continuidad Operacional (Infraestructura)',
    description: 'Resiliencia de la infraestructura física: seguridad de acceso, climatización, respaldo eléctrico y conectividad.',
    objetivo: 'Verificar que los equipos, instalaciones y redes que soportan el proceso estén protegidos contra fallas físicas. Evalúa: sala de datos, energía (UPS/generador), climatización, conectividad redundante y respaldo de grabaciones de seguridad.',
    icon: 'Server',
    questions: [
      { id: 1, peso: 8, pregunta: "¿La organización dispone de una sala dedicada y físicamente delimitada para alojar servidores, equipos de red, firewall, sistemas de respaldo y NVR/DVR, separada de oficinas, bodegas u otras áreas no controladas?" },
      { id: 2, peso: 9, pregunta: "¿El acceso a la sala de datos se encuentra restringido exclusivamente a personal autorizado, mediante mecanismos de control físico efectivos que impidan el ingreso de terceros no autorizados?" },
      { id: 3, peso: 7, pregunta: "¿Existe un registro verificable de accesos físicos a la sala de equipos que permita identificar quién accedió, en qué fecha y con qué propósito, conservándose dicha información por un período razonable?" },
      { id: 4, peso: 9, pregunta: "¿La sala de datos cuenta con un sistema de detección temprana de humo o incendio, operativo y ubicado estratégicamente para alertar de manera oportuna ante un inicio de siniestro?" },
      { id: 5, peso: 9, pregunta: "¿La sala de equipos dispone de un sistema de extinción de incendios adecuado para equipamiento electrónico (por ejemplo, agente limpio u otro equivalente), instalado y en condiciones operativas?" },
      { id: 6, peso: 7, pregunta: "¿La sala de datos cuenta con sensores de temperatura y humedad operativos, ubicados adecuadamente, que permitan detectar condiciones fuera de rango antes de que afecten el funcionamiento de los equipos?" },
      { id: 7, peso: 8, pregunta: "¿La sala de equipos dispone de un sistema de climatización dedicado, independiente de áreas comunes, que mantenga temperatura y ventilación adecuadas para la operación continua de los equipos críticos?" },
      { id: 8, peso: 7, pregunta: "¿Existe un sistema de monitoreo ambiental que genere alertas automáticas ante fallas de temperatura o humedad, y que dichas alertas sean recibidas y atendidas oportunamente?" },
      { id: 9, peso: 9, pregunta: "¿Los servidores, equipos de red, firewall, NVR/DVR y sistemas críticos se encuentran conectados a UPS correctamente dimensionados, en buen estado y en operación?" },
      { id: 10, peso: 8, pregunta: "¿La autonomía del sistema de respaldo eléctrico es suficiente para soportar cortes de energía, y se verifica periódicamente mediante pruebas controladas?" },
      { id: 11, peso: 7, pregunta: "¿La sala de datos cuenta con una distribución eléctrica dedicada, con circuitos identificados y protegidos, evitando sobrecargas o cortes accidentales que afecten a los equipos críticos?" },
      { id: 12, peso: 6, pregunta: "¿La infraestructura eléctrica dispone de protección contra sobretensiones y variaciones de voltaje, reduciendo el riesgo de daño a servidores y equipos de comunicaciones?" },
      { id: 13, peso: 8, pregunta: "¿La organización dispone de una fuente alternativa de energía (por ejemplo, grupo electrógeno u otro mecanismo equivalente) que permita mantener la operación de los sistemas críticos ante cortes eléctricos prolongados?" },
      { id: 14, peso: 7, pregunta: "¿El sistema de respaldo eléctrico (UPS y/o generador) es probado periódicamente, verificando su correcto funcionamiento y capacidad real de soporte?" },
      { id: 15, peso: 7, pregunta: "¿Los circuitos eléctricos críticos de la sala de equipos se encuentran claramente identificados y documentados, facilitando su operación, mantenimiento y recuperación ante incidentes?" },
      { id: 16, peso: 8, pregunta: "¿La organización cuenta con un firewall perimetral dedicado, instalado en la sala de datos, que actúe como punto único de control del tráfico externo y permanezca operativo de forma continua?" },
      { id: 17, peso: 9, pregunta: "¿El firewall perimetral se encuentra configurado en alta disponibilidad (activo/activo o activo/pasivo), de modo que la falla de un equipo no provoque la caída total de la conectividad?" },
      { id: 18, peso: 8, pregunta: "¿Los switches críticos de la red (core o distribución) se encuentran correctamente instalados en la sala de equipos, protegidos físicamente y en operación continua?" },
      { id: 19, peso: 9, pregunta: "¿Los switches críticos cuentan con alta disponibilidad, stack o enlaces redundantes, evitando que la falla de un solo equipo deje inoperante la red interna?" },
      { id: 20, peso: 9, pregunta: "¿La organización dispone de dos o más enlaces de Internet independientes, preferentemente de distintos proveedores, que permitan mantener la conectividad ante la caída del enlace principal?" },
      { id: 21, peso: 9, pregunta: "¿Existe un mecanismo de conmutación automática (failover) que permita cambiar al enlace secundario de Internet sin intervención manual cuando el enlace principal falla, manteniendo la continuidad del servicio?" },
      { id: 22, peso: 9, pregunta: "¿La organización mantiene respaldos de los datos críticos en la nube, almacenados fuera de la sala de datos, que permitan la recuperación de la información ante incendios, robos o pérdida total del sitio?" },
      { id: 23, peso: 8, pregunta: "¿Los respaldos, tanto locales como en la nube, se encuentran cifrados en tránsito y en reposo, con controles de acceso que impidan su eliminación, modificación o uso no autorizado?" },
      { id: 24, peso: 8, pregunta: "¿El sistema de cámaras de seguridad (CCTV) cuenta con una red dedicada o segmentada, enlaces estables y respaldo eléctrico que aseguren la transmisión continua de las imágenes aun ante incidentes eléctricos o de red?" },
      { id: 25, peso: 9, pregunta: "¿Las grabaciones de CCTV se almacenan en NVR/DVR protegidos físicamente, con retención definida y respaldo (local o en la nube), permitiendo su recuperación ante fallas, robos o incidentes?" }
    ]
  },
  {
    id: 'VENDOR',
    name: 'Proveedores (Cadena de Suministro)',
    description: 'Análisis del nivel de dependencia y riesgo asociado a proveedores externos de servicios tecnológicos.',
    objetivo: 'Evaluar qué tan expuesta está la organización ante la falla o salida de un proveedor clave. Analiza: criticidad del servicio, posibilidad de migrar los datos, cláusulas contractuales de salida y tiempo real de reemplazo.',
    icon: 'Truck',
    questions: [
      { id: 1, peso: 5, pregunta: "¿Qué tan crítico es este proveedor para la continuidad del negocio (según el proceso que soporta)?", opciones: [{ texto: "Crítico: detiene el core del negocio", valor: 0.0 }, { texto: "Alto: afecta fuertemente la operación", valor: 0.3 }, { texto: "Medio: afecta, pero se puede operar con ajustes", valor: 0.7 }, { texto: "Bajo: su caída casi no afecta", valor: 1.0 }, NA_OPTION] },
      { id: 2, peso: 4, pregunta: "¿Qué tipo de proceso soporta principalmente este proveedor?", opciones: [{ texto: "Core del negocio (servicio principal/ingresos)", valor: 0.0 }, { texto: "Operativo (operación diaria, producción/servicio)", valor: 0.3 }, { texto: "Financiero (pagos, facturación, contabilidad)", valor: 0.5 }, { texto: "Comercial (ventas, marketing, atención comercial)", valor: 0.7 }, { texto: "Soporte (RRHH, administración, soporte interno)", valor: 1.0 }, NA_OPTION] },
      { id: 3, peso: 4, pregunta: "Si este proveedor falla, ¿impacta directamente a clientes externos?", opciones: [{ texto: "Sí, impacto crítico (no se puede atender/operar)", valor: 0.0 }, { texto: "Sí, impacto relevante (caída parcial del servicio)", valor: 0.3 }, { texto: "Sí, impacto menor (molestias, retrasos)", valor: 0.7 }, { texto: "No, solo impacto interno", valor: 1.0 }, NA_OPTION] },
      { id: 4, peso: 3, pregunta: "¿El proveedor es necesario para cumplir obligaciones legales/contractuales del negocio?", opciones: [{ texto: "Sí, de forma directa (sin esto no se cumple)", valor: 0.0 }, { texto: "Sí, de forma indirecta (apoya evidencias/operación)", valor: 0.5 }, { texto: "No", valor: 1.0 }, NA_OPTION] },
      { id: 5, peso: 5, pregunta: "Si el proveedor deja de prestar el servicio hoy, ¿qué ocurre operativamente?", opciones: [{ texto: "Se detiene totalmente", valor: 0.0 }, { texto: "Se detiene parcialmente", valor: 0.3 }, { texto: "Se degrada, pero se mantiene funcionando", valor: 0.7 }, { texto: "No afecta la operación", valor: 1.0 }, NA_OPTION] },
      { id: 6, peso: 4, pregunta: "¿Existe una alternativa manual u operativa que permita seguir funcionando si el proveedor no está disponible?", opciones: [{ texto: "No existe ninguna alternativa", valor: 0.0 }, { texto: "Sí, pero toma más de 24 horas activarla", valor: 0.2 }, { texto: "Sí, parcial (solo funciones básicas)", valor: 0.5 }, { texto: "Sí, completa e inmediata", valor: 1.0 }, NA_OPTION] },
      { id: 7, peso: 5, pregunta: "¿Cuánto tiempo máximo puede operar la organización sin este proveedor antes de un impacto grave?", opciones: [{ texto: "Menos de 24 horas / no puede operar", valor: 0.0 }, { texto: "1 a 6 días", valor: 0.3 }, { texto: "7 a 30 días", valor: 0.7 }, { texto: "Más de 30 días", valor: 1.0 }, NA_OPTION] },
      { id: 8, peso: 4, pregunta: "¿La caída de este proveedor genera efectos en cascada (otros procesos/sistemas se ven afectados)?", opciones: [{ texto: "Sí, efectos severos (cadena completa)", valor: 0.0 }, { texto: "Sí, efectos relevantes", valor: 0.3 }, { texto: "Sí, efectos limitados", valor: 0.7 }, { texto: "No", valor: 1.0 }, NA_OPTION] },
      { id: 9, peso: 5, pregunta: "¿Los datos gestionados por el proveedor pueden exportarse completa y fácilmente en formatos estándar (CSV/JSON/SQL u otros)?", opciones: [{ texto: "No: no es exportable o no está disponible", valor: 0.0 }, { texto: "Difícil: exporta, pero en formato propietario / poco usable", valor: 0.2 }, { texto: "Parcial: exporta, pero falta parte relevante", valor: 0.5 }, { texto: "Sí, exportación completa y estándar", valor: 1.0 }, NA_OPTION] },
      { id: 10, peso: 4, pregunta: "En caso de migrar, ¿la organización puede reconstruir su operación con esos datos (sin perder trazabilidad/histórico crítico)?", opciones: [{ texto: "No, se pierde información clave", valor: 0.0 }, { texto: "Parcial: con pérdida menor aceptable", valor: 0.5 }, { texto: "Sí, sin pérdida relevante", valor: 1.0 }, NA_OPTION] },
      { id: 11, peso: 4, pregunta: "¿El proveedor está integrado con otros sistemas críticos (ERP, correo, identidad, pagos, APIs)?", opciones: [{ texto: "Sí, integraciones críticas y complejas (dependencia alta)", valor: 0.0 }, { texto: "Sí, varias integraciones relevantes", valor: 0.4 }, { texto: "Sí, 1–2 integraciones simples", valor: 0.8 }, { texto: "No", valor: 1.0 }, NA_OPTION] },
      { id: 12, peso: 4, pregunta: "¿Existe documentación técnica suficiente para migrar (integraciones, flujos, APIs, configuración, dependencias)?", opciones: [{ texto: "No existe o está desactualizada", valor: 0.0 }, { texto: "Parcial, requiere trabajo adicional", valor: 0.5 }, { texto: "Sí, completa y actualizada", valor: 1.0 }, NA_OPTION] },
      { id: 13, peso: 4, pregunta: "¿El contrato contempla una cláusula de salida (término, rescisión) clara y ejecutable?", opciones: [{ texto: "No existe", valor: 0.0 }, { texto: "Sí, pero con restricciones importantes", valor: 0.5 }, { texto: "Sí, clara y ejecutable", valor: 1.0 }, NA_OPTION] },
      { id: 14, peso: 3, pregunta: "¿Existen penalidades económicas por término anticipado que desincentiven salir?", opciones: [{ texto: "Sí, altas (impide salida práctica)", valor: 0.0 }, { texto: "Sí, medias (impacto relevante)", valor: 0.4 }, { texto: "Sí, bajas (monto asumible)", valor: 0.8 }, { texto: "No", valor: 1.0 }, NA_OPTION] },
      { id: 15, peso: 3, pregunta: "¿Cuál es el plazo mínimo de aviso para terminar el contrato?", opciones: [{ texto: "Más de 90 días", valor: 0.2 }, { texto: "30 a 90 días", valor: 0.6 }, { texto: "Menos de 30 días", valor: 1.0 }, NA_OPTION] },
      { id: 16, peso: 4, pregunta: "¿El contrato regula explícitamente devolución/portabilidad/eliminación de datos al término?", opciones: [{ texto: "No (no está regulado)", valor: 0.0 }, { texto: "Parcial (menciona, pero sin detalle)", valor: 0.5 }, { texto: "Sí, claro y específico (plazos y formato)", valor: 1.0 }, NA_OPTION] },
      { id: 17, peso: 4, pregunta: "¿Existe un proveedor alternativo viable en el mercado que cumpla lo esencial?", opciones: [{ texto: "No existe alternativa viable", valor: 0.0 }, { texto: "Difícil: existen, pero no cumplen requisitos clave", valor: 0.3 }, { texto: "Sí, hay uno o dos, pero con diferencias relevantes", valor: 0.7 }, { texto: "Sí, hay varios equivalentes", valor: 1.0 }, NA_OPTION] },
      { id: 18, peso: 5, pregunta: "¿Cuál es el tiempo real estimado de reemplazo (evaluación + contrato + migración + puesta en marcha)?", opciones: [{ texto: "Más de 6 meses", valor: 0.0 }, { texto: "3 a 6 meses", valor: 0.3 }, { texto: "1 a 3 meses", valor: 0.7 }, { texto: "Menos de 1 mes", valor: 1.0 }, NA_OPTION] },
      { id: 19, peso: 4, pregunta: "¿Cuál sería el impacto global del cambio de proveedor (operación, usuarios, clientes, formación, fallas esperables)?", opciones: [{ texto: "Crítico", valor: 0.0 }, { texto: "Alto", valor: 0.3 }, { texto: "Medio", valor: 0.7 }, { texto: "Bajo", valor: 1.0 }, NA_OPTION] },
      { id: 20, peso: 5, pregunta: "Considerando todo lo anterior, ¿qué tan “atrapada” está la organización con este proveedor hoy?", opciones: [{ texto: "Crítica (salida impracticable en el corto plazo)", valor: 0.0 }, { texto: "Alta (salida compleja, riesgo significativo)", valor: 0.3 }, { texto: "Media (salida posible con planificación)", valor: 0.7 }, { texto: "Baja (salida factible sin trauma)", valor: 1.0 }, NA_OPTION] }
    ]
  },
  {
    id: 'PEOPLE',
    name: 'Personas (Bus Factor Humano)',
    description: 'Identificación de personas clave cuya ausencia podría detener o degradar la operación.',
    objetivo: 'Detectar si la organización depende de una o pocas personas para funcionar. El objetivo es asegurar que ningún rol sea indispensable: que exista documentación, respaldo y planes de continuidad ante la ausencia de cualquier persona clave.',
    icon: 'Users',
    questions: [
      { id: 1, peso: 5, pregunta: "Considerando la operación real del negocio, ¿qué tan crítico es este rol para que los procesos esenciales funcionen sin interrupción?", opciones: [{ texto: "Crítico: su ausencia detiene total o parcialmente procesos clave", valor: 0.0 }, { texto: "Alto: afecta fuertemente y genera retrasos o degradación relevante", valor: 0.3 }, { texto: "Medio: afecta, pero se puede operar con ajustes menores", valor: 0.7 }, { texto: "Bajo: su ausencia no afecta procesos esenciales", valor: 1.0 }, NA_OPTION] },
      { id: 2, peso: 4, pregunta: "¿Qué tipo de procesos del negocio dependen principalmente de este rol (por frecuencia e impacto)?", opciones: [{ texto: "Core del negocio (servicio principal/ingresos)", valor: 0.0 }, { texto: "Operativo (operación diaria, producción/servicio)", valor: 0.3 }, { texto: "Financiero (facturación, pagos, contabilidad)", valor: 0.5 }, { texto: "Comercial (ventas, atención, marketing)", valor: 0.7 }, { texto: "Soporte (administración, RRHH, soporte interno)", valor: 1.0 }, NA_OPTION] },
      { id: 3, peso: 3, pregunta: "¿Cuál es el tipo de vínculo que tiene este rol con la organización?", opciones: [{ texto: "Externo crítico (tercero clave, difícil de sustituir en el corto plazo)", valor: 0.0 }, { texto: "Proveedor (depende de contrato con tercero)", valor: 0.7 }, { texto: "Interno (empleado o función interna)", valor: 1.0 }, NA_OPTION] },
      { id: 4, peso: 5, pregunta: "¿Existe documentación clara de cómo ejecutar este rol, de forma que otra persona pueda asumir las tareas sin depender del titular?", opciones: [{ texto: "No: no existe documentación o no es utilizable en la práctica", valor: 0.0 }, { texto: "Parcial: existe documentación, pero incompleta o desactualizada", valor: 0.5 }, { texto: "Sí, documentación completa, clara y actualizada", valor: 1.0 }, NA_OPTION] },
      { id: 5, peso: 5, pregunta: "Si este rol quedara ausente mañana, ¿otra persona podría asumirlo sin apoyo directo del titular?", opciones: [{ texto: "No, no hay capacidad interna para asumirlo", valor: 0.0 }, { texto: "Sí, pero requiere apoyo inicial o tutoría", valor: 0.5 }, { texto: "Sí, inmediatamente (misma calidad y ritmo de trabajo)", valor: 1.0 }, NA_OPTION] },
      { id: 6, peso: 4, pregunta: "¿En qué medida el desempeño del rol depende de experiencia o conocimiento personal que no está documentado ni traspasado a otros?", opciones: [{ texto: "Crítico: sin esa experiencia no se puede operar correctamente", valor: 0.0 }, { texto: "Alto: el rol depende principalmente de conocimiento tácito", valor: 0.2 }, { texto: "Medio: hay componentes clave que dependen de la experiencia", valor: 0.5 }, { texto: "Bajo: la mayor parte está estandarizada", valor: 1.0 }, NA_OPTION] },
      { id: 7, peso: 5, pregunta: "¿Este rol posee accesos privilegiados a sistemas críticos (administración, configuración, seguridad, plataformas SaaS, infraestructura)?", opciones: [{ texto: "Sí, y son accesos únicos o difíciles de recuperar", valor: 0.0 }, { texto: "Sí, pero existen reemplazos o mecanismos de recuperación", valor: 0.5 }, { texto: "No, no posee accesos privilegiados", valor: 1.0 }, NA_OPTION] },
      { id: 8, peso: 5, pregunta: "¿Este rol es el único que administra, configura o mantiene algún sistema crítico para el negocio?", opciones: [{ texto: "Sí: es el único con capacidad real de administración", valor: 0.0 }, { texto: "Parcial: hay respaldo, pero limitado o incompleto", valor: 0.5 }, { texto: "No: hay al menos dos personas con capacidad real", valor: 1.0 }, NA_OPTION] },
      { id: 9, peso: 4, pregunta: "¿Los accesos y credenciales asociados a este rol están controlados, documentados y pueden reasignarse sin riesgos ni demoras excesivas?", opciones: [{ texto: "No: no hay control/documentación o no es reasignable en la práctica", valor: 0.0 }, { texto: "Parcial: hay control, pero incompleto o informal", valor: 0.5 }, { texto: "Sí: existe control, registro y procedimiento de reasignación", valor: 1.0 }, NA_OPTION] },
      { id: 10, peso: 5, pregunta: "Si este rol no estuviera disponible, ¿qué ocurriría con el/los procesos que soporta en la operación real (no teórica)?", opciones: [{ texto: "El proceso se detiene totalmente", valor: 0.0 }, { texto: "El proceso se detiene parcialmente", valor: 0.3 }, { texto: "El proceso se ralentiza o se degrada, pero continúa", valor: 0.7 }, { texto: "No ocurre impacto relevante", valor: 1.0 }, NA_OPTION] },
      { id: 11, peso: 4, pregunta: "¿Existe dependencia exclusiva o dominante de este rol para ejecutar tareas críticas (decisiones, operación, validaciones, autorizaciones, continuidad)?", opciones: [{ texto: "Sí: el rol es indispensable para tareas críticas", valor: 0.0 }, { texto: "Parcial: hay tareas críticas donde este rol es dominante", valor: 0.5 }, { texto: "No: la dependencia está distribuida", valor: 1.0 }, NA_OPTION] },
      { id: 12, peso: 4, pregunta: "En condiciones reales, ¿cuánto tiempo tomaría recuperar la operación sin este rol (aunque sea en modo degradado)?", opciones: [{ texto: "Más de 3 días", valor: 0.2 }, { texto: "Entre 1 y 3 días", valor: 0.6 }, { texto: "Menos de 1 día", valor: 1.0 }, NA_OPTION] },
      { id: 13, peso: 4, pregunta: "¿Existe un plan formal para cubrir la ausencia del rol (reemplazo, turnos, back-up, externalización temporal)?", opciones: [{ texto: "No existe ningún plan", valor: 0.0 }, { texto: "Parcial: existe idea/plan informal", valor: 0.5 }, { texto: "Sí, plan formal y vigente", valor: 1.0 }, NA_OPTION] },
      { id: 14, peso: 4, pregunta: "¿Existe personal identificado (por nombre/rol) que pueda asumir este rol en caso de ausencia, con responsabilidades definidas?", opciones: [{ texto: "No existe personal identificado", valor: 0.0 }, { texto: "Parcial: existe 1 persona o respaldo incompleto", valor: 0.5 }, { texto: "Sí, al menos 2 personas identificadas y preparadas", valor: 1.0 }, NA_OPTION] },
      { id: 15, peso: 4, pregunta: "¿Cuánto tiempo real tomaría formar adecuadamente a un reemplazo para operar con autonomía?", opciones: [{ texto: "Más de 1 mes", valor: 0.2 }, { texto: "Entre 1 y 4 semanas", valor: 0.6 }, { texto: "Menos de 1 semana", valor: 1.0 }, NA_OPTION] },
      { id: 16, peso: 3, pregunta: "¿Se ha probado alguna vez la sustitución temporal (vacaciones, licencia, rotación) verificando que el rol puede ser cubierto sin crisis?", opciones: [{ texto: "No, nunca se ha probado", valor: 0.0 }, { texto: "Sí, probado pero con fallas relevantes", valor: 0.5 }, { texto: "Sí, probado con éxito", valor: 1.0 }, NA_OPTION] },
      { id: 17, peso: 5, pregunta: "Considerando conocimiento, accesos e impacto operativo, ¿qué tan dependiente es la organización de este rol hoy?", opciones: [{ texto: "Crítica (ausencia provoca crisis operativa)", valor: 0.0 }, { texto: "Alta (reemplazo complejo, riesgo significativo)", valor: 0.3 }, { texto: "Media (reemplazo posible con planificación)", valor: 0.7 }, { texto: "Baja (reemplazo factible sin trauma)", valor: 1.0 }, NA_OPTION] }
    ]
  }
];

export const ICONS: Record<string, React.ReactNode> = {
  Network: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  ShieldCheck: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Scale: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
  Server: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>,
  Truck: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1-1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>,
  Users: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  Layout: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  ChevronRight: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>,
  CheckCircle: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
};
