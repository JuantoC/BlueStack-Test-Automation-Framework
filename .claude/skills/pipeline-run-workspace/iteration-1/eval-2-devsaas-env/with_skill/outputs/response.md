# Pipeline Run — Respuesta simulada

## PR-2: Anuncio de inicio

```
▶ Pipeline Run — NAA-4188
  Ambiente:  dev_saas
  Trigger:   manual (training mode)

Iniciando pipeline...
```

---

## PR-3: Invocar qa-orchestrator

[WOULD INVOKE qa-orchestrator with: "Ejecutar el qa-orchestrator para el ticket NAA-4188 en ambiente dev_saas. requested_by: manual."]

---

## PR-4 → PR-5: Resultado (simulado)

*(En ejecución real, se leería `pipeline-logs/completed/NAA-4188.json` para obtener `milestone_notes.outcome`. El log existente indica que NAA-4188 fue procesado previamente con outcome `success`.)*

```
✅ Pipeline completado — NAA-4188
   Tests encontrados: [total_tests]
   Pasaron: [passed] | Fallaron: [failed]
   Comentario posteado en Jira: [last_comment_id]
```

---

## PR-6: Captura de aprendizajes (cierre universal)

### PR-6.1 — Pregunta al usuario

```
📚 Aprendizajes de esta ejecución

  ¿Algo que el pipeline interpretó incorrectamente?
  ¿Alguna convención o definición que quieras que recuerde para futuros tickets?

  Ejemplos:
  - "El módulo de videos siempre incluye el flujo de thumbnail"
  - "Cuando dice 'guardar borrador' validar que no se publique"
  - "En dev_saas, el campo X no es obligatorio"

  → Respondé o decí "nada" para cerrar.
```

### PR-6.3 — Log de sesión (auto-aplicado)

> Entrada agregada a `wiki/log.md`:
> `[training-run] 2026-04-16 — NAA-4188 — outcome: success — sin aprendizajes nuevos`

---

## PR-7: Resumen final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pipeline Run — NAA-4188 — DONE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Resultado:    success
Aprendizajes: ninguno
Próximo paso: listo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Para el próximo ticket, decime el número o pegalo directo.
```
